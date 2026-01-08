# NGX Transform v2.2: 4-Week Launch Roadmap
## GENESIS Bridge + Premium Lead Magnet Experience

**Status**: READY FOR EXECUTION  
**Target Launch**: 4 weeks from today  
**Success Metric**: 8-12% ASCEND conversion from plan downloaders  

---

## WEEK 1: FOUNDATION (Components)

### Monday-Tuesday: Dramatic Reveal Animation
**Task Owner**: [Frontend Dev]

- [ ] Create `src/components/results/DramaticReveal.tsx`
  - [ ] 3-second countdown animation
  - [ ] Image morphing (m0 to m12, 4 seconds)
  - [ ] Overlay text reveal
  - [ ] Test with Framer Motion
  - [ ] Responsive design (mobile first)

**Deliverable**: Component working locally, accepts originalImage + transformedImage props

**Time**: 4-6 hours

---

### Wednesday: Social Proof Counter
**Task Owner**: [Frontend Dev]

- [ ] Create `src/components/results/SocialCounter.tsx`
  - [ ] Fetch `/api/counter?period=weekly` endpoint
  - [ ] Display live count with animation
  - [ ] Fallback values if API slow
  - [ ] Update every 5 minutes

**Deliverable**: Component shows "15,234+ personas esta semana"

**Time**: 2-3 hours

---

### Thursday-Friday: AgentBridgeCTA Layout
**Task Owner**: [Frontend Dev]

- [ ] Create `src/components/results/AgentBridgeCTA.tsx`
  - [ ] Hero section with GENESIS intro copy
  - [ ] 3 agent cards (BLAZE, TRINITY, APOLLO)
  - [ ] "Ver Demo en Vivo" button (functional)
  - [ ] Styling with Tailwind + gradient

**Deliverable**: Static component renders, button toggles demo state

**Time**: 4-5 hours

---

### Friday: Results Page Integration Test
**Task Owner**: [Frontend Dev]

- [ ] Import all 3 new components into `/s/[shareId].tsx`
- [ ] Test scroll flow: Reveal → Counter → Agent → Plan
- [ ] Visual hierarchy and spacing
- [ ] Mobile responsiveness

**Deliverable**: Full results page flows visually (missing API calls)

**Time**: 2-3 hours

---

## WEEK 2: BACKEND INTEGRATION

### Monday-Tuesday: GENESIS Demo Endpoint
**Task Owner**: [Backend Dev]

#### In ngx-transform:
- [ ] Create `app/src/app/api/genesis-demo/route.ts`
  - [ ] Accept POST with sessionId, userQuestion, stats
  - [ ] Call GENESIS backend (URL TBD with GENESIS team)
  - [ ] Log telemetry event
  - [ ] Return structured response

**Dependencies**: Need GENESIS API URL + auth key

**Deliverable**: Endpoint returns GENESIS response in <2 seconds

**Time**: 4-6 hours

#### In genesis_A2UI_chatbot:
- [ ] Create `backend/src/routes/demo.route.ts`
  - [ ] POST `/api/v1/demo/agent-response`
  - [ ] Accept context (stats, psychology, fitness)
  - [ ] Call gemini orchestrator
  - [ ] Return agent response + subAgents involved

**Deliverable**: Endpoint can be called from ngx-transform

**Time**: 3-4 hours

---

### Wednesday: GenesisEmbeddedChat Component
**Task Owner**: [Frontend Dev]

- [ ] Create `src/components/results/GenesisEmbeddedChat.tsx`
  - [ ] 3 pre-loaded demo conversations
  - [ ] Call `/api/genesis-demo` for live responses
  - [ ] Fallback to sample responses if API slow
  - [ ] Demo navigation buttons (Demo 1, 2, 3)
  - [ ] Animate message arrival

**Deliverable**: Component shows demo conversations, can switch between them

**Time**: 4-5 hours

---

### Thursday: Plan Download Enhancement
**Task Owner**: [Backend Dev]

- [ ] Enhance `/api/plan/[shareId]` endpoint
  - [ ] Generate 7-day basic plan from session data
  - [ ] PDF generation (use jsPDF or similar)
  - [ ] Include upsell copy
  - [ ] Return PDF URL

**Dependencies**: PDF library choice (recommend jsPDF + html2pdf)

**Deliverable**: Endpoint returns downloadable PDF with plan

**Time**: 5-6 hours

---

### Friday: Plan Download Component
**Task Owner**: [Frontend Dev]

- [ ] Create `src/components/results/PlanDownloadCard.tsx`
  - [ ] Display plan preview (7 days)
  - [ ] "Descargar Plan Gratuito" button
  - [ ] Loading state + success confirmation
  - [ ] Upsell section (ASCEND $99/mo)
  - [ ] Track telemetry on download

**Deliverable**: User can click button and download PDF

**Time**: 3-4 hours

---

## WEEK 3: RESULTS PAGE ORCHESTRATION

### Monday: Full Page Integration
**Task Owner**: [Frontend Dev]

- [ ] Integrate all components into `/s/[shareId].tsx`
  ```typescript
  <> 
    <DramaticReveal />
    <SocialCounter />
    <TimelineViewer /> // existing
    <NeonRadar /> // existing
    <AgentBridgeCTA />
    <PlanDownloadCard />
  </>
  ```
- [ ] Scroll-based reveal animations
- [ ] Loading states for async components
- [ ] Error boundaries

**Deliverable**: Full results page with all components

**Time**: 4-5 hours

---

### Tuesday-Wednesday: Email Sequence Setup
**Task Owner**: [Backend Dev]

- [ ] Create email templates in `src/emails/sequence/`
  - [ ] `D0Results.tsx` - "Tu plan está listo"
  - [ ] `D1Reminder.tsx` - "Revisa tu análisis completo"
  - [ ] `D3Plan.tsx` - "Aquí tu plan de 7 días"
  - [ ] `D7Conversion.tsx` - "Únete a ASCEND"

- [ ] Setup email scheduler
  - [ ] D0: Immediate on results generation
  - [ ] D1: 24 hours later
  - [ ] D3: 72 hours later
  - [ ] D7: 7 days later

**Deliverable**: Email sequence fires on schedule

**Time**: 4-5 hours

---

### Thursday: A/B Test Setup
**Task Owner**: [Product/Backend]

- [ ] Setup feature flags
  ```typescript
  FF_DRAMATIC_REVEAL = true/false       // Control countdown animation
  FF_GENESIS_BRIDGE = true/false        // Control agent demo section
  FF_SOCIAL_COUNTER = true/false        // Control counter visibility
  FF_PLAN_7_DIAS = true/false           // Control plan download
  ```

- [ ] Create variants:
  - Variant A: Full v2.2 (all features)
  - Variant B: Without DramaticReveal (static image)
  - Variant C: Control (original v2.1)

- [ ] Setup analytics tracking
  - [ ] View time per section
  - [ ] Click rates on each CTA
  - [ ] Conversion funnel

**Deliverable**: 50% traffic to Variant A, 25% each to B & C

**Time**: 3-4 hours

---

### Friday: QA & Bug Fixes
**Task Owner**: [QA Team]

- [ ] Manual testing on all devices
  - [ ] Desktop (Chrome, Safari, Firefox)
  - [ ] Mobile (iOS Safari, Android Chrome)
  - [ ] Tablet

- [ ] Test user flows
  - [ ] Email capture → Wizard → Results (complete)
  - [ ] Photo upload with various image sizes
  - [ ] Results page load time (<3s)
  - [ ] Download PDF (check file integrity)
  - [ ] GENESIS demo response time

- [ ] Bug triage & fixes

**Deliverable**: QA sign-off, no P0/P1 bugs

**Time**: 8 hours

---

## WEEK 4: LAUNCH & OPTIMIZATION

### Monday-Tuesday: Staging Deployment
**Task Owner**: [DevOps/Backend]

- [ ] Deploy to staging environment
  - [ ] ngx-transform staging
  - [ ] genesis_A2UI_chatbot staging
  - [ ] Point to staging APIs

- [ ] Smoke tests
  - [ ] Full user journey works
  - [ ] All APIs respond
  - [ ] No console errors

- [ ] Load test
  - [ ] 100 concurrent users
  - [ ] Genesis demo API <2s response
  - [ ] PDF generation <3s

**Deliverable**: Staging environment production-ready

**Time**: 4-5 hours

---

### Wednesday: Production Deployment
**Task Owner**: [DevOps/Backend]

- [ ] Backup production database
- [ ] Deploy with feature flags OFF
  ```
  FF_DRAMATIC_REVEAL = false
  FF_GENESIS_BRIDGE = false
  FF_SOCIAL_COUNTER = false
  FF_PLAN_7_DIAS = false
  ```
- [ ] Verify nothing breaks (runs v2.1 code)
- [ ] Gradual rollout: 10% → 25% → 50% → 100%

**Deliverable**: New code in production, old experience active

**Time**: 2-3 hours

---

### Thursday: Feature Flag Rollout
**Task Owner**: [Product]

- [ ] 9 AM: Enable FF_DRAMATIC_REVEAL = true (10% traffic)
  - Monitor for 2 hours
  - Check: View time, bounce rate, error logs
  - Increase to 50% if good

- [ ] 12 PM: Enable FF_GENESIS_BRIDGE = true (10% traffic)
  - Monitor GENESIS API response times
  - Increase to 50%

- [ ] 3 PM: Enable FF_SOCIAL_COUNTER = true (50% traffic)

- [ ] 4 PM: Enable FF_PLAN_7_DIAS = true (50% traffic)

- [ ] 5 PM: All flags = 100% if no issues

**Rollback Plan**: If any flag causes >2% error rate, disable immediately

**Deliverable**: v2.2 live to 100% of users

**Time**: 6-8 hours (monitoring)

---

### Friday: Optimization & Monitoring
**Task Owner**: [Product/Engineering]

- [ ] Monitor key metrics
  - [ ] Results page load time (target <3s)
  - [ ] GENESIS demo response time (target <2s)
  - [ ] PDF generation time (target <3s)
  - [ ] Error rates (target <0.5%)
  - [ ] User session completion (target >70%)

- [ ] Collect user feedback
  - [ ] Surveys on results page ("Was this experience helpful?")
  - [ ] Hotjar session recordings
  - [ ] Slack #product-feedback channel

- [ ] Quick wins
  - [ ] If dramatic reveal causing slowness, optimize animation
  - [ ] If GENESIS API slow, increase sample response caching
  - [ ] If PDF generation fails, improve error messaging

**Deliverable**: Baseline metrics recorded for Week 2 optimization

**Time**: 4-6 hours

---

## CRITICAL PATH ITEMS

🔴 **BLOCKING**:
1. GENESIS API URL + auth key (needed by Week 2 Monday)
2. PDF library decision (needed by Week 2 Thursday)
3. Gemini API quota confirmation (needed by Week 2 Monday)

🟡 **HIGH PRIORITY**:
1. Results page design review (needs approval before Week 1 Friday)
2. Copy approval (GENESIS intro text, email templates)
3. Feature flag system implementation

---

## DAILY STANDUP TEMPLATE

```
Monday 9 AM (Daily):

Frontend Dev:
- Completed: [Component name]
- In Progress: [Component name]
- Blocked by: [None/Item name]
- Help needed: [If any]

Backend Dev:
- Completed: [API endpoint]
- In Progress: [API endpoint]
- Blocked by: [None/Item name]
- Help needed: [If any]

Product:
- Metrics this week: [KPI movements]
- Design decisions: [If any]
- Risk assessment: [If any]
```

---

## SUCCESS CRITERIA (End of Week 4)

✅ **Technical**:
- [ ] All 5 new components built & tested
- [ ] All 3 new API endpoints working (<2s response)
- [ ] Email sequence firing on schedule
- [ ] Feature flags fully deployed
- [ ] Zero P0 bugs in production

✅ **User Experience**:
- [ ] Results page load <3s
- [ ] Dramatic reveal visible on 100% of devices
- [ ] GENESIS demo gets 25%+ click rate
- [ ] Plan download rate >40%

✅ **Conversion**:
- [ ] 8-12% of plan downloaders attempt ASCEND signup
- [ ] Email D0 open rate >60%
- [ ] Email D7 conversion link clicks >5%

---

## POST-LAUNCH (Week 5+)

### A/B Test Analysis
- [ ] Analyze 7-day results by variant
- [ ] Statistical significance testing
- [ ] Winner declared by Week 6
- [ ] Losing variant insights document

### Iteration Based on Data
- [ ] Dramatic reveal too slow? Optimize animation
- [ ] GENESIS demo response slow? Add caching
- [ ] Plan download rate low? A/B test button copy
- [ ] ASCEND conversion low? Improve upsell messaging

### Optimization
- [ ] Image lazy loading (if page slow)
- [ ] Cloudflare caching for static assets
- [ ] GENESIS response caching by profile type
- [ ] PDF pre-generation for common profiles

---

## BUDGET SUMMARY

| Item | Cost |
|------|------|
| Frontend Dev (4 weeks) | $8,000-12,000 |
| Backend Dev (4 weeks) | $8,000-12,000 |
| QA/Testing | $2,000-3,000 |
| Cloud Infrastructure (Gemini, Resend, etc.) | $500-1,000 |
| **TOTAL** | **$18,500-28,000** |

**Expected Return**: 8-12% of 15k monthly wizard completions = 1,200-1,800 ASCEND signups/month × $99 = $118,800-178,200 monthly revenue

**ROI**: 4-7x within first month ✅

---

## SIGN-OFF

Product Lead: _______________  Date: _______

CTO: _______________  Date: _______

Marketing Lead: _______________  Date: _______

---

**Ready to execute. Let's build a premium lead magnet that converts.** 🚀
