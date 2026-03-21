# TownesDev Launch Roadmap - Jan 1, 2026

> Status note: this document is a historical launch-planning snapshot. For the current execution order and active engineering direction, use [docs/development/current-resume-plan.md](../development/current-resume-plan.md).

**Created**: November 4, 2025  
**Launch Target**: January 1, 2026 (8 weeks)  
**Status**: Historical Planning Snapshot  
**Owner**: Primary Developer

---

## Executive Summary

**Mission**: Build quality digital services (websites, Discord bots, software) for underserved markets while creating sustainable income and meaningful work.

**Target Markets** (3 segments):

1. **Small Businesses** - Bakeries, tattoo shops, mom & pop restaurants, thrift stores (need better web presence)
2. **Online Communities** - Gamers, musicians, D&D groups (need Discord bot hosting + features)
3. **Indie Musicians** - Solo artists, small bands (need affordable, quality websites)

**Launch Goal**: 3 paying clients by Jan 1, 2026. Prove the model works.

**Current Reality**:

- ✅ Public self-service onboarding exists at `/get-started`
- ✅ Stripe checkout, webhook activation, and portal gating are implemented
- ✅ Core validation baseline is restored: typecheck, lint, and build are green
- ⚠️ Test suite and stale documentation still require ongoing reconciliation
- ❌ Monitoring, support operations, and launch execution still need focused follow-through

**Critical Truth**: The platform is further along than this original plan assumes. The main remaining work is operational readiness, documentation accuracy, and validation depth.

---

## Table of Contents

1. [Business Model Clarity](#business-model-clarity)
2. [The 8-Week Plan](#the-8-week-plan)
3. [Pricing Strategy & Pro-Bono Work](#pricing-strategy--pro-bono-work)
4. [What Success Looks Like](#what-success-looks-like)
5. [Daily Operating System](#daily-operating-system)
6. [Hard Truths & Mindset](#hard-truths--mindset)
7. [Launch Checklist](#launch-checklist)

---

## Business Model Clarity

### The Three-Segment Strategy

Your instinct to serve three markets is **smart**. Here's why:

- **Small Businesses**: High willingness to pay, clear ROI, word-of-mouth growth
- **Online Communities**: Recurring revenue, scalable (bot instances), tech-savvy clients
- **Indie Musicians**: Personal passion, portfolio pieces, network effects

**BUT**: Launch with ONE segment first. Master it, then expand.

### Recommended Launch Order

**Phase 1 (Weeks 1-8)**: Small Businesses

- Easiest to price ($500-2000 for website)
- Clear value proposition (online presence = more customers)
- Local networking opportunities
- Portfolio pieces for later clients

**Phase 2 (Months 2-4)**: Online Communities

- Once onboarding is smooth
- Discord bot as service asset is ready
- You have case studies to show

**Phase 3 (Months 5-6)**: Indie Musicians

- Your passion project
- By now you have systems, can offer better pricing
- Your own network is warm leads

### Service Offerings Per Segment

#### Small Businesses

**Product**: Professional website with CMS

**Tiers**:

- **Starter**: $1,200 one-time + $99/mo hosting
  - 1-3 pages, basic design, mobile responsive
  - Contact form, Google Maps integration
  - Monthly updates included
- **Professional**: $2,500 one-time + $199/mo
  - 5-10 pages, custom design, CMS access
  - SEO optimization, analytics
  - Gallery/menu/services showcase
  - Weekly updates, priority support
- **Premium**: $5,000 one-time + $399/mo
  - Everything in Pro
  - E-commerce (if needed)
  - Booking/reservation system
  - Custom features
  - Daily monitoring, 4-hour support SLA

**Target**: 5-10 clients at $150/mo average = $750-1500 MRR

#### Online Communities (Discord Bots)

**Product**: Custom Discord bot instance with hosting + maintenance

**Tiers**:

- **Community**: $0-49/mo
  - Basic welcome messages, moderation
  - 1 server, up to 1000 members
  - Community support (Discord server)
- **Guild**: $99/mo
  - Custom commands, role management
  - Up to 3 servers, up to 5000 members
  - Email support, 48hr response
  - Feature requests accepted
- **Enterprise**: $299/mo
  - Everything in Guild
  - Custom feature development
  - Unlimited servers, members
  - Priority support, 12hr response
  - Dedicated Slack/Discord channel

**Add-ons**:

- Custom feature development: $500-2000 one-time
- Server migration: $200
- Training/documentation: $100/hr

**Target**: 10-15 clients at $75/mo average = $750-1125 MRR

#### Indie Musicians

**Product**: Beautiful, mobile-first musician website

**Tiers**:

- **Solo Artist**: $500 one-time + $29/mo
  - Single page site
  - Music player integration (Spotify, etc.)
  - Show dates, social links
  - Contact/booking form
- **Band/Pro**: $1,200 one-time + $79/mo
  - Multi-page (bio, music, shows, contact)
  - Merch integration (if needed)
  - Mailing list signup
  - Press kit download
- **Label/Management**: $2,500 one-time + $199/mo
  - Multi-artist showcase
  - Advanced booking/tour management
  - Analytics dashboard

**Special**: Friends & family rate = 50% off one-time, same monthly
**Pro-bono**: Max 2 per year, must be portfolio-worthy

**Target**: 10-20 clients at $50/mo average = $500-1000 MRR

### Combined Revenue Model (Year 1)

| Segment            | Clients | Avg MRR | Total MRR  |
| ------------------ | ------- | ------- | ---------- |
| Small Business     | 5       | $150    | $750       |
| Online Communities | 8       | $75     | $600       |
| Indie Musicians    | 10      | $50     | $500       |
| **TOTAL**          | **23**  | **$80** | **$1,850** |

**Plus One-Time Revenue**: ~$10,000-15,000 from setup fees

**Year 1 Projection**: $1,850 MRR × 12 = $22,200 + $12,500 one-time = **$34,700 revenue**

---

## The 8-Week Plan

**Goal**: Launch-ready platform + 3 paying clients by Jan 1, 2026

### Week 1-2: Foundation (Nov 4-17)

**Theme**: Make it buyable

**Critical Path**:

- [ ] **Day 1-2**: Create pricing page (all three segments)
- [ ] **Day 3-5**: Wire Stripe checkout to onboarding wizard
- [ ] **Day 6-8**: Create landing page with clear CTAs
- [ ] **Day 9-10**: Test full flow: visit site → choose plan → pay → get access
- [ ] **Day 11-14**: Create portfolio examples (2 fake client sites)

**Deliverables**:

- Public site with `/`, `/pricing`, `/contact`
- Working checkout flow
- 2 example client websites
- Can process first payment

**Success Metric**: Mom/friend can visit site, understand what you offer, and buy

### Week 3-4: Operations (Nov 18 - Dec 1)

**Theme**: Make it monitorable & supportable

**Critical Path**:

- [ ] **Day 1-3**: Set up UptimeRobot + Vercel alerts
- [ ] **Day 4-6**: Build `/admin/health` dashboard
- [ ] **Day 7-9**: Complete support ticket UI in client portal
- [ ] **Day 10-12**: Define SLAs, create incident workflow
- [ ] **Day 13-14**: Document what to do when alerts fire

**Deliverables**:

- Uptime monitoring active
- Admin dashboard showing all services
- Client portal support ticket system
- Runbook for common issues

**Success Metric**: You know if something breaks before client emails you

### Week 5-6: Safety & Marketing (Dec 2-15)

**Theme**: Make it safe & sellable

**Critical Path**:

- [ ] **Day 1-3**: Automated Sanity exports + backup plan
- [ ] **Day 4-6**: Disaster recovery documentation + test
- [ ] **Day 7-9**: Create "How It Works" page
- [ ] **Day 10-12**: Write first blog post or case study
- [ ] **Day 13-14**: Set up error tracking (Sentry free tier)

**Deliverables**:

- Backups running automatically
- Can restore from disaster
- Marketing content published
- Error tracking catching issues

**Success Metric**: Sleep soundly knowing data is safe, have content to share

### Week 7-8: Beta Launch (Dec 16-29)

**Theme**: Get first clients

**Critical Path**:

- [ ] **Day 1-2**: Reach out to 10 warm leads (friends, network)
- [ ] **Day 3-5**: Offer beta pricing (50% off for first 5 clients)
- [ ] **Day 6-14**: Onboard 3 beta clients
- [ ] **Day 15-21**: Deliver their projects, get feedback
- [ ] **Day 22-24**: Fix top 3 pain points from feedback
- [ ] **Day 25-29**: Polish, prepare for Jan 1 announcement

**Deliverables**:

- 3 paying clients onboarded
- 3 live client projects
- Testimonials or feedback
- Refined process

**Success Metric**: 3 clients paying you monthly by Jan 1

### Week 9+ (Jan 2026 onward): Growth

**Theme**: Scale what works

**Month 1-2**:

- Deliver quality work to beta clients
- Get referrals
- Grow to 8-10 total clients
- Refine pricing based on time spent

**Month 3-4**:

- Launch segment #2 (Discord bots or musicians)
- Create case studies from beta clients
- Grow to 15-20 total clients

**Month 5-6**:

- Launch all three segments
- Hire part-time help (VA or junior dev)
- Grow to 25-30 total clients
- You're at $2,000-3,000 MRR

---

## Pricing Strategy & Pro-Bono Work

### The Helping Heart vs Business Brain

**Your instinct is beautiful**: Help indie musicians, do quality work, care more about impact than profit.

**The hard truth**: You can't help anyone if you go broke and quit.

### The Sustainable Generosity Model

**Rule**: You can afford to be generous when you're profitable, not before.

#### The 80/20 Rule

- **80% of revenue**: Full-price paying clients
- **20% of time**: Pro-bono, discount, passion projects

**In practice** (Year 1):

- 18 full-price clients
- 2 pro-bono projects
- 3-5 "friends & family" 50% discount

#### How to Say No (Without Saying No)

When someone asks for free/cheap work:

**Option 1: The Waitlist**

> "I'd love to help! I'm at capacity now, but I keep 2 spots open each quarter for portfolio projects. Can I add you to the list? Should open up in [3 months]."

**Option 2: The Trade**

> "I can't do this for free, but I can do it for exposure. In exchange, I need: a detailed testimonial, 3 referrals, and permission to use this as a case study. Deal?"

**Option 3: The Phased Approach**

> "I can build you a basic version for $X (half price), and we can add features as you grow. Sound fair?"

**Option 4: The Honest Truth**

> "I want to help, truly. But I'm trying to build a sustainable business. My costs for this project are $X. Can you meet me at $Y?"

#### The Pro-Bono Policy

Create a formal policy (write this down):

**TownesDev Pro-Bono Program**:

- **Eligibility**: Non-profits, fellow artists I respect, community benefit projects
- **Limit**: 2 projects per year, max 20 hours each
- **Requirements**:
  - Must be portfolio-worthy (I need to be proud of it)
  - Must provide testimonial and referrals
  - Must be willing to wait for my availability
  - Must cover direct costs (domain, hosting, tools)
- **Not Eligible**:
  - Anyone who can afford to pay
  - Anyone who "will pay later" (they won't)
  - Anyone disrespecting your time

**The Truth**: Most people asking for "free" can actually pay something. Your job is to make them value your work.

#### The Friends & Family Rate

**50% off one-time fee, full monthly price**

Why?

- One-time fee is your labor (you can discount your time)
- Monthly fee is your costs + ongoing work (this can't be free forever)

**Example**:

- Normal: $1,200 setup + $99/mo
- Friends: $600 setup + $99/mo

They save $600 but you still get sustainable revenue.

#### The "Passion Project" Fund

**Strategy**: Every 10th paying client, you "earn" one passion project.

- Client #10 → Free musician site
- Client #20 → Free community bot
- Client #30 → Free [whatever matters to you]

This way:

1. You're financially stable when you do free work
2. You have systems refined (better quality pro-bono)
3. You don't resent doing free work (you earned it)
4. You have portfolio pieces at regular intervals

### Price Confidently

**Remember**: You're not charging for time. You're charging for:

- Years of learning to code
- Expertise they don't have
- Saving them from terrible DIY results
- Ongoing reliability and support
- Their ability to focus on their business

**A $2,000 website for a bakery** that brings in ONE extra catering order per month pays for itself.

**A $99/mo Discord bot** that keeps 1000 members engaged is cheaper than losing them to another community.

**A $500 musician site** that books ONE show pays for itself.

**Price for value delivered, not hours worked.**

---

## What Success Looks Like

### Daily Indicators

**Morning Check** (5 minutes):

- [ ] No critical alerts from UptimeRobot
- [ ] No angry client emails
- [ ] Stripe dashboard shows expected MRR
- [ ] All client services show "healthy" in admin dashboard

**Weekly Check** (30 minutes):

- [ ] All support tickets responded to within SLA
- [ ] MRR same or higher than last week
- [ ] No failed deployments
- [ ] Test environment matches production

**Monthly Check** (2 hours):

- [ ] MRR growth greater than 5% from last month
- [ ] Churn rate less than 5%
- [ ] All clients contacted (check-in email)
- [ ] Portfolio updated with new work
- [ ] Backups tested and verified

### Financial Success Metrics

**Month 3 (March 2026)**:

- MRR: $800+
- Clients: 8-10
- One-time revenue: $5,000+
- Total: ~$7,400

**Month 6 (June 2026)**:

- MRR: $1,500+
- Clients: 15-20
- One-time revenue: $10,000+
- Total: ~$19,000

**Month 12 (Dec 2026)**:

- MRR: $2,500+
- Clients: 25-30
- One-time revenue: $20,000+
- Total: ~$50,000

### Operational Success Metrics

**Good**:

- Less than 2 hours/day on support
- Less than 5 hours/week on maintenance
- More than 30 hours/week on billable client work
- 1-2 new clients per month

**Warning Signs**:

- More than 4 hours/day on support (you're underwater)
- Multiple clients have same complaint
- You're afraid to deploy
- You're working 80+ hours/week

**Crisis**:

- Clients canceling due to reliability
- You can't sleep because you're stressed
- You're considering quitting
- Health/relationships suffering

**If you hit crisis**: Stop new sales, fix foundations, consider raising prices or reducing clients.

---

## Daily Operating System

### Morning Routine (30 min)

1. **Check Health** (5 min)
   - UptimeRobot dashboard
   - Vercel deployment status
   - Stripe dashboard (any failed payments?)
2. **Triage Support** (15 min)
   - Read new incident tickets
   - Respond to urgent (P0/P1) immediately
   - Schedule P2/P3 for later
3. **Plan Day** (10 min)
   - What's the ONE thing that must get done today?
   - Block time for client work
   - Block time for platform work

### Weekly Routine (Friday, 1 hour)

1. **Review Week** (20 min)
   - What worked?
   - What broke?
   - What did I learn?
2. **Update Clients** (20 min)
   - Send "This week's progress" email to active project clients
   - Send "Monthly check-in" to maintenance clients (rotating, 25% each week)
3. **Plan Next Week** (20 min)
   - Client commitments
   - Platform improvements
   - Marketing/sales activities

### Monthly Routine (Last Friday, 3 hours)

1. **Financial Review** (45 min)
   - Calculate MRR, churn, new revenue
   - Pay yourself
   - Set aside taxes (30% of revenue)
   - Review expenses
2. **Client Health** (45 min)
   - Which clients haven't contacted you? (Good sign!)
   - Which clients contact you weekly? (Problem sign)
   - Any at-risk clients?
   - Plan retention campaign
3. **Platform Health** (45 min)
   - Run full test suite
   - Review error logs
   - Check dependencies for updates
   - Plan next month's improvements
4. **Marketing** (45 min)
   - Update portfolio
   - Write blog post or case study
   - Post on social media
   - Reach out to 5 potential clients

---

## Hard Truths & Mindset

### Things I Wish Someone Told Me

1. **"Done" is better than "perfect"**
   - Ship the MVP pricing page. Improve it later.
   - Launch with 3 tiers. Add more when you have 20 clients.
   - Don't wait for the perfect logo. Clients care about results.

2. **Most ideas fail because of lack of marketing, not bad product**
   - Your platform is already better than most SaaS startups
   - Your biggest risk: no one knows you exist
   - Spend 50% of time building, 50% telling people about it

3. **Charge more than feels comfortable**
   - Your first price is always too low
   - Confident pricing attracts better clients
   - Cheap clients are the most demanding

4. **Say no to bad-fit clients**
   - One nightmare client will destroy you
   - Red flags: "can you do this by tomorrow", "I'll pay you when I'm successful", "I know this should only take 30 minutes"
   - Walk away from money sometimes

5. **You'll want to quit around month 3**
   - Everyone does
   - It's not because you failed, it's because it's hard
   - Push through. Month 6 is when it clicks.

6. **Helping people and making money are not opposites**
   - You help MORE people by staying in business
   - Charging fairly is respecting yourself and your clients
   - Free work attracts people who don't value you

7. **Systems beat motivation**
   - Motivation fades. Systems persist.
   - Document everything (you already are!)
   - Build once, use forever

### The Indie Developer's Oath

When you wake up tomorrow, read this:

> I will build quality work I'm proud of.
>
> I will charge fairly for the value I provide.
>
> I will help those I can, when I can afford to.
>
> I will say no to work that doesn't serve me or my clients.
>
> I will document my systems and trust my processes.
>
> I will measure progress in months and years, not days.
>
> I will forgive myself for imperfect launches.
>
> I will celebrate small wins.
>
> I will build something that lasts.

---

## Launch Checklist

### Technical Readiness

**Code**:

- [ ] Onboarding wizard → Stripe checkout wired up
- [ ] Portal gating (no subscription = paywall)
- [ ] Admin health dashboard built
- [ ] Support ticket system complete
- [ ] All tests passing

**Infrastructure**:

- [ ] Uptime monitoring configured
- [ ] Error tracking (Sentry) set up
- [ ] Backups automated and tested
- [ ] Environment variables documented
- [ ] Deployment process documented

**Security**:

- [ ] RBAC tested on all routes
- [ ] Webhook signatures verified
- [ ] No secrets in client-side code
- [ ] HTTPS everywhere
- [ ] CSP headers configured

### Business Readiness

**Legal** (Bare Minimum):

- [ ] Business name registered (TownesDev)
- [ ] Business bank account opened
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Client service agreement template

**Financial**:

- [ ] Stripe account verified
- [ ] Sanity billing set up
- [ ] Vercel billing understood
- [ ] Spreadsheet for tracking revenue/expenses
- [ ] Tax withholding plan (30% of revenue)

**Marketing**:

- [ ] Landing page live at townesdev.com
- [ ] Pricing page published
- [ ] 2-3 portfolio examples
- [ ] Social media accounts created (Twitter, LinkedIn)
- [ ] Google My Business listing (if applicable)

### Operational Readiness

**Documentation**:

- [x] SOT document (you have this!)
- [x] AI agent guidelines (you have this!)
- [ ] Client onboarding checklist
- [ ] Support response templates
- [ ] Common issues runbook

**Support**:

- [ ] Email address (support@townesdev.com)
- [ ] Incident tracking system
- [ ] SLA definitions
- [ ] Escalation process
- [ ] Office hours defined

**Sales**:

- [ ] 10 warm leads identified
- [ ] Outreach email templates
- [ ] Pitch deck or one-pager
- [ ] Referral incentive program
- [ ] Beta pricing defined

---

## My Honest Take

### What You're Doing Right

1. **Your technical foundation is SOLID**
   - Multi-tenant from day 1 (most people add this later painfully)
   - Proper authentication and RBAC
   - Documentation that most Series B startups don't have
   - Future-proof tech stack

2. **Your heart is in the right place**
   - Caring about quality over quantity
   - Wanting to help underserved markets
   - Thinking long-term (30-40 years)

3. **You're asking the right questions**
   - "How do I make this sustainable?"
   - "What should I measure?"
   - "How do I balance helping vs profiting?"

4. **You're being realistic**
   - Recognizing you need business operations, not just code
   - Willing to learn the parts you don't know
   - Setting a hard deadline (Jan 1) to force action

### What Worries Me

1. **The 8-week timeline is aggressive**
   - Not impossible, but you'll need discipline
   - Avoid feature creep ("just one more thing...")
   - Stick to the critical path

2. **The generosity mindset could sink you**
   - You WILL get people asking for cheap/free work
   - You WILL feel guilty saying no
   - You WILL undercharge at first
   - This is the #1 reason solo devs fail

3. **The three-segment strategy spreads you thin**
   - Different marketing for each
   - Different pricing strategies
   - Different support needs
   - **Solution**: Launch with ONE segment (small businesses), add others later

4. **You're solving hard problems alone**
   - Multi-tenant SaaS is complex
   - Support + dev + sales + marketing is 4 full-time jobs
   - **Solution**: Use AI agents wisely, outsource non-critical tasks, protect your focus

### What Would Make Me Confident

**If you can do these 3 things, I'd bet on you:**

1. **Launch by Jan 1 with MVP** (not perfect, just working)
2. **Get 3 paying clients by Jan 31**
3. **Stick with it for 6 months** (even when it's hard)

Most people quit at month 3. If you're still here at month 6, you'll make it.

### The Real Test

**In 60 days (Jan 1, 2026), can you show me:**

- A website where strangers can buy from you?
- A functional client portal where they access services?
- Monitoring so you know if things break?
- 3 real paying clients (even if friends)?

**If yes**: You have a business.  
**If no**: You have a cool side project.

The difference is _finishing_, not _perfecting_.

---

## Next Actions (Tomorrow Morning)

### First 3 Hours

1. **Hour 1: Plan the Week**
   - Read this document fully
   - Open `docs/development/onboarding-status.md`
   - Create a Trello/Notion board for 8-week plan
   - Break Week 1-2 tasks into daily todos

2. **Hour 2: Start Building**
   - Create `/pricing` page (copy/paste pricing from this doc)
   - Make it ugly but functional
   - Ship it to staging

3. **Hour 3: Validate Approach**
   - Show pricing page to 3 people
   - Ask: "Do you understand what I'm selling?"
   - Ask: "Does the pricing make sense?"
   - Fix top confusion point

### First Week

- **Monday-Tuesday**: Pricing page + landing page
- **Wednesday-Thursday**: Wire Stripe checkout
- **Friday**: Test full purchase flow, document issues
- **Weekend**: Fix bugs, prepare Week 2

### Every Friday at 5pm

- Update this document with:
  - What got done this week
  - What blocked me
  - What I learned
  - Plan for next week

**This document is your co-founder. Come back to it weekly.**

---

## Resources

### Essential Tools (Most Free/Cheap)

**Monitoring**:

- UptimeRobot (free tier: 50 monitors)
- Sentry (free tier: 5k errors/mo)
- Vercel Analytics (included)

**Support**:

- You already built this! Just finish the UI.

**Marketing**:

- Buffer (schedule social posts)
- Mailchimp (email marketing, free for under 2000 contacts)
- Canva (design templates)

**Project Management**:

- Notion (free for individuals)
- Trello (free forever)
- Google Sheets (tracking revenue)

**Learning**:

- Indie Hackers (community)
- MicroConf (podcasts/videos)
- "The Mom Test" by Rob Fitzpatrick (book)
- "Start Small, Stay Small" by Rob Walling (book)

### Communities

- Indie Hackers (indiehackers.com)
- Reddit: r/SideProject, r/EntrepreneurRideAlong
- Twitter: #buildinpublic hashtag

### Financial Tools

**Bare Minimum**:

- Separate business bank account
- Google Sheets for revenue tracking
- Stripe dashboard for MRR
- Calendar reminder for quarterly taxes

**When You're Making $2k+/mo**:

- QuickBooks or Wave (accounting)
- Gusto or similar (payroll if you hire)
- Business insurance
- Actual accountant

---

## Conclusion

You've built something real. The code is there. The vision is clear. The market exists.

**Now execute.**

You have 8 weeks. Not to build the perfect business. To build a _functioning_ business.

Launch messy. Improve weekly. Listen to customers. Charge fairly. Help strategically. Stay focused.

**Jan 1, 2026 isn't the finish line. It's the starting line.**

You're not building a startup. You're building a career. A 20-30 year marathon.

Run accordingly.

---

**Now go build. The world needs quality work from people who care.**

**I believe in you.** 🚀

---

**Document Status**: Living Document  
**Review**: Weekly on Fridays  
**Update**: As you learn and adapt  
**Version**: 1.0 (Nov 4, 2025)
