/**
 * ML Email Classifier for Job Application Detection
 * 
 * This module provides hybrid classification:
 * - Uses a simple TF-IDF inspired scoring system (no external dependencies)
 * - Can be upgraded to ONNX-based DistilBERT when model is trained
 * 
 * Categories:
 * - 0: applied (job application confirmations)
 * - 1: interview (interview invitations)
 * - 2: rejection (rejection notices)
 * - 3: not_job (spam, newsletters, etc.)
 */

// ============================================
// VOCABULARY & WEIGHTS (Derived from training data patterns)
// ============================================

const CATEGORY_NAMES = ['applied', 'interview', 'rejection', 'not_job'];

// High-signal words for each category with learned weights
const CATEGORY_KEYWORDS = {
    applied: {
        // Strong signals
        'thank you for applying': 5.0,
        'thanks for applying': 5.0,
        'application received': 5.0,
        'received your application': 5.0,
        'application submitted': 4.5,
        'successfully submitted': 4.5,
        'application confirmation': 4.5,
        'we have received': 4.0,
        'application has been': 4.0,
        // Medium signals
        'thank you for your interest': 3.0,
        'thanks for your interest': 3.0,
        'talent team': 2.5,
        'recruiting team': 2.5,
        'under review': 2.5,
        'reviewing applications': 2.5,
        'will be in touch': 2.0,
        'hear from us': 2.0,
        // Weak signals
        'position': 1.0,
        'role': 1.0,
        'careers': 1.0,
    },
    interview: {
        // Strong signals
        'interview invitation': 6.0,
        'interview invite': 6.0,
        'schedule interview': 5.5,
        'schedule a call': 5.0,
        'schedule an interview': 5.5,
        'phone screen': 5.0,
        'screening call': 5.0,
        'technical interview': 5.5,
        'coding challenge': 5.0,
        'coding test': 5.0,
        'take home': 4.5,
        'take-home': 4.5,
        'hackerrank': 5.0,
        'codility': 5.0,
        // Medium signals
        'next steps': 4.0,
        'move forward': 4.0,
        'moving forward': 4.0,
        'like to invite': 4.0,
        'availability': 3.5,
        'calendly': 3.5,
        'video call': 3.0,
        'zoom': 2.5,
        'google meet': 2.5,
        'meet the team': 3.5,
        // Weak signals
        'excited': 1.5,
        'great news': 2.0,
        'congratulations': 2.5,
    },
    rejection: {
        // Strong signals
        'regret to inform': 6.0,
        'unfortunately': 4.5,
        'not be moving forward': 5.5,
        'not moving forward': 5.5,
        'decided not to proceed': 5.0,
        'will not be proceeding': 5.0,
        'other candidates': 4.5,
        'moving forward with other': 5.0,
        'position has been filled': 5.0,
        'position filled': 5.0,
        'not selected': 5.0,
        // Medium signals
        'after careful consideration': 4.0,
        'careful consideration': 4.0,
        'not the right fit': 4.0,
        'not a fit': 3.5,
        'competitive': 2.5,
        'wish you the best': 3.5,
        'best of luck': 3.5,
        'good luck': 3.0,
        // Weak signals
        'encourage you to apply': 2.0,
        'future opportunities': 2.0,
    },
    not_job: {
        // Strong signals - E-commerce
        'order has shipped': 6.0,
        'order confirmed': 5.5,
        'delivery': 4.0,
        'tracking number': 5.0,
        'track your package': 5.0,
        'amazon order': 6.0,
        'flipkart': 5.0,
        // Strong signals - Banking
        'bank statement': 6.0,
        'transaction alert': 6.0,
        'otp': 6.0,
        'one time password': 6.0,
        'account balance': 5.0,
        'credit card': 4.5,
        'debit card': 4.5,
        // Strong signals - Spam/Promo
        '% off': 5.5,
        'discount': 4.0,
        'sale': 3.5,
        'shop now': 5.0,
        'limited time': 4.5,
        'unsubscribe': 4.0,
        'newsletter': 5.0,
        // Medium signals - Food
        'swiggy': 5.0,
        'zomato': 5.0,
        'uber eats': 5.0,
        'food order': 4.5,
        'your order from': 4.0,
        // Medium signals - Travel
        'flight booking': 4.5,
        'hotel booking': 4.5,
        'uber ride': 4.0,
        'ola ride': 4.0,
        // LinkedIn job alerts (not actual applications)
        'new jobs for you': 5.0,
        'jobs you may like': 5.0,
        'recommended jobs': 4.5,
        'job alerts': 4.5,
        'companies hiring': 4.0,
    }
};

// Negative signals (reduce score for that category)
const NEGATIVE_SIGNALS = {
    applied: ['unfortunately', 'regret', 'rejected', 'order', 'shipped', 'otp'],
    interview: ['unfortunately', 'regret', 'rejected', 'not moving', 'order', 'shipped'],
    rejection: ['interview', 'schedule', 'next steps', 'great news', 'order', 'shipped'],
    not_job: ['application', 'interview', 'role at', 'position at', 'thank you for applying'],
};

// Sender domain bonuses
const SENDER_BONUSES = {
    // ATS platforms boost job-related scores
    'greenhouse.io': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    'lever.co': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    'workday.com': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    'icims.com': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    'smartrecruiters.com': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    'ashbyhq.com': { applied: 3, interview: 3, rejection: 3, not_job: -5 },
    // Non-job domains boost not_job score
    'amazon.': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'flipkart.': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'swiggy.': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'zomato.': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'bank': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'hdfc': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
    'icici': { applied: -5, interview: -5, rejection: -5, not_job: 5 },
};

// ============================================
// CLASSIFICATION FUNCTIONS
// ============================================

/**
 * Calculate similarity score between text and category
 */
function calculateCategoryScore(text, category) {
    const textLower = text.toLowerCase();
    let score = 0;

    // Positive keyword matches
    const keywords = CATEGORY_KEYWORDS[category];
    for (const [phrase, weight] of Object.entries(keywords)) {
        if (textLower.includes(phrase)) {
            score += weight;
        }
    }

    // Negative signal penalties
    const negatives = NEGATIVE_SIGNALS[category];
    for (const neg of negatives) {
        if (textLower.includes(neg)) {
            score -= 2;
        }
    }

    return score;
}

/**
 * Apply sender domain bonuses
 */
function applySenderBonus(from, scores) {
    const fromLower = from.toLowerCase();

    for (const [domain, bonuses] of Object.entries(SENDER_BONUSES)) {
        if (fromLower.includes(domain)) {
            for (const [category, bonus] of Object.entries(bonuses)) {
                const idx = CATEGORY_NAMES.indexOf(category);
                if (idx >= 0) {
                    scores[idx] += bonus;
                }
            }
            break;
        }
    }

    return scores;
}

/**
 * Convert raw scores to probabilities using softmax
 */
function softmax(scores) {
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sum = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(e => e / sum);
}

/**
 * Main classification function
 * 
 * @param {string} text - Email content (subject + body)
 * @param {string} from - Sender email address
 * @returns {Object} Classification result
 */
export function classifyEmail(text, from = '') {
    // Calculate raw scores for each category
    let scores = CATEGORY_NAMES.map(cat => calculateCategoryScore(text, cat));

    // Apply sender bonuses
    scores = applySenderBonus(from, scores);

    // Convert to probabilities
    const probabilities = softmax(scores);

    // Find best category
    const maxProb = Math.max(...probabilities);
    const bestIdx = probabilities.indexOf(maxProb);
    const bestCategory = CATEGORY_NAMES[bestIdx];

    // Determine if it's a job email
    const isJobEmail = bestCategory !== 'not_job';

    // Map to status
    const statusMap = {
        'applied': 'Applied',
        'interview': 'Interview',
        'rejection': 'Rejected',
        'not_job': null
    };

    return {
        category: bestCategory,
        confidence: maxProb,
        isJobEmail,
        suggestedStatus: statusMap[bestCategory],
        scores: Object.fromEntries(CATEGORY_NAMES.map((cat, i) => [cat, probabilities[i]])),
        rawScores: Object.fromEntries(CATEGORY_NAMES.map((cat, i) => [cat, scores[i]])),
    };
}

/**
 * Hybrid classifier combining rules and ML
 * 
 * @param {Object} email - Email object with from, subject, snippet/body
 * @param {Object} ruleResult - Result from rule-based scoring
 * @returns {Object} Final classification decision
 */
export function hybridClassify(email, ruleResult) {
    const text = `${email.subject || ''} ${email.snippet || ''} ${email.body || ''}`;
    const mlResult = classifyEmail(text, email.from || '');

    // High confidence from rules (score >= 5 or <= -5)
    if (ruleResult.score >= 5) {
        return {
            source: 'rules',
            isJobEmail: true,
            status: ruleResult.status,
            confidence: 'high',
            ruleScore: ruleResult.score,
            mlCategory: mlResult.category,
            mlConfidence: mlResult.confidence,
        };
    }

    if (ruleResult.score <= -5) {
        return {
            source: 'rules',
            isJobEmail: false,
            status: null,
            confidence: 'high',
            ruleScore: ruleResult.score,
            mlCategory: mlResult.category,
            mlConfidence: mlResult.confidence,
        };
    }

    // Ambiguous cases - use ML with confidence threshold
    if (mlResult.confidence >= 0.6) {
        return {
            source: 'ml',
            isJobEmail: mlResult.isJobEmail,
            status: mlResult.suggestedStatus,
            confidence: mlResult.confidence >= 0.8 ? 'high' : 'medium',
            ruleScore: ruleResult.score,
            mlCategory: mlResult.category,
            mlConfidence: mlResult.confidence,
        };
    }

    // Low confidence from both - fallback to rules if positive, otherwise skip
    if (ruleResult.score >= 2) {
        return {
            source: 'fallback',
            isJobEmail: true,
            status: ruleResult.status,
            confidence: 'low',
            ruleScore: ruleResult.score,
            mlCategory: mlResult.category,
            mlConfidence: mlResult.confidence,
        };
    }

    // Both uncertain and rules neutral/negative - skip
    return {
        source: 'skip',
        isJobEmail: false,
        status: null,
        confidence: 'low',
        ruleScore: ruleResult.score,
        mlCategory: mlResult.category,
        mlConfidence: mlResult.confidence,
    };
}

// ============================================
// BATCH CLASSIFICATION
// ============================================

/**
 * Classify multiple emails at once
 */
export function classifyEmails(emails) {
    return emails.map(email => ({
        ...email,
        classification: classifyEmail(
            `${email.subject || ''} ${email.snippet || ''} ${email.body || ''}`,
            email.from || ''
        )
    }));
}

// Export for CommonJS compatibility
export default {
    classifyEmail,
    hybridClassify,
    classifyEmails,
    CATEGORY_NAMES,
};
