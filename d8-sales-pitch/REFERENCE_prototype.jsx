import { useState, useEffect } from "react";

const NAVY   = '#1B3A5C';
const BLUE   = '#0477BF';
const BG     = '#EFF2F6';
const WHITE  = '#FFFFFF';
const BORDER = '#DDE2EA';

const AGENTS = [
  { id:'INGEST',  label:'D8:INGEST',  color:'#0477BF', short:'Connects to all data sources — zero new infrastructure' },
  { id:'CAT',     label:'D8:CAT',     color:'#0D5F8C', short:'Discovers and catalogs data with full lineage tracking' },
  { id:'CURATE',  label:'D8:CURATE',  color:'#167A45', short:'Validates and cleans data — only quality data passes through' },
  { id:'FLOW',    label:'D8:FLOW',    color:'#6B3FA0', short:'Orchestrates workflows — the pipeline traffic cop' },
  { id:'SEC',     label:'D8:SEC',     color:'#B45A00', short:'Enforces security at every data touchpoint' },
  { id:'OBSERVE', label:'D8:OBSERVE', color:'#C41E3A', short:'Real-time anomaly monitoring and incident prevention' },
  { id:'STAGE',   label:'D8:STAGE',   color:'#2E7D32', short:'Delivers production-ready validated data products' },
  { id:'VIEW',    label:'D8:VIEW',    color:'#1B3A5C', short:'Human-facing dashboard for operators and decision-makers' },
];

const PLATFORM = `
D8:PLATFORM is a suite of 8 AI agents configurable in any combination. They work with data wherever it lives — no replacing existing systems, no new infrastructure required.

AGENTS:
D8:INGEST — Connects directly to existing data sources. No new hardware. Data stays in client domain.
D8:CAT — Discovers and catalogs all data. Full lineage tracking for transparency and accountability.
D8:CURATE — Validates and prepares data for AI. Cleans unusable or incomplete data. Only quality data passes through.
D8:FLOW — Orchestrates workflows and manages reconciliation. The traffic cop of the pipeline.
D8:SEC — Enforces security at every data source and touchpoint. Governance built in, not bolted on.
D8:OBSERVE — Continuous real-time anomaly monitoring. Detects problems early — prevents incidents.
D8:STAGE — Delivers production-ready validated data products. The handoff agent.
D8:VIEW — Human-facing dashboard. Empowers operators and decision-makers with actionable insight.

KEY DIFFERENTIATORS:
- Agents travel TO data wherever it lives — Databricks, Snowflake, legacy, cloud, on-prem, any system
- No migration required. Data never leaves client infrastructure.
- Any combination of agents, purpose-built for the use case.
- 90-day implementations vs. 18-month migrations

KCU PROOF POINT — Kitsap Credit Union (community credit union, financial services):
D8TAOPS automated KCU's manual loan audit process across existing systems — no new infrastructure.
• 97% faster: 30+ min per file → under 1 minute
• 99.5% data accuracy (industry avg: ~80–82%)
• 100% coverage: every loan, every night (vs. manual sampling)
• $1.2M+ projected savings · sub-12-month break-even
• Zero new infrastructure · audit staff freed for strategic work

USE THIS AS YOUR SALES BRIDGE: "We saved KCU [X]. Based on what you've told us, we estimate we can save you [Y]."
`;

async function claudeJSON(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw   = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  try { return JSON.parse(clean); }
  catch { const m = clean.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('JSON parse failed'); }
}

const SYS_RESEARCH = `You are a D8TAOPS sales intelligence analyst.
Return ONLY valid JSON:
{
  "companyProfile": { "name":"string","industry":"string","overview":"2-3 sentences","size":"small|mid-market|enterprise","dataSystems":["5-7 systems"] },
  "painPoints": [{ "process":"string","problem":"string","impact":"string" }],
  "benchmarks": { "processTime":"string","errorRate":"string","staffChallenge":"string" },
  "opportunities": [{ "name":"string","desc":"one sentence","urgency":"High|Medium|Low" }]
}`;

const SYS_SOLUTION = `You are a D8TAOPS solution architect. Design the optimal D8:PLATFORM configuration.
${PLATFORM}
Return ONLY valid JSON:
{
  "headline":"one specific value proposition sentence",
  "sub":"one sentence connecting their pain to what changes",
  "agents":[{ "id":"INGEST|CAT|CURATE|FLOW|SEC|OBSERVE|STAGE|VIEW","role":"what this agent does for THIS client","benefit":"outcome 5 words max" }],
  "workflow":"2-3 sentences on how agents work together for this use case",
  "outcomes":[{ "metric":"string","before":"string","after":"string" }],
  "advantage":"one sentence: D8:PLATFORM vs. alternatives"
}`;

const SYS_EXPORT = `You are a D8TAOPS sales writer. Be specific and direct. Use the KCU proof point as a credibility bridge: explicitly state what D8TAOPS achieved at KCU, then project what that means for this prospect specifically. Format: "We saved KCU [result]. Based on your [inputs], we estimate we can deliver [result] for you."
Return ONLY valid JSON:
{
  "emailSubject":"string",
  "emailBody":"4-paragraph ready-to-send email. \\n for line breaks. Para 1: their specific problem. Para 2: what D8TAOPS did at KCU (cite specifics). Para 3: bridge to their projection. Para 4: soft CTA.",
  "talkingPoints":["7 full sentences. Point 3 or 4 must be the KCU bridge: 'At KCU we [result] — for an organization like yours, that projects to [result].'","...","...","...","...","...","..."],
  "execSummary":"3-4 paragraphs. Problem → KCU proof → your projection → why D8:PLATFORM.",
  "roiLine":"One sentence bridging KCU results to this prospect's projection. Start with 'We saved KCU...'"
}`;

const SYS_DECK = `You are a D8TAOPS sales presentation writer. Build a concise 8-10 slide deck. KCU proof point is slide 5 — the credibility anchor. Be specific throughout. No generic filler slides.
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

// ROI: hrs = hours per cycle per person · staff = headcount on process
// Total person-hours = hrs × staff × annual cycles
const calcROI = (roi) => {
  const annualCycles = roi.vol * 12;
  const totalHrs     = roi.hrs * roi.staff;
  const aiHrs        = totalHrs * 0.03;                                    // 97% reduction
  const hrsSaved     = (totalHrs - aiHrs) * annualCycles;
  const timeSave     = hrsSaved * roi.rate;
  const errSave      = annualCycles * Math.max(0, roi.errPct / 100 - 0.005) * roi.errCost;
  const total        = timeSave + errSave;
  const impl         = Math.max(65000, Math.min(280000, roi.vol * 45 + 40000));
  return {
    timeSave, errSave, total,
    hrsSaved:  Math.round(hrsSaved),
    aiMins:    Math.max(1, Math.round(roi.hrs * 0.03 * 60)),
    impl,
    roiPct:    Math.round((total - impl) / impl * 100),
    payback:   Math.max(1, Math.ceil(impl / (total / 12)))
  };
};
const fmt  = n => '$' + Math.round(n).toLocaleString();
const fmtK = n => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + Math.round(n/1000) + 'K' : fmt(n);

export default function D8SalesTool() {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState({ company:'', contact:'', industry:'', useCase:'' });
  const [research, setResearch]     = useState(null);
  const [solution, setSolution]     = useState(null);
  const [materials, setMaterials]   = useState(null);
  const [deck, setDeck]             = useState(null);
  const [roi, setRoi]               = useState({ vol:12, hrs:24, staff:3, rate:55, errPct:15, errCost:850 });
  const [loading, setLoading]       = useState(false);
  const [loadMsg, setLoadMsg]       = useState('');
  const [tab, setTab]               = useState('email');
  const [copied, setCopied]         = useState('');
  const [deckBusy, setDeckBusy]     = useState(false);

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }, []);

  // style helpers
  const card  = (x={}) => ({ background:WHITE, borderRadius:12, padding:'20px 24px', marginBottom:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:`1px solid ${BORDER}`, ...x });
  const h2    = { color:NAVY, fontSize:14, fontWeight:600, margin:'0 0 12px' };
  const lbl   = { display:'block', fontSize:10, fontWeight:600, color:'#374151', marginBottom:5, letterSpacing:'0.05em', textTransform:'uppercase' };
  const inp   = { width:'100%', padding:'9px 13px', border:`1.5px solid ${BORDER}`, borderRadius:7, fontSize:13, fontFamily:'inherit', color:'#111', outline:'none', boxSizing:'border-box' };
  const btnP  = (dis) => ({ background:dis?'#93C5FD':BLUE, color:'#fff', border:'none', borderRadius:7, padding:'11px 22px', fontSize:13, fontWeight:600, cursor:dis?'not-allowed':'pointer', fontFamily:'inherit' });
  const btnS  = (x={}) => ({ background:'transparent', color:NAVY, border:`1.5px solid ${NAVY}`, borderRadius:7, padding:'10px 18px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', ...x });
  const badge = (color) => ({ display:'inline-block', background:color+'1A', color, padding:'3px 9px', borderRadius:10, fontSize:10, fontWeight:600, whiteSpace:'nowrap' });
  const ovl   = { fontSize:9, fontWeight:700, color:BLUE, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 };

  const sldr = (label, field, min, max, step, disp) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:600, color:'#374151' }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:BLUE }}>{disp(roi[field])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={roi[field]}
        style={{ width:'100%', accentColor:BLUE, cursor:'pointer' }}
        onChange={e => setRoi(p => ({ ...p, [field]: Number(e.target.value) }))} />
    </div>
  );

  const navBtn = (n, label) => {
    const active=step===n, done=step>n, ok=done||active;
    return (
      <button key={n} onClick={() => ok && setStep(n)}
        style={{ padding:'5px 13px', borderRadius:20, border:'none', cursor:ok?'pointer':'default', fontFamily:'inherit', fontSize:10, fontWeight:600, letterSpacing:'0.05em',
          background:active?BLUE:done?'rgba(4,119,191,0.3)':'rgba(255,255,255,0.1)',
          color:active?'#fff':done?'#90CAF9':'rgba(255,255,255,0.3)' }}>
        {done?'✓':n}. {label}
      </button>
    );
  };

  // API flows
  const runAnalysis = async () => {
    if (!form.industry || !form.useCase) return;
    setLoading(true);
    try {
      setLoadMsg('Researching industry benchmarks...');
      const r = await claudeJSON(SYS_RESEARCH,
        `Company: ${form.company||'Not specified'}\nContact: ${form.contact||'Not specified'}\nIndustry: ${form.industry}\nGoal: "${form.useCase}"`);
      setResearch(r);
      setLoadMsg('Designing D8:PLATFORM configuration...');
      const s = await claudeJSON(SYS_SOLUTION,
        `Prospect: ${JSON.stringify(r)}\nGoal: "${form.useCase}"`);
      setSolution(s);
      setStep(2);
    } catch(e) { alert('Analysis failed: '+e.message); }
    setLoading(false);
  };

  const runExport = async () => {
    if (materials) { setStep(4); return; }
    const r = calcROI(roi);
    setLoading(true); setLoadMsg('Writing sales materials...');
    try {
      const m = await claudeJSON(SYS_EXPORT,
        `Prospect: ${form.company||form.industry+' prospect'}\nContact: ${form.contact||'Stakeholder'}\nGoal: ${form.useCase}\nSolution: ${JSON.stringify({ headline:solution?.headline, agents:solution?.agents?.map(a=>a.id), workflow:solution?.workflow })}\nROI: ${fmtK(r.total)} annual value · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr · ${roi.hrs*roi.staff} hrs/cycle → ${r.aiMins} min\nKCU: $1.2M+ savings, 97% faster, 99.5% accuracy, sub-12-month break-even — use as proof point bridge.`);
      setMaterials(m); setStep(4);
    } catch(e) { alert('Export failed: '+e.message); }
    setLoading(false);
  };

  const runDeck = async () => {
    if (deck) { setTab('deck'); return; }
    const r = calcROI(roi);
    setDeckBusy(true);
    try {
      const d = await claudeJSON(SYS_DECK,
        `Prospect: ${form.company||form.industry+' prospect'}\nIndustry: ${form.industry}\nGoal: ${form.useCase}\nSolution headline: ${solution?.headline}\nAgents: ${solution?.agents?.map(a=>a.id+' — '+a.role).join('; ')}\nWorkflow: ${solution?.workflow}\nROI: ${fmtK(r.total)} · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr saved`);
      setDeck(d); setTab('deck');
    } catch(e) { alert('Deck failed: '+e.message); }
    setDeckBusy(false);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  // —— STEP 1 ————————————————————————————————————————————————
  const renderTarget = () => (
    <div>
      <div style={card()}>
        <div style={ovl}>D8:PLATFORM · Sales Intelligence</div>
        <h1 style={{ color:NAVY, fontSize:20, fontWeight:700, margin:'0 0 6px' }}>Build Your Sales Story</h1>
        <p style={{ color:'#666', fontSize:13, lineHeight:1.65, margin:'0 0 22px' }}>
          Enter an industry and use case. The tool generates a tailored D8:PLATFORM solution, KCU-calibrated ROI model, and ready-to-use sales materials — including a slide deck outline for PowerPoint.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <label style={lbl}>Company <span style={{ fontWeight:400, textTransform:'none', color:'#aaa' }}>(optional)</span></label>
            <input style={inp} placeholder="e.g. Pacific Community Bank" value={form.company}
              onChange={e => setForm(f => ({ ...f, company:e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Contact <span style={{ fontWeight:400, textTransform:'none', color:'#aaa' }}>(optional)</span></label>
            <input style={inp} placeholder="e.g. Sarah Mitchell, VP Operations" value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact:e.target.value }))} />
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Industry / Business Type <span style={{ color:'#C41E3A' }}>*</span></label>
          <input style={inp} placeholder="Community Banking · Healthcare · Manufacturing · Logistics · Insurance..."
            value={form.industry} onChange={e => setForm(f => ({ ...f, industry:e.target.value }))} />
        </div>
        <div style={{ marginBottom:22 }}>
          <label style={lbl}>We're trying to... <span style={{ color:'#C41E3A' }}>*</span></label>
          <textarea style={{ ...inp, resize:'vertical', minHeight:80 }}
            placeholder={`e.g. "We're trying to automate monthly compliance reporting — our team spends 3 days pulling data from 4 different systems."`}
            value={form.useCase} onChange={e => setForm(f => ({ ...f, useCase:e.target.value }))} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button style={btnP(!form.industry||!form.useCase||loading)} disabled={!form.industry||!form.useCase||loading} onClick={runAnalysis}>
            {loading ? `⏳  ${loadMsg}` : 'Research & Analyze →'}
          </button>
          {loading && <span style={{ fontSize:11, color:'#888', fontStyle:'italic' }}>~20 seconds...</span>}
        </div>
      </div>
      <div style={card()}>
        <h2 style={h2}>D8:PLATFORM — 8 Agents, Any Configuration</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:9 }}>
          {AGENTS.map(a => (
            <div key={a.id} style={{ padding:'11px 13px', borderRadius:8, border:`1.5px solid ${a.color}28`, background:a.color+'09' }}>
              <div style={{ fontWeight:700, color:a.color, fontSize:11, marginBottom:4 }}>{a.label}</div>
              <div style={{ fontSize:10, color:'#777', lineHeight:1.45 }}>{a.short}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // —— STEP 2 ————————————————————————————————————————————————
  const renderSolution = () => {
    if (!research||!solution) return null;
    return (
      <div>
        <div style={{ background:NAVY, borderRadius:12, padding:'22px 28px', marginBottom:14 }}>
          <div style={{ ...ovl, color:'#7FC5F0' }}>{research.companyProfile?.name||form.industry.toUpperCase()} · D8:PLATFORM SOLUTION</div>
          <div style={{ fontSize:19, fontWeight:700, color:'#fff', lineHeight:1.35, marginBottom:8 }}>{solution.headline}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.65 }}>{solution.sub}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:14, marginBottom:14 }}>
          <div style={card({ marginBottom:0 })}>
            <h2 style={h2}>Company Profile</h2>
            <p style={{ color:'#555', fontSize:12, lineHeight:1.65, marginBottom:12 }}>{research.companyProfile?.overview}</p>
            <div style={{ fontSize:10, fontWeight:600, color:NAVY, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Likely Data Systems</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {(research.companyProfile?.dataSystems||[]).map((d,i) => <span key={i} style={badge(BLUE)}>{d}</span>)}
            </div>
          </div>
          <div style={card({ marginBottom:0 })}>
            <h2 style={h2}>Industry Benchmarks</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <div style={{ padding:'8px 11px', background:'#FEF3C7', borderRadius:7, fontSize:11, color:'#92400E' }}><strong>Process time:</strong> {research.benchmarks?.processTime}</div>
              <div style={{ padding:'8px 11px', background:'#FEE2E2', borderRadius:7, fontSize:11, color:'#991B1B' }}><strong>Error rate:</strong> {research.benchmarks?.errorRate}</div>
              <div style={{ padding:'8px 11px', background:'#F3F4F6', borderRadius:7, fontSize:11, color:'#374151' }}><strong>Capacity:</strong> {research.benchmarks?.staffChallenge}</div>
            </div>
          </div>
        </div>
        <div style={card()}>
          <h2 style={h2}>Identified Pain Points</h2>
          {(research.painPoints||[]).map((p,i) => (
            <div key={i} style={{ display:'flex', gap:14, padding:'11px 14px', background:'#F8FAFC', borderRadius:8, borderLeft:`3px solid ${BLUE}`, marginBottom:7 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:12, color:NAVY, marginBottom:2 }}>{p.process}</div>
                <div style={{ fontSize:12, color:'#555' }}>{p.problem}</div>
              </div>
              <div style={{ fontSize:11, color:'#999', fontStyle:'italic', maxWidth:180, textAlign:'right', flexShrink:0 }}>{p.impact}</div>
            </div>
          ))}
        </div>
        <div style={card()}>
          <h2 style={h2}>Recommended D8:PLATFORM Configuration</h2>
          <p style={{ color:'#555', fontSize:12, lineHeight:1.65, marginBottom:14 }}>{solution.workflow}</p>
          {(solution.agents||[]).map((a,i) => {
            const id   = (a.id||'').toUpperCase().replace('D8:','');
            const meta = AGENTS.find(ag => ag.id===id)||AGENTS[0];
            return (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'140px 1fr auto', gap:14, alignItems:'center', padding:'11px 14px', borderRadius:8, border:`1.5px solid ${meta.color}22`, background:meta.color+'08', marginBottom:7 }}>
                <div>
                  <div style={{ fontWeight:700, color:meta.color, fontSize:11, letterSpacing:'0.03em' }}>{meta.label}</div>
                  <div style={{ fontSize:10, color:'#bbb', marginTop:2, lineHeight:1.3 }}>{meta.short.split(' — ')[0]}</div>
                </div>
                <div style={{ fontSize:12, color:'#333', lineHeight:1.5 }}>{a.role}</div>
                <span style={badge('#167A45')}>{a.benefit}</span>
              </div>
            );
          })}
          {solution.advantage && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'#F0F9FF', borderRadius:7, fontSize:12, color:'#1D4ED8', borderLeft:`3px solid ${BLUE}` }}>
              <strong>Key advantage:</strong> {solution.advantage}
            </div>
          )}
        </div>
        {(solution.outcomes||[]).length > 0 && (
          <div style={card()}>
            <h2 style={h2}>Expected Outcomes</h2>
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(solution.outcomes.length,3)},1fr)`, gap:10 }}>
              {solution.outcomes.map((o,i) => (
                <div key={i} style={{ padding:14, borderRadius:8, background:'#F0F9FF', border:`1px solid ${BLUE}18` }}>
                  <div style={{ fontWeight:600, fontSize:11, color:NAVY, marginBottom:9 }}>{o.metric}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ color:'#bbb', textDecoration:'line-through', fontSize:12 }}>{o.before}</span>
                    <span style={{ color:'#ccc', fontSize:10 }}>→</span>
                    <span style={{ color:'#167A45', fontWeight:700, fontSize:13 }}>{o.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button style={btnS()} onClick={() => setStep(1)}>← Edit Inputs</button>
          <button style={btnP(false)} onClick={() => setStep(3)}>Build ROI Model →</button>
        </div>
      </div>
    );
  };

  // —— STEP 3 ————————————————————————————————————————————————
  const renderROI = () => {
    const r = calcROI(roi);
    return (
      <div>
        <div style={{ background:NAVY, borderRadius:12, padding:'20px 26px', marginBottom:14 }}>
          <div style={{ ...ovl, color:'#7FC5F0', marginBottom:12 }}>KCU-CALIBRATED ROI PROJECTION</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {[{ val:fmtK(r.total), lbl:'Est. Annual Value', green:true },{ val:r.roiPct+'%', lbl:'ROI' },{ val:r.payback+' mo', lbl:'Payback Period' },{ val:r.hrsSaved.toLocaleString(), lbl:'Person-Hours Saved/yr' }].map((item,i) => (
              <div key={i} style={{ textAlign:'center', padding:'12px 6px', borderRadius:8, background:'rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:22, fontWeight:700, color:item.green?'#4ADE80':'#fff', lineHeight:1 }}>{item.val}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginTop:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{item.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KCU → You bridge */}
        <div style={{ ...card(), background:'#ECFDF5', border:'1.5px solid #6EE7B7' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#065F46', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>We Saved KCU → We Can Save You</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 32px 1fr', gap:14, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'#6B7280', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>What we achieved at KCU</div>
              {[['97% faster processing','30 min → under 1 min per file'],['99.5% data accuracy','vs. 80–82% industry avg'],['$1.2M+ projected savings','sub-12-month break-even'],['100% coverage','every record, every night']].map(([k,v],i) => (
                <div key={i} style={{ fontSize:11, color:'#065F46', marginBottom:4 }}><strong>{k}</strong> <span style={{ color:'#555' }}>— {v}</span></div>
              ))}
            </div>
            <div style={{ fontSize:24, color:'#34D399', fontWeight:700, textAlign:'center' }}>→</div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'#6B7280', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>What we project for you</div>
              {[
                [fmtK(r.total)+'/yr estimated value','based on your inputs'],
                [roi.hrs+' hrs → '+r.aiMins+' min per cycle','97% reduction applied'],
                [r.hrsSaved.toLocaleString()+' person-hours saved/yr',roi.staff+' staff reclaimed for strategic work'],
                [r.payback+'-month break-even','similar to KCU profile'],
              ].map(([k,v],i) => (
                <div key={i} style={{ fontSize:11, color:'#1E3A5F', marginBottom:4 }}><strong>{k}</strong> <span style={{ color:'#555' }}>— {v}</span></div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={card({ marginBottom:0 })}>
            <h2 style={h2}>Adjust Model Inputs</h2>
            <div style={{ fontSize:10, color:'#888', marginBottom:14, fontStyle:'italic', lineHeight:1.5 }}>
              Hours per cycle = per person. Staff = headcount. Total person-hours = hrs × staff × annual cycles.
            </div>
            {sldr('Monthly Volume (cycles)', 'vol',    1,   200, 1,   v => v+' / mo')}
            {sldr('Hours Per Cycle (per person)', 'hrs', 0.5, 48, 0.5, v => v+' hrs')}
            {sldr('Staff on This Process', 'staff',    1,   30,  1,   v => v+' people')}
            {sldr('Avg Hourly Rate (burdened)', 'rate', 25, 175,  5,   v => '$'+v+'/hr')}
            {sldr('Current Error / Rework Rate', 'errPct', 1, 40, 1,  v => v+'%')}
            {sldr('Avg Cost Per Error', 'errCost',     100, 5000, 100, v => '$'+v.toLocaleString())}
            <div style={{ padding:'10px 12px', background:'#F8FAFC', borderRadius:7, fontSize:11, color:'#555', marginTop:4 }}>
              <strong>Total person-hours/cycle:</strong> {(roi.hrs*roi.staff).toFixed(1)} hrs · <strong>Annual:</strong> {Math.round(roi.hrs*roi.staff*roi.vol*12).toLocaleString()} hrs
            </div>
          </div>
          <div>
            <div style={card({ marginBottom:10 })}>
              <h2 style={h2}>Value Breakdown</h2>
              {[
                { lbl:'Time Savings',         val:fmt(r.timeSave), sub:`${r.hrsSaved.toLocaleString()} person-hrs/yr reclaimed`, color:BLUE },
                { lbl:'Error Reduction',       val:fmt(r.errSave),  sub:`${roi.errPct}% → 0.5% error rate`,                     color:'#167A45' },
                { lbl:'Total Annual Value',    val:fmtK(r.total),   sub:'Combined annual impact',                               color:NAVY, bold:true },
                { lbl:'Implementation (est.)', val:fmt(r.impl),     sub:'One-time · zero infrastructure cost',                  color:'#bbb' },
              ].map((item,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'9px 0', borderBottom:i<3?`1px solid ${BORDER}`:'none' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:item.bold?700:500, color:item.bold?NAVY:'#444' }}>{item.lbl}</div>
                    <div style={{ fontSize:10, color:'#bbb', marginTop:2 }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card({ marginBottom:0 }), background:'#F0FDF4', border:'1.5px solid #BBF7D0' }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#2E7D32', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>Model Calibration</div>
              <div style={{ fontSize:11, color:'#1A4D2E', lineHeight:1.7 }}>
                Projections scaled from KCU results: <strong>97% time reduction</strong> applied to your hours · <strong>99.5% accuracy</strong> applied to your error rate. Implementation range: $65K–$280K based on volume.
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          <button style={btnS()} onClick={() => setStep(2)}>← Solution</button>
          <button style={btnP(loading)} disabled={loading} onClick={runExport}>
            {loading ? `⏳  ${loadMsg}` : 'Generate Sales Materials →'}
          </button>
        </div>
      </div>
    );
  };

  // —— STEP 4 ————————————————————————————————————————————————
  const renderExport = () => {
    if (!materials) return null;
    const r = calcROI(roi);

    const roiCard = [
      `D8:PLATFORM ROI SUMMARY`,`${'─'.repeat(52)}`,
      `Prospect:         ${form.company||form.industry+' prospect'}`,
      form.contact ? `Contact:          ${form.contact}` : '',
      `Goal:             ${form.useCase}`,``,
      `KCU PROOF POINT (sales anchor)`,`${'─'.repeat(52)}`,
      `At Kitsap Credit Union, D8:PLATFORM delivered:`,
      `  • 97% faster processing (30 min → under 1 min/file)`,
      `  • 99.5% data accuracy (vs. 80–82% industry avg)`,
      `  • $1.2M+ projected savings · sub-12-month break-even`,
      `  • 100% coverage · zero new infrastructure`,``,
      `YOUR PROJECTION (KCU-calibrated)`,`${'─'.repeat(52)}`,
      `Annual Value:          ${fmtK(r.total)}`,
      `  → Time Savings:      ${fmt(r.timeSave)} (${r.hrsSaved.toLocaleString()} person-hrs/yr)`,
      `  → Error Reduction:   ${fmt(r.errSave)} (${roi.errPct}% → 0.5%)`,
      `Process Time:          ${roi.hrs} hrs/person → ${r.aiMins} min/cycle`,
      `Person-Hours Saved:    ${r.hrsSaved.toLocaleString()}/yr (${roi.staff} staff freed)`,
      `Implementation (est.): ${fmt(r.impl)} — one-time, no infrastructure cost`,
      `ROI:                   ${r.roiPct}%`,`Break-even:            ${r.payback} months`,``,
      solution?.advantage ? `WHY D8:PLATFORM\n${solution.advantage}` : '',
      `${'─'.repeat(52)}`,`D8TAOPS · d8taops.com`
    ].filter(Boolean).join('\n');

    const deckText = deck?.slides
      ? deck.slides.map(s =>
          `SLIDE ${s.num}: ${s.title}\nHeadline: ${s.headline}\n`+
          (s.bullets||[]).map(b => `  • ${b}`).join('\n')+
          `\nSpeaker note: ${s.speakerNote}`
        ).join('\n\n───────────────────────────\n\n')
      : 'Click "Generate Deck" to build the slide outline.';

    const TABS = [
      { id:'email',   label:'✉ Email',         content:`Subject: ${materials.emailSubject}\n\n${materials.emailBody}` },
      { id:'talking', label:'💬 Talking Points', content:(materials.talkingPoints||[]).map((p,i) => `${i+1}. ${p}`).join('\n\n') },
      { id:'exec',    label:'📋 Exec Summary',  content:materials.execSummary },
      { id:'roi',     label:'📊 ROI Card',       content:roiCard },
      { id:'deck',    label:'🖥 Slide Deck',     content:deckText },
    ];
    const active = TABS.find(t => t.id===tab)||TABS[0];
    const lcdColors = { title:NAVY, problem:'#C41E3A', solution:BLUE, agents:'#0D5F8C', proof:'#167A45', roi:'#6B3FA0', why:'#B45A00', 'next-steps':'#374151' };

    return (
      <div>
        {/* Bridge line */}
        {materials.roiLine && (
          <div style={{ ...card(), background:'#FFF7ED', border:'1.5px solid #FED7AA' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#92400E', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>Your Sales Bridge Line</div>
            <div style={{ fontSize:14, fontStyle:'italic', color:NAVY, lineHeight:1.65 }}>"{materials.roiLine}"</div>
          </div>
        )}

        <div style={card()}>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', gap:5, flex:1, flexWrap:'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding:'7px 13px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:600,
                    background:tab===t.id?NAVY:'#F0F2F5', color:tab===t.id?'#fff':'#666' }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {tab==='deck' && !deck && (
                <button onClick={runDeck} disabled={deckBusy}
                  style={{ background:deckBusy?'#93C5FD':BLUE, color:'#fff', border:'none', borderRadius:6, padding:'7px 14px', fontSize:11, fontWeight:600, cursor:deckBusy?'not-allowed':'pointer', fontFamily:'inherit' }}>
                  {deckBusy ? '⏳ Building...' : 'Generate Deck'}
                </button>
              )}
              {(tab!=='deck'||deck) && (
                <button onClick={() => copyText(active.content, tab)}
                  style={{ background:copied===tab?'#2E7D32':BLUE, color:'#fff', border:'none', borderRadius:6, padding:'7px 14px', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {copied===tab ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {tab==='deck' && deck?.slides ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {deck.slides.map(s => {
                const color = lcdColors[s.layout]||NAVY;
                return (
                  <div key={s.num} style={{ borderLeft:`4px solid ${color}`, borderRadius:8, padding:'14px 18px', background:color+'06', border:`1px solid ${color}22` }}>
                    <div style={{ fontSize:9, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Slide {s.num} · {s.layout}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:NAVY }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'#555', marginTop:2, fontStyle:'italic', marginBottom:9 }}>{s.headline}</div>
                    <ul style={{ margin:'0 0 10px', paddingLeft:18 }}>
                      {(s.bullets||[]).map((b,bi) => <li key={bi} style={{ fontSize:12, color:'#333', lineHeight:1.6, marginBottom:2 }}>{b}</li>)}
                    </ul>
                    <div style={{ fontSize:11, color:'#888', borderTop:`1px solid ${BORDER}`, paddingTop:8, lineHeight:1.55 }}>
                      <strong style={{ color:'#555' }}>Speaker note:</strong> {s.speakerNote}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <pre style={{ fontFamily:'inherit', fontSize:12, lineHeight:1.85, whiteSpace:'pre-wrap', color:'#2D3748', margin:0, background:'#F8FAFC', padding:'16px 20px', borderRadius:8, border:`1px solid ${BORDER}`, maxHeight:460, overflowY:'auto' }}>
              {active.content}
            </pre>
          )}
        </div>

        <div style={{ ...card(), background:'#EFF6FF', border:`1.5px dashed ${BLUE}55` }}>
          <div style={{ fontWeight:600, fontSize:12, color:NAVY, marginBottom:6 }}>Full Platform → v1.0 Webapp Build</div>
          <div style={{ fontSize:11, color:'#555', lineHeight:1.85 }}>
            <strong>One-click PowerPoint export</strong> — D8-branded .pptx from this deck outline · <strong>Branded PDF one-pager</strong> — IBM Plex Sans, navy/blue, D8TAOPS logo ·
            <strong> Saved sessions</strong> — team sharing and session history · <strong>CRM push</strong> — Salesforce / HubSpot ·
            <strong> Live prospect research</strong> — LinkedIn + web on any company name entered · <strong>Custom ROI templates</strong> per industry vertical.
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button style={btnS()} onClick={() => setStep(3)}>← ROI Model</button>
          <button style={btnS({ borderColor:BLUE, color:BLUE })}
            onClick={() => { setStep(1); setResearch(null); setSolution(null); setMaterials(null); setDeck(null); setForm({ company:'', contact:'', industry:'', useCase:'' }); setCopied(''); }}>
            New Analysis
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'IBM Plex Sans', system-ui, sans-serif", background:BG, minHeight:'100vh' }}>
      <nav style={{ background:NAVY, padding:'0 24px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
        <div>
          <div style={{ color:BLUE, fontWeight:700, fontSize:16, letterSpacing:'0.06em' }}>D8TAOPS</div>
          <div style={{ color:'rgba(255,255,255,0.35)', fontSize:9, marginTop:1, letterSpacing:'0.04em' }}>SALES INTELLIGENCE PLATFORM</div>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {navBtn(1,'Target')}{navBtn(2,'Solution')}{navBtn(3,'ROI Model')}{navBtn(4,'Export')}
        </div>
      </nav>
      <div style={{ maxWidth:880, margin:'0 auto', padding:'24px 18px 60px' }}>
        {step===1 && renderTarget()}
        {step===2 && renderSolution()}
        {step===3 && renderROI()}
        {step===4 && renderExport()}
      </div>
    </div>
  );
}
