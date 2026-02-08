"""
Synthetic Email Dataset Generator for Job Application Classification
Generates 1000+ labeled training examples across 4 categories:
- applied (0): Job application confirmations
- interview (1): Interview invitations  
- rejection (2): Rejection notices
- not_job (3): Non-job emails (spam, newsletters, banking, e-commerce)
"""

import csv
import random
from datetime import datetime, timedelta

# ============================================
# DATA SOURCES
# ============================================

COMPANIES = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Spotify",
    "Tesla", "Adobe", "Salesforce", "Oracle", "IBM", "Intel", "Nvidia",
    "Stripe", "Airbnb", "Uber", "Lyft", "DoorDash", "Instacart",
    "Coinbase", "Robinhood", "Plaid", "Square", "PayPal",
    "Shopify", "Atlassian", "Slack", "Zoom", "Twilio",
    "Datadog", "Snowflake", "Databricks", "MongoDB", "Redis Labs",
    "Cloudflare", "Fastly", "HashiCorp", "Confluent", "Elastic",
    "GitHub", "GitLab", "JetBrains", "Docker", "Kubernetes",
    "Acme Corp", "TechStart Inc", "InnovateTech", "FutureSoft",
    "DataDrive", "CloudNine", "ByteWorks", "CodeCraft", "DevHub",
    "Infosys", "TCS", "Wipro", "HCL", "Tech Mahindra",
    "Flipkart", "Swiggy", "Zomato", "Razorpay", "PhonePe",
    "CRED", "Meesho", "Zepto", "Groww", "Upstox"
]

JOB_TITLES = [
    "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "DevOps Engineer", "SRE Engineer", "Platform Engineer",
    "Data Scientist", "Machine Learning Engineer", "Data Engineer",
    "Product Manager", "Technical Program Manager", "Engineering Manager",
    "UX Designer", "UI Designer", "Product Designer",
    "QA Engineer", "Test Engineer", "Automation Engineer",
    "Security Engineer", "Cloud Engineer", "Solutions Architect",
    "Mobile Developer", "iOS Developer", "Android Developer",
    "Data Analyst", "Business Analyst", "Systems Analyst",
    "Technical Lead", "Principal Engineer", "Software Architect",
    "DevSecOps Engineer", "Site Reliability Engineer", "Infrastructure Engineer"
]

RECRUITER_NAMES = [
    "Sarah", "John", "Emily", "Michael", "Jessica", "David", "Ashley",
    "Chris", "Amanda", "Brian", "Rachel", "Kevin", "Nicole", "Ryan",
    "Priya", "Rahul", "Sneha", "Arun", "Divya", "Vikram"
]

ATS_DOMAINS = [
    "greenhouse.io", "lever.co", "workday.com", "icims.com", 
    "jobvite.com", "smartrecruiters.com", "ashbyhq.com", "breezy.hr"
]

# ============================================
# EMAIL TEMPLATES - APPLIED (Label: 0)
# ============================================

APPLIED_TEMPLATES = [
    {
        "subject": "Thank you for applying to {company}",
        "body": """Hi {name},

Thank you for applying to the {role} position at {company}! We have received your application and our team is currently reviewing it.

We appreciate your interest in joining our team. If your qualifications match our requirements, a member of our recruiting team will reach out to discuss next steps.

Best regards,
The {company} Talent Team"""
    },
    {
        "subject": "Application Received - {role} at {company}",
        "body": """Dear {name},

We've received your application for the {role} role at {company}. Thank you for your interest in joining our team!

Our recruiting team will review your application and get back to you if there's a potential match. Due to the high volume of applications, this process may take 2-3 weeks.

Cheers,
{recruiter}
Talent Acquisition, {company}"""
    },
    {
        "subject": "Your application to {company} has been submitted",
        "body": """Hi {name},

Great news! Your application for {role} at {company} has been successfully submitted.

What happens next?
- Our team will review your profile
- If selected, you'll hear from us within 2 weeks
- You can track your application status in our portal

Thank you for considering {company}!

Best,
{company} Recruiting"""
    },
    {
        "subject": "Thanks for applying! - {company}",
        "body": """Hello {name},

Thank you for your interest in the {role} position at {company}. We've received your application and wanted to confirm it's in our system.

We review every application carefully and will be in touch if we'd like to move forward.

Warm regards,
{recruiter}
{company} HR Team"""
    },
    {
        "subject": "{company} - Application Confirmation",
        "body": """Dear {name},

This email confirms that we have received your application for:

Position: {role}
Company: {company}
Date Applied: {date}

Your application is now under review. We will contact you if your profile matches our requirements.

Thank you,
{company} Talent Acquisition"""
    },
    {
        "subject": "We received your application for {role}",
        "body": """Hi {name},

Thanks for taking the time to apply for the {role} position at {company}!

We're excited to learn more about you. Our hiring team is reviewing applications and will reach out to qualified candidates soon.

In the meantime, feel free to check out our careers page for other opportunities.

Best,
The {company} Team"""
    },
    {
        "subject": "Application submitted successfully - {company}",
        "body": """Hello {name},

Your application for {role} at {company} has been received!

Here's what to expect:
1. Resume review by our talent team
2. Initial screening if qualified
3. Interview process (typically 3-4 rounds)

We'll keep you updated on your status.

Thanks,
{company} Careers"""
    },
    {
        "subject": "Thank you for your interest in {company}",
        "body": """Dear {name},

We appreciate your interest in joining {company} as a {role}. 

Your application has been forwarded to the hiring team for review. If your background is a match, you can expect to hear from us within the next two weeks.

Best of luck,
{recruiter}
Recruiting Team, {company}"""
    }
]

# ============================================
# EMAIL TEMPLATES - INTERVIEW (Label: 1)
# ============================================

INTERVIEW_TEMPLATES = [
    {
        "subject": "Interview Invitation - {role} at {company}",
        "body": """Hi {name},

Great news! We'd like to invite you to interview for the {role} position at {company}.

We were impressed by your background and would love to learn more about you. Please let us know your availability for a 30-minute phone screen this week.

Available times:
- Monday-Friday: 10am-4pm

Looking forward to speaking with you!

Best,
{recruiter}
{company} Recruiting"""
    },
    {
        "subject": "Next Steps - {company} {role} Interview",
        "body": """Dear {name},

Congratulations! After reviewing your application for {role}, we'd like to move forward with the interview process.

The next step is a technical phone screen with one of our engineers. This will be a 45-minute call covering your background and a coding exercise.

Please use this link to schedule: [Calendly Link]

Best regards,
{recruiter}
{company} Talent Team"""
    },
    {
        "subject": "Schedule Your Interview - {company}",
        "body": """Hi {name},

We're excited to invite you to the next stage of our interview process for {role}!

Interview Details:
- Type: Video call (Google Meet/Zoom)
- Duration: 60 minutes
- Focus: Technical discussion + behavioral questions

Please reply with 3 time slots that work for you this week.

Cheers,
{recruiter}
{company}"""
    },
    {
        "subject": "Phone Screen Request - {role} at {company}",
        "body": """Hello {name},

I hope this email finds you well! I'm {recruiter} from {company}'s recruiting team.

We reviewed your application for {role} and would love to schedule a brief phone conversation to learn more about your experience.

Are you available for a 20-minute call this week? Let me know what works best.

Talk soon,
{recruiter}"""
    },
    {
        "subject": "Coding Challenge - {company} {role}",
        "body": """Hi {name},

Thank you for your interest in the {role} position at {company}!

As the next step in our hiring process, we'd like to invite you to complete a take-home coding challenge. 

Details:
- Duration: 2-3 hours
- Deadline: 5 days from today
- Language: Your choice

Please find the challenge at: [HackerRank Link]

Good luck!
{company} Engineering Team"""
    },
    {
        "subject": "Interview Confirmation - {company}",
        "body": """Dear {name},

This is to confirm your interview for the {role} position at {company}.

Date: {interview_date}
Time: 2:00 PM - 3:00 PM
Location: Video Call (link will be sent separately)
Interviewer: Engineering Team

Please let us know if you need to reschedule.

Best,
{recruiter}
{company}"""
    },
    {
        "subject": "Moving Forward - {role} Application",
        "body": """Hi {name},

Great news! The hiring team at {company} was impressed with your profile and we'd like to move forward with your application for {role}.

Next steps:
1. 30-min recruiter call
2. Technical assessment
3. Final round with the team

Let's schedule the recruiter call this week. What times work for you?

Thanks,
{recruiter}"""
    },
    {
        "subject": "Technical Interview - {company}",
        "body": """Hello {name},

You've been selected for a technical interview for the {role} position at {company}!

The interview will cover:
- System design discussion
- Live coding problem
- Q&A about your experience

Duration: 90 minutes
Format: Virtual

Please share your availability for next week.

Regards,
{company} Engineering Hiring"""
    }
]

# ============================================
# EMAIL TEMPLATES - REJECTION (Label: 2)
# ============================================

REJECTION_TEMPLATES = [
    {
        "subject": "Update on Your Application - {company}",
        "body": """Dear {name},

Thank you for taking the time to apply for the {role} position at {company} and for your interest in joining our team.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We encourage you to apply for future openings that match your skills. We wish you the best in your job search.

Sincerely,
{company} Recruiting Team"""
    },
    {
        "subject": "Your Application to {company}",
        "body": """Hi {name},

Thank you for your interest in the {role} role at {company}. We appreciate the time you invested in applying.

Unfortunately, we will not be moving forward with your application at this time. While your background is impressive, we've decided to pursue candidates with different experience for this particular role.

We wish you all the best in your career journey.

Best regards,
{recruiter}
{company}"""
    },
    {
        "subject": "Application Status - {role} at {company}",
        "body": """Dear {name},

We wanted to follow up regarding your application for {role} at {company}.

After reviewing your qualifications alongside our current openings, we regret to inform you that we will not be proceeding with your application. This was a highly competitive process, and the decision was not easy.

Please don't be discouraged - we encourage you to apply again in the future.

Thank you,
{company} Talent Team"""
    },
    {
        "subject": "Thank you for applying to {company}",
        "body": """Hi {name},

Thank you for your interest in {company} and for applying to the {role} position.

We have carefully reviewed your application and, unfortunately, have decided not to move forward at this time. We received many qualified applicants for this role and the competition was intense.

We appreciate your time and wish you success in your career.

Best,
{recruiter}
{company} HR"""
    },
    {
        "subject": "{company} - Application Update",
        "body": """Dear {name},

We appreciate your interest in joining {company} as a {role}.

After thorough review, we have decided to pursue other candidates for this position. While we were impressed by your background, we felt other applicants were a closer fit for our immediate needs.

We encourage you to check our careers page for future opportunities.

Warm regards,
{company} Recruiting"""
    },
    {
        "subject": "Regarding Your {role} Application",
        "body": """Hello {name},

Thank you for applying for the {role} position at {company}. We enjoyed learning about your background.

After careful consideration, we've decided to move in a different direction for this role. This decision is not a reflection of your abilities - we simply found candidates whose experience was a closer match.

Best of luck with your job search!

Sincerely,
{recruiter}
{company}"""
    },
    {
        "subject": "We're going a different direction - {company}",
        "body": """Hi {name},

I wanted to personally reach out regarding your application for {role} at {company}.

Unfortunately, after much deliberation, we've decided not to proceed with your candidacy. This was a difficult decision given the strength of your application.

I'd be happy to keep your resume on file for future opportunities.

Best wishes,
{recruiter}
{company} Talent Acquisition"""
    }
]

# ============================================
# EMAIL TEMPLATES - NOT JOB (Label: 3)
# ============================================

NOT_JOB_TEMPLATES = [
    # E-commerce
    {
        "subject": "Your Amazon order has shipped!",
        "body": """Hi {name},

Great news! Your order #123-4567890 has been shipped and is on its way.

Expected delivery: {date}
Tracking number: TRK123456789

Track your package at amazon.com/orders

Thank you for shopping with us!
Amazon Customer Service"""
    },
    {
        "subject": "Order Confirmation - Flipkart",
        "body": """Dear {name},

Thank you for your order! Here are the details:

Order ID: OD123456789
Item: Wireless Headphones
Amount: ₹2,499

Your order will be delivered by {date}.

Happy Shopping!
Flipkart"""
    },
    # Banking/Finance
    {
        "subject": "Your bank statement is ready",
        "body": """Dear Customer,

Your account statement for the month of January 2024 is now available.

Account: XXXX1234
Balance: ₹45,678.90

Log in to your account to view the full statement.

HDFC Bank"""
    },
    {
        "subject": "Transaction Alert - ICICI Bank",
        "body": """Dear {name},

A transaction of Rs. 1,299 has been debited from your account XXXX5678 at SWIGGY.

Available Balance: Rs. 23,456.78
Date: {date}

If not done by you, call 1800-XXX-XXXX immediately.

ICICI Bank"""
    },
    # Newsletters
    {
        "subject": "Weekly Tech News Digest",
        "body": """Hi {name},

Here's your weekly roundup of the top tech stories:

1. Apple announces new product launch
2. Google updates search algorithm
3. Microsoft's AI breakthrough

Click here to read more...

Unsubscribe | Update Preferences
TechNews Weekly"""
    },
    {
        "subject": "New jobs for you on LinkedIn",
        "body": """Hi {name},

Based on your profile, we found some jobs you might be interested in:

- Software Engineer at Company A (100+ applicants)
- Developer at Company B (50+ applicants)
- Engineer at Company C (200+ applicants)

See all recommendations on LinkedIn

LinkedIn Jobs Team"""
    },
    # Food Delivery
    {
        "subject": "Your Swiggy order is confirmed!",
        "body": """Hi {name},

Your order from Domino's Pizza has been confirmed!

Order ID: SW123456
Items: Margherita Pizza, Garlic Bread
Total: ₹599

Estimated delivery: 35-40 mins

Track your order in the Swiggy app.

Enjoy your meal!
Swiggy"""
    },
    {
        "subject": "Zomato: Order delivered successfully",
        "body": """Hi {name},

Your order from Biryani House has been delivered!

How was your food? Rate your experience.

Order total: ₹450

Thanks for ordering with Zomato!"""
    },
    # Promotions
    {
        "subject": "🔥 50% OFF this weekend only!",
        "body": """Hi {name},

Don't miss out on our biggest sale of the year!

50% OFF on all electronics
Use code: MEGA50

Shop now before it's gone!

Terms apply. Valid until {date}.
MyStore.com"""
    },
    {
        "subject": "Your subscription is expiring soon",
        "body": """Dear {name},

Your premium subscription will expire on {date}.

Renew now to continue enjoying:
- Unlimited access
- Ad-free experience
- Exclusive content

Renew for just $9.99/month.

StreamingService"""
    },
    # OTP/Security
    {
        "subject": "Your OTP for login",
        "body": """Your one-time password is: 847293

This OTP is valid for 10 minutes. Do not share with anyone.

If you didn't request this, please ignore.

SecureBank"""
    },
    {
        "subject": "Password reset request",
        "body": """Hi {name},

We received a request to reset your password.

Click here to reset: [Reset Link]

If you didn't request this, please ignore this email.

Security Team"""
    },
    # Social Media
    {
        "subject": "{recruiter} sent you a message on LinkedIn",
        "body": """Hi {name},

{recruiter} sent you a new message:

"Hi! I came across your profile and..."

Reply on LinkedIn to continue the conversation.

LinkedIn"""
    },
    {
        "subject": "Your Twitter digest",
        "body": """Hi {name},

Here's what's happening on Twitter:

Top trends in India:
1. #TechNews - 50K tweets
2. #Cricket - 100K tweets

See what's trending

Twitter"""
    },
    # Travel
    {
        "subject": "Flight booking confirmation - IndiGo",
        "body": """Dear {name},

Your flight booking is confirmed!

PNR: ABC123
Flight: 6E-1234
Route: DEL → BLR
Date: {date}

Web check-in opens 48 hours before departure.

IndiGo Airlines"""
    },
    {
        "subject": "Your Uber ride receipt",
        "body": """Thanks for riding with Uber!

Trip Total: ₹245

From: MG Road
To: Koramangala

Rate your driver to improve your experience.

Uber"""
    }
]

# ============================================
# GENERATOR FUNCTIONS
# ============================================

def generate_email(templates, label, name="Candidate"):
    """Generate a single email from templates"""
    template = random.choice(templates)
    
    company = random.choice(COMPANIES)
    role = random.choice(JOB_TITLES)
    recruiter = random.choice(RECRUITER_NAMES)
    date = (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%B %d, %Y")
    interview_date = (datetime.now() + timedelta(days=random.randint(2, 10))).strftime("%A, %B %d")
    
    subject = template["subject"].format(
        company=company, role=role, name=name, recruiter=recruiter, date=date
    )
    body = template["body"].format(
        company=company, role=role, name=name, recruiter=recruiter, 
        date=date, interview_date=interview_date
    )
    
    # Combine subject and body for training
    text = f"Subject: {subject}\n\n{body}"
    
    return {
        "text": text,
        "subject": subject,
        "body": body,
        "label": label,
        "category": ["applied", "interview", "rejection", "not_job"][label]
    }

def add_noise(text):
    """Add slight variations to make data more realistic"""
    variations = [
        lambda t: t,  # No change
        lambda t: t.replace("Hi", "Hello"),
        lambda t: t.replace("Hello", "Hi"),
        lambda t: t.replace("Dear", "Hi"),
        lambda t: t.replace("Thank you", "Thanks"),
        lambda t: t.replace("Best regards", "Best"),
        lambda t: t.replace("Sincerely", "Regards"),
        lambda t: t.lower() if random.random() < 0.1 else t,  # Rare lowercase
    ]
    return random.choice(variations)(text)

def generate_dataset(num_per_category=300):
    """Generate complete dataset"""
    dataset = []
    
    # Generate each category
    print(f"Generating {num_per_category} emails per category...")
    
    for i in range(num_per_category):
        # Applied (label 0)
        email = generate_email(APPLIED_TEMPLATES, 0)
        email["text"] = add_noise(email["text"])
        dataset.append(email)
        
        # Interview (label 1)
        email = generate_email(INTERVIEW_TEMPLATES, 1)
        email["text"] = add_noise(email["text"])
        dataset.append(email)
        
        # Rejection (label 2)
        email = generate_email(REJECTION_TEMPLATES, 2)
        email["text"] = add_noise(email["text"])
        dataset.append(email)
        
        # Not Job (label 3)
        email = generate_email(NOT_JOB_TEMPLATES, 3)
        email["text"] = add_noise(email["text"])
        dataset.append(email)
    
    # Shuffle dataset
    random.shuffle(dataset)
    
    return dataset

def save_to_csv(dataset, filename="job_emails_dataset.csv"):
    """Save dataset to CSV"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["text", "label", "category"])
        writer.writeheader()
        for item in dataset:
            writer.writerow({
                "text": item["text"],
                "label": item["label"],
                "category": item["category"]
            })
    print(f"Saved {len(dataset)} emails to {filename}")

def main():
    print("=" * 50)
    print("Synthetic Email Dataset Generator")
    print("=" * 50)
    
    # Generate dataset
    dataset = generate_dataset(num_per_category=300)
    
    # Print statistics
    print(f"\nTotal emails generated: {len(dataset)}")
    for label in range(4):
        count = sum(1 for d in dataset if d["label"] == label)
        category = ["applied", "interview", "rejection", "not_job"][label]
        print(f"  {category}: {count}")
    
    # Save to CSV
    save_to_csv(dataset)
    
    # Preview samples
    print("\n" + "=" * 50)
    print("Sample emails:")
    print("=" * 50)
    for label in range(4):
        sample = next(d for d in dataset if d["label"] == label)
        print(f"\n[{sample['category'].upper()}]")
        print(f"Text preview: {sample['text'][:200]}...")
        print("-" * 30)

if __name__ == "__main__":
    main()
