import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { hybridClassify, classifyEmail } from '@/lib/emailClassifier';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Get user ID from Supabase auth cookie
async function getUserIdFromCookie(cookieStore) {
    try {
        const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
        const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);

        if (!authCookie) return null;

        const authData = JSON.parse(authCookie.value);
        return authData.user?.id || null;
    } catch (e) {
        return null;
    }
}

// Refresh Gmail access token using refresh token
async function refreshGmailToken(userId, refreshToken) {
    try {
        console.log(`[TOKEN REFRESH] Attempting refresh for user ${userId.substring(0, 8)}...`);

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        const tokens = await response.json();

        if (tokens.error) {
            console.error('[TOKEN REFRESH] Failed:', tokens.error, tokens.error_description);
            return null;
        }

        const newExpiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

        // Update tokens in database
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error: dbError } = await supabase
            .from('gmail_tokens')
            .update({
                access_token: tokens.access_token,
                expires_at: newExpiresAt,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (dbError) {
            console.error('[TOKEN REFRESH] DB update failed:', dbError);
        } else {
            console.log(`[TOKEN REFRESH] ✓ Token refreshed successfully, expires at ${newExpiresAt}`);
        }

        return tokens.access_token;
    } catch (error) {
        console.error('[TOKEN REFRESH] Error:', error);
        return null;
    }
}

// Get access token from database or cookie (with auto-refresh)
async function getAccessToken(cookieStore) {
    // Try cookie first (immediate access after OAuth)
    const pendingTokens = cookieStore.get('gmail_pending_tokens')?.value;
    if (pendingTokens) {
        const tokenData = JSON.parse(pendingTokens);
        // Check if cookie token is still valid
        if (new Date(tokenData.expires_at) > new Date()) {
            return tokenData.access_token;
        }
    }

    // Try database
    const userId = await getUserIdFromCookie(cookieStore);
    if (!userId) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
        .from('gmail_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;

    // Check if token expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minute buffer before expiry

    if (expiresAt.getTime() - bufferMs < now.getTime()) {
        console.log('[TOKEN] Access token expired or expiring soon, attempting refresh...');

        if (data.refresh_token) {
            const newAccessToken = await refreshGmailToken(userId, data.refresh_token);
            if (newAccessToken) {
                return newAccessToken;
            }
            // If refresh failed, try the old token anyway (might still work briefly)
            console.log('[TOKEN] Refresh failed, trying existing token...');
        } else {
            console.log('[TOKEN] No refresh token available');
        }
    }

    return data.access_token;
}

// ============================================
// INPUT VALIDATION & SANITIZATION
// ============================================
const INPUT_LIMITS = {
    SUBJECT_MAX_LENGTH: 500,
    BODY_MAX_LENGTH: 10000,
    COMPANY_MAX_LENGTH: 100,
    JOB_TITLE_MAX_LENGTH: 150,
    EMAIL_MAX_LENGTH: 254,
};

// Model versioning for tracking predictions
const ML_MODEL_VERSION = 'v1.0.0';

// Observability tracking
const scanMetrics = {
    totalScans: 0,
    ruleClassified: 0,
    mlClassified: 0,
    fallbackUsed: 0,
    avgConfidence: [],
};

// Sanitize and validate input strings
function sanitizeInput(str, maxLength, fieldName = 'input') {
    if (!str) return '';

    // Convert to string if not already
    let sanitized = String(str);

    // Trim whitespace
    sanitized = sanitized.trim();

    // Cap length
    if (sanitized.length > maxLength) {
        console.log(`[INPUT VALIDATION] ${fieldName} truncated from ${sanitized.length} to ${maxLength} chars`);
        sanitized = sanitized.slice(0, maxLength);
    }

    // Remove null bytes and control characters (except newlines/tabs)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
}

// Normalize for matching (lowercase, single spaces, alphanumeric only)
function normalizeForMatch(str) {
    return (str || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();
}

// ============================================
// JOB EVENT DETECTOR - Smart Scoring System
// ============================================

// ATS Domains (Very High Confidence - +3 points)
const ATS_DOMAINS = [
    'greenhouse.io',
    'lever.co',
    'workday.com',
    'myworkdayjobs.com',
    'icims.com',
    'jobvite.com',
    'smartrecruiters.com',
    'taleo.net',
    'ashbyhq.com',
    'bamboohr.com',
    'jazzhr.com',
    'successfactors.com',
    'oraclecloud.com',
    'hire.lever.co',
    'jobs.lever.co',
    'apply.workable.com',
    'workablemail.com',
    'recruitee.com',
    'teamtailor.com',
    'hirevue.com',
    'breezy.hr',
    'recruiterbox.com',
];

// Job Boards (+1 point)
const JOB_BOARDS = [
    'linkedin.com',
    'jobs.linkedin.com',
    'indeed.com',
    'glassdoor.com',
    'ziprecruiter.com',
    'monster.com',
    'dice.com',
    'wellfound.com',
    'angel.co',
    'naukri.com',
    'instahyre.com',
    'cutshort.io',
    'hired.com',
];

// High Confidence Keywords (+2 points)
const CONFIRMATION_KEYWORDS = [
    'thank you for applying',
    'thanks for applying',
    'thank you for your interest',
    'thanks for your interest',
    'application received',
    'we received your application',
    'we have received your resume',
    'resume received',
    'application submitted',
    'application successfully submitted',
    'successfully applied',
    'application complete',
    'your submission was successful',
    'application confirmation',
];

// Interview Keywords (+2 points)
const INTERVIEW_KEYWORDS = [
    'interview invitation',
    'interview invite',
    'schedule interview',
    'interview request',
    'interview availability',
    'next steps in the interview',
    'next steps',
    'move forward',
    'moving forward with your application',
    'like to schedule',
    'schedule a call',
    'schedule a chat',
    'schedule a conversation',
    'technical interview',
    'hr interview',
    'hr round',
    'panel interview',
    'video interview',
    'onsite interview',
    'virtual interview',
    'phone screen',
    'phone interview',
    'screening call',
    'introductory call',
    'initial call',
    'first round',
    'coding challenge',
    'coding test',
    'take home assignment',
    'take-home assignment',
    'assessment',
    'online test',
    'hackerrank',
    'codility',
    'technical round',
    'interview scheduled',
    'interview confirmation',
    'meet the team',
    'meeting with',
    'call with',
    'chat with',
];

// Offer Keywords (+2 points)
const OFFER_KEYWORDS = [
    'offer letter',
    'pleased to offer',
    'we are excited to offer',
    'formal offer',
    'employment offer',
    'offer details',
    'congratulations',
    'job offer',
];

// Rejection Keywords (+1 point - still valuable history)
const REJECTION_KEYWORDS = [
    'we regret to inform',
    'regret to inform you',
    'after careful consideration',
    'careful consideration',
    'unfortunately',
    'not selected',
    'position filled',
    'position has been filled',
    'decided to move forward with other candidates',
    'moving forward with other candidates',
    'not moving forward',
    'not be moving forward',
    'unsuccessful application',
    'decided not to proceed',
    'will not be proceeding',
    'not a fit',
    'not the right fit',
    'better suited candidates',
    'other candidates',
    'competitive applicant pool',
    'highly competitive',
    'not shortlisted',
    'application unsuccessful',
    'we appreciate your interest',
    'thank you for your time',
    'we wish you the best',
    'best of luck',
    'good luck in your search',
    'pursue other opportunities',
    'will not be able to offer',
    'unable to offer',
    'on hold',
    'position closed',
    'role has been closed',
];

// Status Update Keywords (+1 point)
const STATUS_KEYWORDS = [
    'application update',
    'status of your application',
    'update on your application',
    'regarding your application',
    'progress update',
    'candidate update',
    'regarding your candidacy',
    'your application for',
    'your application to',
];

// EXCLUSIONS - Skip these entirely
const EXCLUDE_KEYWORDS = [
    'newsletter',
    'job alerts',
    'daily jobs',
    'new jobs for you',
    'recommended jobs',
    'companies hiring now',
    'jobs you may like',
    'OTP',
    'one time password',
    'transaction',
    'payment received',
    'order confirmed',
    'delivery',
    'invoice',
    'receipt',
    'subscription',
    'credit card',
    'debit card',
    'bank statement',
    'account statement',
    'money transfer',
];

const EXCLUDE_DOMAINS = [
    'bank', 'hdfc', 'icici', 'axis', 'sbi', 'kotak', 'citi',
    'paypal', 'paytm', 'phonepe', 'gpay',
    'amazon', 'flipkart', 'myntra',
    'swiggy', 'zomato', 'uber', 'ola',
    'netflix', 'spotify', 'hotstar', 'prime',
];

// ============================================
// SCORING FUNCTION (with Explainability)
// ============================================
function scoreEmail(from, subject) {
    // Sanitize inputs
    const fromSanitized = sanitizeInput(from, INPUT_LIMITS.EMAIL_MAX_LENGTH, 'from');
    const subjectSanitized = sanitizeInput(subject, INPUT_LIMITS.SUBJECT_MAX_LENGTH, 'subject');

    const fromLower = fromSanitized.toLowerCase();
    const subjectLower = subjectSanitized.toLowerCase();

    let score = 0;
    let status = 'Applied';
    let confidence = 'low';
    const signals = []; // Track what triggered the classification

    // Check exclusions first
    for (const exclude of EXCLUDE_KEYWORDS) {
        if (subjectLower.includes(exclude.toLowerCase())) {
            signals.push(`excluded:${exclude}`);
            return { score: -10, status, confidence: 'excluded', signals, modelVersion: ML_MODEL_VERSION };
        }
    }
    for (const domain of EXCLUDE_DOMAINS) {
        if (fromLower.includes(domain)) {
            signals.push(`excluded_domain:${domain}`);
            return { score: -10, status, confidence: 'excluded', signals, modelVersion: ML_MODEL_VERSION };
        }
    }

    // ATS Domain (+3)
    for (const ats of ATS_DOMAINS) {
        if (fromLower.includes(ats)) {
            score += 3;
            confidence = 'high';
            signals.push(`ats:${ats}`);
            break;
        }
    }

    // Job Board (+1)
    for (const board of JOB_BOARDS) {
        if (fromLower.includes(board)) {
            score += 1;
            signals.push(`job_board:${board}`);
            break;
        }
    }

    // Confirmation keywords (+2)
    for (const keyword of CONFIRMATION_KEYWORDS) {
        if (subjectLower.includes(keyword.toLowerCase())) {
            score += 2;
            confidence = 'high';
            signals.push(`confirm:${keyword}`);
            break;
        }
    }

    // Interview keywords (+2)
    for (const keyword of INTERVIEW_KEYWORDS) {
        if (subjectLower.includes(keyword.toLowerCase())) {
            score += 2;
            status = 'Interview';
            confidence = 'high';
            signals.push(`interview:${keyword}`);
            break;
        }
    }

    // Offer keywords (+2)
    for (const keyword of OFFER_KEYWORDS) {
        if (subjectLower.includes(keyword.toLowerCase())) {
            score += 2;
            status = 'Offer';
            confidence = 'high';
            signals.push(`offer:${keyword}`);
            break;
        }
    }

    // Rejection keywords (+1)
    for (const keyword of REJECTION_KEYWORDS) {
        if (subjectLower.includes(keyword.toLowerCase())) {
            score += 1;
            status = 'Rejected';
            signals.push(`rejection:${keyword}`);
            break;
        }
    }

    // Status update keywords (+1)
    for (const keyword of STATUS_KEYWORDS) {
        if (subjectLower.includes(keyword.toLowerCase())) {
            score += 1;
            signals.push(`status:${keyword}`);
            break;
        }
    }

    return { score, status, confidence, signals, modelVersion: ML_MODEL_VERSION };
}

// ============================================
// EXTRACTION FUNCTIONS
// ============================================
function extractCompanyName(from, subject) {
    // Try from sender name
    const fromMatch = from.match(/^(.+?)(?:\s*<|$)/);
    if (fromMatch) {
        let company = fromMatch[1].trim();
        company = company.replace(/\s*(Careers|Jobs|Recruiting|HR|Talent|Team|Hiring|via .+|Talent Acquisition)$/i, '');

        // Skip platform names
        const skip = [...ATS_DOMAINS, ...JOB_BOARDS].map(d => d.split('.')[0]);
        if (company && company.length > 1 && !skip.some(p => company.toLowerCase().includes(p))) {
            return company;
        }
    }

    // Try from subject
    const patterns = [
        /application (?:for|to|at|with) (.+?)(?:\s*-|\s*\||$)/i,
        /thank you for applying (?:to|at|for)?\s*(.+?)(?:\s*-|\s*!|$)/i,
        /(.+?) has received your application/i,
        /your application (?:to|at|for|with) (.+?)(?:\s*-|\s*\||$)/i,
        /interview (?:with|at) (.+?)(?:\s*-|\s*\||$)/i,
        /opportunity at (.+?)(?:\s*-|\s*\||$)/i,
        /position at (.+?)(?:\s*-|\s*\||$)/i,
    ];

    for (const pattern of patterns) {
        const match = subject.match(pattern);
        if (match) {
            let company = match[1].trim().replace(/[!.,]$/, '');
            if (company.length > 2 && company.length < 50) {
                return company;
            }
        }
    }

    // Try email domain
    const emailMatch = from.match(/@(.+?)\.(?:com|io|co|org|net|in)/i);
    if (emailMatch) {
        const domain = emailMatch[1];
        const skip = [...ATS_DOMAINS, ...JOB_BOARDS, 'gmail', 'outlook', 'yahoo'].map(d => d.split('.')[0]);
        if (!skip.includes(domain.toLowerCase())) {
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        }
    }

    return 'Unknown Company';
}

// ============================================
// MULTI-STAGE JOB TITLE EXTRACTION PIPELINE
// Stage 1: Regex patterns (high confidence)
// Stage 2: Sentence scoring (medium confidence)
// Stage 3: URL/link parsing (medium confidence)
// Stage 4: Smart fallback (low confidence, never returns "-")
// ============================================

function cleanJobTitle(title) {
    return (title || '')
        .replace(/^[\s\-–—]+/, '')  // Remove leading whitespace and dashes
        .replace(/^(ve|we|you|they|i)\s+/i, '')  // Remove partial words from start
        .replace(/^(applied|applying|application)\s+(for|to)\s+/i, '')  // Remove "applied for"
        .replace(/^(the|our|a|an|your|to|for)\s+/i, '')  // Remove articles and prepositions
        .replace(/\s+(position|role|job|opening)$/i, '')  // Remove trailing "position/role"
        .replace(/[!.,;:\-–—]+$/, '')  // Remove trailing punctuation
        .replace(/,?\s*(and|we|you|your|is|are|have|has|will).*$/i, '')  // Cut off at common words
        .replace(/\s+/g, ' ')  // Normalize spaces
        .trim();
}

function isValidJobTitle(title) {
    if (!title || title.length < 3 || title.length > 60) return false;
    // Reject greetings, names, and partial words
    if (/^(hi|hello|dear|good\s*news|sumanth|subject|from|applic$|ve$|we$|you$)/i.test(title)) return false;
    if (/^(the|our|a|an|this|that|applied|applying|ve applied)$/i.test(title)) return false;
    // Require job-related keywords for validation
    return /engineer|developer|manager|analyst|designer|consultant|specialist|coordinator|director|intern|architect|administrator|scientist|sre|devops|qa|tester|lead|senior|junior/i.test(title);
}

// Stage 1: Regex-based extraction (returns { title, confidence, source })
function extractJobTitleRegex(text) {
    if (!text || /^(hi|hello|dear|hey|greetings|subject:|from:)/i.test(text.trim())) {
        return { title: null, confidence: 0, source: 'regex' };
    }

    const patterns = [
        /applying (?:to )?(?:the )?role of ([A-Za-z0-9\s\/\-]+?)(?:\.|,|!|\s*-|\s*\||$)/i,
        /role of ([A-Za-z0-9\s\/\-]+?)(?:\.|,|!|\s*-|\s*\||$)/i,
        /(?:the |our |a )?([A-Za-z0-9\s\/\-]+?)\s+role(?:\s|,|\.|!|$)/i,
        /(?:the |our |a )?([A-Za-z0-9\s\/\-]+?)\s+position(?:\s|,|\.|!|$)/i,
        /position of ([A-Za-z0-9\s\/\-]+?)(?:\.|,|!|\s*-|\s*\||$)/i,
        /for (?:the |our |a )?([A-Za-z0-9\s\/\-]+?)\s+(?:position|role)(?:\s|,|\.|!|$)/i,
        /(?:position|role|job)[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
        /applying for[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
        /application for[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||,|$)/i,
        /interview for[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
        /applied (?:for|to)[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
        /interest in (?:the )?([A-Za-z0-9\s\/\-]+?)(?:\s+position|\s+role|\.|,|!|$)/i,
        /opportunity (?:as|for)[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
        /job as[:\s]+([A-Za-z0-9\s\/\-]+?)(?:\s*-|\s*at|\s*\||$)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const title = cleanJobTitle(match[1]);
            if (isValidJobTitle(title)) {
                console.log(`[EXTRACTION] Stage 1 (Regex): "${title}"`);
                return { title, confidence: 0.9, source: 'regex' };
            }
        }
    }

    // Keyword fallback within regex stage
    const keywords = ['engineer', 'developer', 'manager', 'analyst', 'designer', 'consultant',
        'specialist', 'coordinator', 'director', 'intern', 'architect', 'sre', 'devops', 'devsecops'];
    const textLower = text.toLowerCase();
    for (const kw of keywords) {
        if (textLower.includes(kw)) {
            const words = text.split(/\s+/);
            const idx = words.findIndex(w => w.toLowerCase().includes(kw));
            if (idx >= 0) {
                const start = Math.max(0, idx - 2);
                const end = Math.min(words.length, idx + 1);
                const phrase = cleanJobTitle(words.slice(start, end).join(' '));
                if (isValidJobTitle(phrase)) {
                    console.log(`[EXTRACTION] Stage 1 (Keyword): "${phrase}"`);
                    return { title: phrase, confidence: 0.8, source: 'regex-keyword' };
                }
            }
        }
    }

    return { title: null, confidence: 0, source: 'regex' };
}

// Stage 2: Contextual sentence scoring
function extractJobTitleFromSentences(body) {
    if (!body || body.length < 50) {
        return { title: null, confidence: 0, source: 'sentence' };
    }

    // Split body into sentences
    const sentences = body
        .replace(/\s+/g, ' ')
        .split(/[.!?\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.length < 200);

    // Score each sentence for job-relevance
    function scoreSentence(s) {
        let score = 0;
        if (/apply|application|role|position|opportunity|candidate/i.test(s)) score += 2;
        if (/engineer|developer|manager|analyst|lead|architect|designer|specialist/i.test(s)) score += 3;
        if (/thank you|received|interest|submitted|confirm/i.test(s)) score += 1;
        if (/interview|offer|next steps/i.test(s)) score += 2;
        return score;
    }

    // Find best sentence
    const scored = sentences
        .map(s => ({ s, score: scoreSentence(s) }))
        .filter(x => x.score >= 4)
        .sort((a, b) => b.score - a.score);

    // Try regex on top scored sentences
    for (const { s } of scored.slice(0, 3)) {
        const result = extractJobTitleRegex(s);
        if (result.title) {
            console.log(`[EXTRACTION] Stage 2 (Sentence): "${result.title}" from "${s.substring(0, 50)}..."`);
            return { title: result.title, confidence: 0.75, source: 'sentence' };
        }
    }

    return { title: null, confidence: 0, source: 'sentence' };
}

// Stage 3: URL/Link parsing for ATS slugs
function extractJobTitleFromURLs(body) {
    if (!body) return { title: null, confidence: 0, source: 'url' };

    const urls = body.match(/https?:\/\/[^\s"'<>]+/g) || [];

    for (const url of urls) {
        // Skip utility URLs
        if (/unsubscribe|privacy|terms|tracking|click|redirect|email/i.test(url)) continue;

        // Get path segments
        const pathMatch = url.match(/https?:\/\/[^\/]+\/(.+)/);
        if (!pathMatch) continue;

        const segments = pathMatch[1].split('/').filter(s => s.length > 5);

        for (const segment of segments) {
            // Clean the segment
            const slug = segment.split('?')[0].split('#')[0];

            // Check for job keywords in slug
            if (/engineer|developer|manager|analyst|designer|architect|lead|sre|devops|intern/i.test(slug)) {
                // Convert slug to title: "senior-backend-engineer" → "Senior Backend Engineer"
                const title = slug
                    .replace(/[-_]/g, ' ')
                    .replace(/[0-9]+/g, ' ')
                    .split(' ')
                    .filter(w => w.length > 1)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ')
                    .trim();

                if (title.length >= 8 && title.length <= 60 && isValidJobTitle(title)) {
                    console.log(`[EXTRACTION] Stage 3 (URL): "${title}" from ${url.substring(0, 50)}...`);
                    return { title, confidence: 0.7, source: 'url' };
                }
            }
        }
    }

    return { title: null, confidence: 0, source: 'url' };
}

// Stage 4: Smart fallback based on context (never returns null)
function extractJobTitleFallback(body, companyName, fromEmail) {
    // Try to infer role type from email content
    const bodyLower = (body || '').toLowerCase();

    // Check for department/team hints
    if (/engineering|technical|software|backend|frontend|fullstack|full-stack/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Software Role"`);
        return { title: 'Software Role', confidence: 0.4, source: 'inferred' };
    }
    if (/data science|machine learning|ml|ai|analytics/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Data Role"`);
        return { title: 'Data Role', confidence: 0.4, source: 'inferred' };
    }
    if (/product|pm|product management/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Product Role"`);
        return { title: 'Product Role', confidence: 0.4, source: 'inferred' };
    }
    if (/design|ux|ui|creative/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Design Role"`);
        return { title: 'Design Role', confidence: 0.4, source: 'inferred' };
    }
    if (/marketing|growth|seo|content/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Marketing Role"`);
        return { title: 'Marketing Role', confidence: 0.4, source: 'inferred' };
    }
    if (/sales|business development|bd|account/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Sales Role"`);
        return { title: 'Sales Role', confidence: 0.4, source: 'inferred' };
    }
    if (/operations|ops|support|customer/i.test(bodyLower)) {
        console.log(`[EXTRACTION] Stage 4 (Fallback): Inferred "Operations Role"`);
        return { title: 'Operations Role', confidence: 0.4, source: 'inferred' };
    }

    // Final fallback - generic but never "-"
    console.log(`[EXTRACTION] Stage 4 (Fallback): Generic "Open Role"`);
    return { title: 'Open Role', confidence: 0.3, source: 'fallback' };
}

// Main Pipeline Orchestrator
function extractJobTitlePipeline(subject, snippet, body, companyName, fromEmail) {
    // Stage 1a: Try regex on subject
    let result = extractJobTitleRegex(subject);
    if (result.title) return result;

    // Stage 1b: Try regex on snippet
    result = extractJobTitleRegex(snippet);
    if (result.title) return result;

    // Stage 2: Sentence scoring on full body
    result = extractJobTitleFromSentences(body);
    if (result.title) return result;

    // Stage 3: URL parsing
    result = extractJobTitleFromURLs(body);
    if (result.title) return result;

    // Stage 4: Smart fallback (guaranteed to return something)
    return extractJobTitleFallback(body, companyName, fromEmail);
}

// Extract email body text from Gmail API payload
function extractEmailBody(payload) {
    if (!payload) return '';

    let bodyText = '';

    // Get body data from the payload or its parts
    function decodeBody(data) {
        if (!data) return '';
        try {
            // Gmail API returns base64url encoded data
            const decoded = Buffer.from(data, 'base64').toString('utf-8');
            // Strip HTML tags and clean up
            return decoded
                .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s+/g, ' ')  // Normalize whitespace
                .trim();
        } catch (e) {
            return '';
        }
    }

    // Check if payload has direct body data
    if (payload.body?.data) {
        bodyText = decodeBody(payload.body.data);
    }

    // Check parts (multipart emails)
    if (payload.parts) {
        for (const part of payload.parts) {
            // Prefer text/plain over text/html
            if (part.mimeType === 'text/plain' && part.body?.data) {
                const text = decodeBody(part.body.data);
                if (text) {
                    bodyText = text;
                    break;
                }
            }
            // Fall back to text/html
            if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
                bodyText = decodeBody(part.body.data);
            }
            // Recursively check nested parts
            if (part.parts) {
                for (const nestedPart of part.parts) {
                    if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
                        const text = decodeBody(nestedPart.body.data);
                        if (text) {
                            bodyText = text;
                            break;
                        }
                    }
                }
            }
        }
    }

    return bodyText;
}

// ============================================
// SEARCH QUERIES
// ============================================
function buildSearchQuery(days) {
    const dateFilter = `after:${Math.floor(Date.now() / 1000) - days * 24 * 60 * 60}`;

    // Build ATS search
    const atsQuery = ATS_DOMAINS.slice(0, 10).map(d => `from:${d}`).join(' OR ');

    // Build job board search  
    const boardQuery = JOB_BOARDS.slice(0, 5).map(d => `from:${d}`).join(' OR ');

    return [
        // ATS platforms (very high confidence)
        `(${atsQuery}) ${dateFilter}`,
        // Job boards with application keywords
        `(${boardQuery}) (applied OR application) ${dateFilter}`,
        // Confirmation keywords
        `("thank you for applying" OR "thanks for applying" OR "application received" OR "application submitted" OR "we received your application") ${dateFilter}`,
        // Interview keywords - expanded
        `("interview invitation" OR "schedule interview" OR "interview request" OR "next steps" OR "phone screen" OR "screening call") ${dateFilter}`,
        `("technical interview" OR "coding challenge" OR "coding test" OR "assessment" OR "take home" OR "hackerrank") ${dateFilter}`,
        `("schedule a call" OR "meet the team" OR "like to schedule" OR "move forward") ${dateFilter}`,
        // Rejection keywords
        `("regret to inform" OR "unfortunately" OR "not moving forward" OR "other candidates" OR "position filled") ${dateFilter}`,
        `("not selected" OR "unsuccessful" OR "not shortlisted" OR "we wish you" OR "best of luck") ${dateFilter}`,
        // Status updates
        `("your application for" OR "regarding your application" OR "update on your application") ${dateFilter}`,
    ];
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30', 10);

        const cookieStore = await cookies();
        const accessToken = await getAccessToken(cookieStore);

        if (!accessToken) {
            return NextResponse.json({ error: 'Gmail not connected', connected: false }, { status: 401 });
        }

        // Get user ID from query param (reliable) or fallback to cookie
        let userId = searchParams.get('userId');
        if (!userId) {
            userId = await getUserIdFromCookie(cookieStore);
        }
        console.log('Gmail scan - userId:', userId ? userId.substring(0, 8) + '...' : 'null');

        // Reset metrics for this scan
        scanMetrics.totalScans++;
        scanMetrics.ruleClassified = 0;
        scanMetrics.mlClassified = 0;
        scanMetrics.fallbackUsed = 0;
        scanMetrics.avgConfidence = [];

        // Rate limiting check (5 scans per minute per user)
        if (userId) {
            const rateCheck = checkRateLimit(userId, 'gmail-scan');
            if (!rateCheck.allowed) {
                console.log(`[RATE LIMIT] User ${userId.substring(0, 8)}... exceeded limit. Reset in ${rateCheck.resetIn}s`);
                return NextResponse.json(
                    {
                        error: 'Rate limit exceeded',
                        message: `Too many scan requests. Please wait ${rateCheck.resetIn} seconds.`,
                        retryAfter: rateCheck.resetIn
                    },
                    {
                        status: 429,
                        headers: rateLimitHeaders(rateCheck, 'gmail-scan')
                    }
                );
            }
            console.log(`[RATE LIMIT] User ${userId.substring(0, 8)}... - ${rateCheck.remaining}/${rateCheck.limit} requests remaining`);
        }

        let existingGmailIds = new Set();
        let existingJobKeys = new Set(); // Fallback: company + date for jobs added before gmail_message_id

        // Normalize strings for matching (handles whitespace, special chars, case)
        const normalizeForMatching = (str) => {
            return (str || '')
                .toLowerCase()
                .replace(/\s+/g, ' ')  // Multiple spaces to single
                .replace(/[^a-z0-9 ]/g, '') // Remove special chars
                .trim();
        };

        if (userId) {
            // Use service role key to bypass RLS for server-side queries
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Fetch ALL jobs for this user (not just gmail-sourced, to catch all duplicates)
            const { data: existingJobs, error } = await supabase
                .from('job_applications')
                .select('gmail_message_id, company_name, date_applied, source')
                .eq('user_id', userId);

            console.log('Existing jobs query result:', existingJobs?.length || 0, 'jobs, error:', error);

            if (existingJobs) {
                existingJobs.forEach(j => {
                    // Track by gmail_message_id if available
                    if (j.gmail_message_id) {
                        existingGmailIds.add(j.gmail_message_id);
                    }
                    // Also track by normalized company + date as fallback
                    const normalizedCompany = normalizeForMatching(j.company_name);
                    const key = `${normalizedCompany}-${j.date_applied}`;
                    existingJobKeys.add(key);
                });
            }
            console.log(`Found ${existingGmailIds.size} Gmail IDs and ${existingJobKeys.size} existing jobs to filter`);
        }

        // Run multiple search queries
        const allMessages = new Set();
        const searchQueries = buildSearchQuery(days);

        console.log(`[DEBUG] Running ${searchQueries.length} search queries...`);

        for (let i = 0; i < searchQueries.length; i++) {
            const query = searchQueries[i];
            try {
                console.log(`[DEBUG] Query ${i + 1}: ${query.substring(0, 100)}...`);
                const searchResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    const count = (searchData.messages || []).length;
                    console.log(`[DEBUG] Query ${i + 1} returned ${count} emails`);
                    (searchData.messages || []).forEach(m => allMessages.add(m.id));
                } else {
                    console.log(`[DEBUG] Query ${i + 1} failed with status: ${searchResponse.status}`);
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
        }

        const messageIds = Array.from(allMessages);
        console.log(`Found ${messageIds.length} potential emails to analyze`);

        // Process emails
        const jobs = [];
        const seenEmails = new Set();
        let skippedDuplicates = 0;

        for (const messageId of messageIds.slice(0, 1000)) {
            // Skip if already imported by gmail_message_id
            if (existingGmailIds.has(messageId)) {
                skippedDuplicates++;
                continue;
            }

            try {
                // Get full email for better job title extraction
                const msgResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                if (!msgResponse.ok) continue;

                const msgData = await msgResponse.json();
                const headers = msgData.payload?.headers || [];
                const snippet = msgData.snippet || '';

                const from = headers.find(h => h.name === 'From')?.value || '';
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const date = headers.find(h => h.name === 'Date')?.value || '';

                // Extract email body text
                let bodyText = '';
                try {
                    bodyText = extractEmailBody(msgData.payload);
                } catch (e) {
                    bodyText = snippet; // Fallback to snippet
                }

                // Avoid duplicates within this scan
                const emailKey = `${from}-${subject}`.toLowerCase();
                if (seenEmails.has(emailKey)) continue;
                seenEmails.add(emailKey);

                // Score the email using rules
                const ruleResult = scoreEmail(from, subject);
                const { score, status, confidence } = ruleResult;

                // Use hybrid ML + rules classification
                const mlDecision = hybridClassify(
                    { from, subject, snippet, body: bodyText },
                    { score, status, confidence }
                );

                // Skip if both systems agree it's not a job email
                if (!mlDecision.isJobEmail && score < 2) {
                    if (score > 0) {
                        console.log(`[SKIP] ML rejected (${mlDecision.mlCategory}, ${(mlDecision.mlConfidence * 100).toFixed(1)}%): ${subject.substring(0, 40)}...`);
                    }
                    continue;
                }

                // Include if ML or rules say it's a job (ML threshold met OR score >= 2)
                if (mlDecision.isJobEmail || score >= 2) {
                    const companyName = extractCompanyName(from, subject);
                    const dateApplied = new Date(date).toISOString().split('T')[0];

                    // Fallback duplicate check: company + date (for jobs added before gmail_message_id fix)
                    const jobKey = `${normalizeForMatching(companyName)}-${dateApplied}`;
                    if (existingJobKeys.has(jobKey)) {
                        skippedDuplicates++;
                        continue;
                    }

                    // Use multi-stage extraction pipeline
                    const extraction = extractJobTitlePipeline(subject, snippet, bodyText, companyName, from);
                    const jobTitle = extraction.title;
                    console.log(`[JOB] ${companyName}: "${jobTitle}" (confidence: ${extraction.confidence}, source: ${extraction.source})`);

                    // Use ML-suggested status if available and confident
                    const finalStatus = mlDecision.status || status;

                    // Track classification source for drift monitoring
                    if (mlDecision.source === 'ml') {
                        scanMetrics.mlClassified++;
                    } else if (mlDecision.source === 'rules') {
                        scanMetrics.ruleClassified++;
                    } else {
                        scanMetrics.fallbackUsed++;
                    }
                    if (mlDecision.mlConfidence) {
                        scanMetrics.avgConfidence.push(mlDecision.mlConfidence);
                    }

                    jobs.push({
                        id: messageId,
                        gmail_message_id: messageId, // Store for duplicate detection
                        company_name: sanitizeInput(companyName, INPUT_LIMITS.COMPANY_MAX_LENGTH, 'company'),
                        job_title: sanitizeInput(jobTitle, INPUT_LIMITS.JOB_TITLE_MAX_LENGTH, 'job_title'),
                        date_applied: dateApplied,
                        status: finalStatus,
                        source: 'gmail',
                        contact_email: from, // Store sender email for follow-up
                        confidence: confidence,
                        extraction_confidence: extraction.confidence,
                        extraction_source: extraction.source,
                        score: score,
                        // ML classification data
                        ml_category: mlDecision.mlCategory,
                        ml_confidence: mlDecision.mlConfidence,
                        ml_source: mlDecision.source,
                        // Explainability data
                        signals: ruleResult.signals || [],
                        model_version: ML_MODEL_VERSION,
                    });
                } else if (score > 0) {
                    console.log(`[SKIP] Low score (${score}): ${subject.substring(0, 50)}...`);
                }
            } catch (err) {
                continue;
            }
        }

        // Sort by date (newest first)
        jobs.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));

        // Calculate drift metrics
        const totalClassified = scanMetrics.mlClassified + scanMetrics.ruleClassified + scanMetrics.fallbackUsed;
        const avgConf = scanMetrics.avgConfidence.length > 0
            ? (scanMetrics.avgConfidence.reduce((a, b) => a + b, 0) / scanMetrics.avgConfidence.length).toFixed(3)
            : null;

        // Log observability data
        console.log(`[OBSERVABILITY] Scan complete - Total: ${jobs.length}, Rules: ${scanMetrics.ruleClassified}, ML: ${scanMetrics.mlClassified}, Fallback: ${scanMetrics.fallbackUsed}, Avg ML Confidence: ${avgConf || 'N/A'}`);

        return NextResponse.json({
            jobs,
            connected: true,
            scanned: messageIds.length,
            timeRange: `${days} days`,
            totalFound: jobs.length,
            alreadyImported: skippedDuplicates,
            existingJobsCount: existingJobKeys.size, // Total jobs already tracked
            // Observability metrics (for monitoring dashboard)
            metrics: {
                modelVersion: ML_MODEL_VERSION,
                ruleClassified: scanMetrics.ruleClassified,
                mlClassified: scanMetrics.mlClassified,
                fallbackUsed: scanMetrics.fallbackUsed,
                avgMlConfidence: avgConf,
                rulesVsMlRatio: totalClassified > 0
                    ? (scanMetrics.ruleClassified / totalClassified).toFixed(2)
                    : null,
            }
        });
    } catch (err) {
        console.error('Gmail scan error:', err);
        return NextResponse.json({ error: 'Failed to scan emails' }, { status: 500 });
    }
}
