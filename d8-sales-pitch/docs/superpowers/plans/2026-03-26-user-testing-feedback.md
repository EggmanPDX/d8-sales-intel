# User Testing Feedback Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all 6 issues from Michael Duncan's user testing feedback on the D8/SALES_PITCH tool.

**Architecture:** Prompt engineering fixes in `prompts.js` and `constants.js` for KCU naming and cross-industry framing. ROI logic changes in `roi.js` and `StepROI.jsx` to add confidence gating and defensible metrics. Retry logic in `api.js` for transient failures. Increased `max_tokens` for deck generation. Confidence indicators on AI-generated content in `StepExport.jsx`.

**Tech Stack:** React, Vite, Anthropic Claude API, no new dependencies.

---

## Issue Summary (from Michael Duncan's testing)

| # | Issue | Root Cause | Fix Location |
|---|-------|-----------|--------------|
| 1 | KCU expanded as "Kansas City University" | Prompts say "KCU" without always spelling out "Kitsap Credit Union" — Claude hallucinates the expansion | `constants.js`, `prompts.js` |
| 2 | Credit union case study doesn't land for non-financial verticals | Email names "credit union" directly instead of framing around regulatory overlap | `prompts.js` (SYS_EXPORT, SYS_DECK) |
| 3 | "$571k annual value" is skepticism-inducing without real inputs | ROI uses slider defaults + hardcoded 97% reduction; no gating on whether user provided real data | `roi.js`, `StepROI.jsx`, `StepExport.jsx`, `prompts.js` |
| 4 | Error on first click of "Generate ROI" button | Transient API failure with no retry; `claudeJSON` fails on first attempt | `api.js` |
| 5 | Slide deck generation fails 3x in a row | `max_tokens: 1000` is too small for 8-10 slide JSON; response gets truncated, JSON parse fails | `api.js`, `App.jsx` |
| 6 | Need manual verification before presenting AI-generated stats | No confidence indicators or caveats on generated content | `StepExport.jsx` |

---

## Task 1: Fix KCU Naming — Prevent "Kansas City University" Hallucination

**Files:**
- Modify: `src/lib/constants.js:37-45`
- Modify: `src/lib/prompts.js:1-45`

The root cause is that Claude sees "KCU" in prompts and expands it to the more common "Kansas City University." Fix: always use the full name "Kitsap Credit Union" alongside the abbreviation, and add an explicit instruction not to expand "KCU" to anything else.

- [ ] **Step 1: Update constants.js — add naming guard to PLATFORM string**

In `src/lib/constants.js`, replace the KCU proof point section:

```javascript
// OLD (line 37):
KCU PROOF POINT — Kitsap Credit Union (community credit union, financial services):

// NEW:
KCU PROOF POINT — "KCU" means Kitsap Credit Union (a community credit union in Washington state). NEVER expand KCU as "Kansas City University" or anything else.
Kitsap Credit Union (financial services):
```

- [ ] **Step 2: Update all four prompts — add naming guard**

In `src/lib/prompts.js`, add this line to the beginning of every system prompt (SYS_RESEARCH, SYS_SOLUTION, SYS_EXPORT, SYS_DECK):

```
CRITICAL: "KCU" refers exclusively to Kitsap Credit Union — a community credit union in Washington state. Never expand KCU as "Kansas City University" or any other name.
```

Specifically:
- Line 3 (`SYS_RESEARCH`): prepend the guard before "You are a D8TAOPS sales intelligence analyst."
- Line 12 (`SYS_SOLUTION`): prepend the guard before "You are a D8TAOPS solution architect."
- Line 24 (`SYS_EXPORT`): prepend the guard before "You are a D8TAOPS sales writer."
- Line 34 (`SYS_DECK`): prepend the guard before "You are a D8TAOPS sales presentation writer."

- [ ] **Step 3: Test by running dev server and generating materials for any company**

Run: `npm run dev`
Enter any company/industry, go through the flow, and verify all generated content says "Kitsap Credit Union" — never "Kansas City University."

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.js src/lib/prompts.js
git commit -m "fix: prevent KCU from being expanded as Kansas City University

Add explicit naming guard to all prompts and the PLATFORM constant
so Claude never hallucinates the wrong KCU expansion."
```

---

## Task 2: Reframe Case Study for Cross-Industry Credibility

**Files:**
- Modify: `src/lib/prompts.js:24-32` (SYS_EXPORT)
- Modify: `src/lib/prompts.js:34-45` (SYS_DECK)
- Modify: `src/lib/constants.js:44-45` (sales bridge instruction)

The problem: telling a manufacturing company "we saved a credit union" doesn't land. The fix: instruct Claude to frame KCU as "a financial institution in a heavily regulated industry" and bridge on the **regulatory/compliance overlap** — not the vertical itself. The email should acknowledge the industries are different, then connect on shared complexity (specialized regulations, data accuracy requirements, audit compliance).

- [ ] **Step 1: Update SYS_EXPORT prompt — cross-industry bridge framing**

Replace the entire `SYS_EXPORT` prompt in `src/lib/prompts.js` (lines 24-32):

```javascript
export const SYS_EXPORT = `CRITICAL: "KCU" refers exclusively to Kitsap Credit Union — a community credit union in Washington state. Never expand KCU as "Kansas City University" or any other name.
You are a D8TAOPS sales writer. Be specific and direct.

CASE STUDY FRAMING RULES — follow these exactly:
- NEVER say "credit union" in the email body. Instead say "a financial institution operating under strict regulatory requirements."
- Acknowledge the industries are different: "While financial services and [their industry] are different verticals..."
- Bridge on the SHARED COMPLEXITY: regulatory compliance, data accuracy mandates, audit requirements, manual processes that don't scale.
- Pattern: "We helped a heavily regulated financial institution achieve [result]. The overlap isn't the industry — it's the complexity: [specific shared pain]. Based on what you've described, we project [result] for you."

Return ONLY valid JSON:
{
  "emailSubject":"string",
  "emailBody":"4-paragraph ready-to-send email. \\n for line breaks. Para 1: their specific problem. Para 2: what D8TAOPS achieved for a regulated financial institution (cite KCU metrics but frame as 'a financial institution' — never 'credit union'). Acknowledge the industries differ, then bridge on shared regulatory/compliance complexity. Para 3: bridge to their projection. Para 4: soft CTA.",
  "talkingPoints":["7 full sentences. Point 3 or 4 must bridge the case study: frame as regulated financial institution, acknowledge industry difference, connect on shared complexity (compliance, accuracy mandates, audit requirements).","...","...","...","...","...","..."],
  "execSummary":"3-4 paragraphs. Problem → proof point (framed as regulated financial institution) → your projection → why D8:PLATFORM.",
  "roiLine":"One sentence bridging the case study to this prospect. Do NOT say 'credit union.' Say 'a heavily regulated financial institution.' Start with 'We helped a financial institution save...'"
}`;
```

- [ ] **Step 2: Update SYS_DECK prompt — same cross-industry framing for slide 5**

Replace `SYS_DECK` in `src/lib/prompts.js` (lines 34-45):

```javascript
export const SYS_DECK = `CRITICAL: "KCU" refers exclusively to Kitsap Credit Union — a community credit union in Washington state. Never expand KCU as "Kansas City University" or any other name.
You are a D8TAOPS sales presentation writer. Build a concise 8-10 slide deck.
Slide 5 is the credibility anchor — present the case study as "a heavily regulated financial institution" (do NOT say "credit union"). Acknowledge the industry difference, then bridge on shared complexity: regulatory compliance, data accuracy, audit requirements. Be specific throughout. No generic filler slides.
Return ONLY valid JSON:
{
  "slides":[{
    "num":1,
    "title":"string",
    "layout":"title|problem|solution|agents|proof|roi|why|next-steps",
    "headline":"the one thing this slide must land",
    "bullets":["3-5 specific outcome-first bullets"],
    "speakerNote":"2-3 sentences the SL should say on this slide"
  }]
}`;
```

- [ ] **Step 3: Update the sales bridge instruction in constants.js**

In `src/lib/constants.js`, replace line 45:

```javascript
// OLD:
USE THIS AS YOUR SALES BRIDGE: "We saved KCU [X]. Based on what you've told us, we estimate we can save you [Y]."

// NEW:
USE THIS AS YOUR SALES BRIDGE: "We helped a heavily regulated financial institution achieve [X]. The overlap isn't the industry — it's the complexity of [shared pain]. Based on what you've described, we project [Y] for you."
When the prospect is in financial services, you may name Kitsap Credit Union directly. For all other industries, frame as "a financial institution under strict regulatory requirements" and bridge on shared complexity.
```

- [ ] **Step 4: Update the KCU bridge instruction in the runExport user message**

In `src/App.jsx`, in the `runExport` function (line 47), update the KCU context line:

```javascript
// OLD:
KCU: $1.2M+ savings, 97% faster, 99.5% accuracy, sub-12-month break-even — use as proof point bridge.

// NEW:
KCU (Kitsap Credit Union): $1.2M+ savings, 97% faster, 99.5% accuracy, sub-12-month break-even. Frame as "a heavily regulated financial institution" unless prospect is in financial services. Bridge on shared complexity (compliance, accuracy mandates, audit requirements), not the vertical.
```

- [ ] **Step 5: Test cross-industry framing**

Run `npm run dev`. Enter a manufacturing company. Verify:
- Email says "financial institution" not "credit union"
- Email acknowledges industries differ
- Email bridges on regulatory/compliance overlap
- Talking points follow the same pattern

- [ ] **Step 6: Commit**

```bash
git add src/lib/prompts.js src/lib/constants.js src/App.jsx
git commit -m "fix: reframe KCU case study for cross-industry credibility

Email and deck now present KCU as 'a heavily regulated financial
institution' for non-financial prospects. Acknowledges industry
difference and bridges on shared complexity (compliance, accuracy,
audit requirements) rather than naming the vertical directly."
```

---

## Task 3: Fix ROI Confidence — Gate Projections and Add Defensible Metrics

**Files:**
- Modify: `src/lib/roi.js`
- Modify: `src/components/StepROI.jsx`
- Modify: `src/lib/prompts.js:24-32` (SYS_EXPORT — already modified in Task 2, this adds to it)
- Modify: `src/App.jsx:41-51` (runExport user message)

The problem: The tool shows "$571k annual value" based on slider defaults the user never adjusted. Without real deal size, bid count, or win rate data, this number feels made up.

The fix has three parts:
1. Track whether the user actually adjusted the ROI sliders (vs. just used defaults)
2. When sliders are at defaults, label the projection as "illustrative" and swap the dollar figure for relative metrics (% reduction, hours saved) that are defensible from the KCU data
3. Instruct the email prompt to use conservative, relative metrics when inputs aren't confirmed

- [ ] **Step 1: Add input-confidence tracking to App.jsx**

In `src/App.jsx`, add a new state variable after line 19:

```javascript
const [roiTouched, setRoiTouched] = useState(false);
```

Pass `setRoiTouched` to StepROI. Update line 77:

```javascript
{step === 3 && <StepROI roi={roi} setRoi={setRoi} setRoiTouched={setRoiTouched} loading={loading} loadMsg={loadMsg} setStep={setStep} onExport={runExport} />}
```

Also pass `roiTouched` to StepExport on line 78:

```javascript
{step === 4 && <StepExport form={form} solution={solution} materials={materials} roi={roi} roiTouched={roiTouched} deck={deck} deckBusy={deckBusy} onDeck={runDeck} setStep={setStep} onReset={handleReset} />}
```

Reset `roiTouched` in `handleReset` (line 68):

```javascript
const handleReset = () => {
  setStep(1); setResearch(null); setSolution(null);
  setMaterials(null); setDeck(null); setRoiTouched(false);
  setForm({ company: '', contact: '', industry: '', useCase: '' });
};
```

- [ ] **Step 2: Mark sliders as touched in StepROI.jsx**

In `src/components/StepROI.jsx`, accept the new prop:

```javascript
export default function StepROI({ roi, setRoi, setRoiTouched, loading, loadMsg, setStep, onExport }) {
```

In the `sldr` function's `onChange` handler (line 22), add `setRoiTouched(true)`:

```javascript
onChange={e => { setRoi(p => ({ ...p, [field]: Number(e.target.value) })); setRoiTouched(true); }}
```

- [ ] **Step 3: Add confidence label to ROI header in StepROI.jsx**

In `src/components/StepROI.jsx`, after the `ovl` div on line 29, add a confidence indicator. Replace the header block (lines 28-43):

```jsx
<div style={{ background: NAVY, borderRadius: 12, padding: '20px 26px', marginBottom: 14 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <div style={{ ...ovl, color: '#7FC5F0', marginBottom: 0 }}>KCU-CALIBRATED ROI PROJECTION</div>
    {!roiTouched && (
      <div style={{ fontSize: 9, fontWeight: 600, color: '#FCD34D', background: 'rgba(252,211,77,0.15)', padding: '3px 10px', borderRadius: 4 }}>
        ⚠ ILLUSTRATIVE — adjust sliders with real data
      </div>
    )}
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
    {[
      { val: fmtK(r.total), lbl: 'Est. Annual Value', green: true },
      { val: r.roiPct + '%', lbl: 'ROI' },
      { val: r.payback + ' mo', lbl: 'Payback Period' },
      { val: r.hrsSaved.toLocaleString(), lbl: 'Person-Hours Saved/yr' }
    ].map((item, i) => (
      <div key={i} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 8, background: 'rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: item.green ? '#4ADE80' : '#fff', lineHeight: 1 }}>{item.val}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.lbl}</div>
      </div>
    ))}
  </div>
</div>
```

This requires accepting `roiTouched` as a prop — update function signature to include it. Actually, we need to pass it from App.jsx. Update App.jsx line 77:

```javascript
{step === 3 && <StepROI roi={roi} setRoi={setRoi} setRoiTouched={setRoiTouched} roiTouched={roiTouched} loading={loading} loadMsg={loadMsg} setStep={setStep} onExport={runExport} />}
```

And the StepROI function signature:

```javascript
export default function StepROI({ roi, setRoi, setRoiTouched, roiTouched, loading, loadMsg, setStep, onExport }) {
```

- [ ] **Step 4: Swap email metrics based on confidence level**

In `src/App.jsx`, update the `runExport` function to pass confidence context. Replace the user message in `runExport` (lines 46-47):

```javascript
const roiConfidence = roiTouched ? 'USER-CONFIRMED' : 'ILLUSTRATIVE-DEFAULTS';
const m = await claudeJSON(SYS_EXPORT,
  `Prospect: ${form.company || form.industry + ' prospect'}\nContact: ${form.contact || 'Stakeholder'}\nGoal: ${form.useCase}\nSolution: ${JSON.stringify({ headline: solution?.headline, agents: solution?.agents?.map(a => a.id), workflow: solution?.workflow })}\nROI CONFIDENCE: ${roiConfidence}\nROI: ${fmtK(r.total)} annual value · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr · ${roi.hrs * roi.staff} hrs/cycle → ${r.aiMins} min\nKCU (Kitsap Credit Union): $1.2M+ savings, 97% faster, 99.5% accuracy, sub-12-month break-even. Frame as "a heavily regulated financial institution" unless prospect is in financial services. Bridge on shared complexity (compliance, accuracy mandates, audit requirements), not the vertical.\n${roiConfidence === 'ILLUSTRATIVE-DEFAULTS' ? 'IMPORTANT: ROI inputs are illustrative defaults — the user did NOT provide real numbers. Do NOT cite specific dollar amounts in the email. Instead use relative metrics: "97% reduction in processing time", "99.5% data accuracy vs. industry average of 80-82%", "sub-12-month break-even." Invite the prospect to share their numbers for a custom projection.' : 'ROI inputs have been confirmed by the sales leader. You may cite specific dollar projections.'}`);
```

- [ ] **Step 5: Update SYS_EXPORT to handle confidence levels**

In the SYS_EXPORT prompt (already rewritten in Task 2), add this section after the case study framing rules:

```
ROI CONFIDENCE RULES:
- If "ROI CONFIDENCE: ILLUSTRATIVE-DEFAULTS" — do NOT put specific dollar amounts in the email. Use relative metrics only: "97% time reduction", "99.5% accuracy", "sub-12-month break-even". Invite prospect to share their numbers.
- If "ROI CONFIDENCE: USER-CONFIRMED" — you may cite the specific dollar projections.
- Always lead with the KCU-proven percentages (97% faster, 99.5% accuracy) — these are real and defensible regardless of confidence level.
```

- [ ] **Step 6: Test both confidence paths**

Run `npm run dev`:
1. Go through the flow WITHOUT touching any sliders → email should use relative metrics, no dollar figures
2. Go through the flow and adjust at least one slider → email should include dollar projections

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/lib/roi.js src/components/StepROI.jsx src/lib/prompts.js
git commit -m "fix: gate ROI dollar projections behind user-confirmed inputs

Track whether ROI sliders were adjusted. When using defaults, label
projections as 'illustrative' and instruct email generation to use
relative metrics (97% faster, 99.5% accuracy) instead of specific
dollar amounts. Prevents skepticism from phantom ROI numbers."
```

---

## Task 4: Add Retry Logic to API Wrapper — Fix First-Click Failures

**Files:**
- Modify: `src/lib/api.js`

The "error on first click, works on second" pattern is a classic transient failure — cold start on the serverless function, rate limit, or network blip. Fix: add automatic retry with a short delay.

- [ ] **Step 1: Add retry logic to claudeJSON**

Replace the entire `src/lib/api.js`:

```javascript
async function callClaude(system, user, maxTokens = 1000) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error.type || JSON.stringify(data.error));
  const raw   = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  try { return JSON.parse(clean); }
  catch {
    const m = clean.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('JSON parse failed');
  }
}

export async function claudeJSON(system, user, { maxTokens = 1000, retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callClaude(system, user, maxTokens);
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}
```

Key changes:
- Extracted `callClaude` as the single-attempt function
- `claudeJSON` wraps it with retry logic (default: 1 retry after 1.5s delay)
- Added `maxTokens` parameter (needed for Task 5)
- Callers that don't pass options get the same behavior as before, plus one automatic retry

- [ ] **Step 2: Test retry behavior**

Run `npm run dev`, open browser console Network tab, click "Generate Sales Materials." If the first request fails, you should see a second request 1.5s later that succeeds — no error alert shown to user.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.js
git commit -m "fix: add retry logic to Claude API wrapper

Automatically retries once after 1.5s on transient failures.
Also adds maxTokens parameter for callers that need more tokens.
Fixes first-click error that resolves on second attempt."
```

---

## Task 5: Fix Slide Deck Generation — Increase Token Limit

**Files:**
- Modify: `src/App.jsx:53-63` (runDeck function)

The deck prompt asks for 8-10 slides, each with title, headline, 3-5 bullets, and speaker notes — that's easily 1500-2500 tokens of JSON. The default `max_tokens: 1000` truncates the response, producing invalid JSON, which triggers "JSON parse failed" every time.

- [ ] **Step 1: Update runDeck to use higher max_tokens**

In `src/App.jsx`, update the `runDeck` function (lines 53-63). Change the `claudeJSON` call to pass `maxTokens: 4096`:

```javascript
const runDeck = async () => {
  if (deck) return;
  const r = calcROI(roi);
  setDeckBusy(true);
  try {
    const d = await claudeJSON(SYS_DECK,
      `Prospect: ${form.company || form.industry + ' prospect'}\nIndustry: ${form.industry}\nGoal: ${form.useCase}\nSolution headline: ${solution?.headline}\nAgents: ${solution?.agents?.map(a => a.id + ' — ' + a.role).join('; ')}\nWorkflow: ${solution?.workflow}\nROI: ${fmtK(r.total)} · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr saved`,
      { maxTokens: 4096 });
    setDeck(d);
  } catch (e) { alert('Deck failed: ' + e.message); }
  setDeckBusy(false);
};
```

- [ ] **Step 2: Also increase max_tokens for export materials**

The export prompt generates email + 7 talking points + exec summary + ROI line — also tight at 1000 tokens. In `runExport`, update the `claudeJSON` call to pass `maxTokens: 2048`:

```javascript
const m = await claudeJSON(SYS_EXPORT, `...`, { maxTokens: 2048 });
```

(The full user message string stays the same as modified in Task 3.)

- [ ] **Step 3: Test deck generation**

Run `npm run dev`. Go through the full flow. Click "Generate Deck" on the export tab. Verify:
- Deck generates successfully
- All 8-10 slides appear with complete content
- No truncated bullets or missing speaker notes

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "fix: increase max_tokens for deck and export generation

Deck generation now uses 4096 tokens (was 1000), fixing consistent
JSON parse failures from truncated responses. Export materials
increased to 2048 tokens for complete email + talking points."
```

---

## Task 6: Add Verification Caveats to Generated Content

**Files:**
- Modify: `src/components/StepExport.jsx`

Michael said he'd want to manually verify stats, metrics, and KPIs before presenting. Add a visible caveat banner on the export step reminding the sales leader to verify AI-generated content before use.

- [ ] **Step 1: Add verification banner to StepExport**

In `src/components/StepExport.jsx`, accept the `roiTouched` prop:

```javascript
export default function StepExport({ form, solution, materials, roi, roiTouched, deck, deckBusy, onDeck, setStep, onReset }) {
```

Add a verification banner right after the `roiLine` block (after line 70), before the tabs card:

```jsx
<div style={{ ...card(), background: '#FFFBEB', border: '1.5px solid #FDE68A', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
  <div style={{ fontSize: 18, lineHeight: 1 }}>⚠</div>
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Review Before Sending</div>
    <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.6 }}>
      Industry stats, KPIs, and projected metrics are AI-generated estimates. Verify that benchmarks match this prospect's reality before presenting. KCU results (97% faster, 99.5% accuracy, $1.2M savings) are confirmed — all other figures are projections.
      {!roiTouched && <span style={{ fontWeight: 600 }}> ROI inputs are still at default values — adjust with real data for accurate projections.</span>}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Test the banner**

Run `npm run dev`. Complete the flow to Step 4. Verify:
- Yellow warning banner appears above the tabs
- When sliders were not touched, extra bold text about defaults appears
- When sliders were adjusted, only the general verification reminder shows

- [ ] **Step 3: Commit**

```bash
git add src/components/StepExport.jsx
git commit -m "feat: add verification banner to export step

Reminds sales leaders to verify AI-generated stats and benchmarks
before presenting to prospects. Extra callout when ROI sliders
are still at default values."
```

---

## Execution Order

Tasks 1-2 are prompt-only changes (no shared dependencies). Tasks 3-5 share `api.js` and `App.jsx` modifications. Task 6 depends on the `roiTouched` prop from Task 3. Recommended order:

1. **Task 4** (retry logic) — standalone, unblocks Task 5
2. **Task 5** (max_tokens) — depends on Task 4's new API signature
3. **Task 1** (KCU naming) — standalone prompt fix
4. **Task 2** (cross-industry framing) — builds on Task 1's naming guards
5. **Task 3** (ROI confidence) — modifies App.jsx and StepROI.jsx
6. **Task 6** (verification banner) — depends on Task 3's `roiTouched` prop
