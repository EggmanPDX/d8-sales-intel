import { NAVY, BLUE, WHITE, BORDER, AGENTS } from '../lib/constants';

const card = (x = {}) => ({ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`, ...x });
const h2   = { color: NAVY, fontSize: 14, fontWeight: 600, margin: '0 0 12px' };
const lbl  = { display: 'block', fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' };
const inp  = { width: '100%', padding: '9px 13px', border: `1.5px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box' };
const ovl  = { fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 };

export default function StepTarget({ form, setForm, loading, loadMsg, onAnalyze }) {
  const btnP = (dis) => ({ background: dis ? '#93C5FD' : BLUE, color: '#fff', border: 'none', borderRadius: 7, padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', fontFamily: 'inherit' });

  return (
    <div>
      <div style={card()}>
        <div style={ovl}>D8:PLATFORM · Sales Intelligence</div>
        <h1 style={{ color: NAVY, fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Build Your Sales Story</h1>
        <p style={{ color: '#666', fontSize: 13, lineHeight: 1.65, margin: '0 0 22px' }}>
          Enter an industry and use case. The tool generates a tailored D8:PLATFORM solution, KCU-calibrated ROI model, and ready-to-use sales materials — including a slide deck outline for PowerPoint.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Company <span style={{ fontWeight: 400, textTransform: 'none', color: '#aaa' }}>(optional)</span></label>
            <input style={inp} placeholder="e.g. Pacific Community Bank" value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Contact <span style={{ fontWeight: 400, textTransform: 'none', color: '#aaa' }}>(optional)</span></label>
            <input style={inp} placeholder="e.g. Sarah Mitchell, VP Operations" value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Industry / Business Type <span style={{ color: '#C41E3A' }}>*</span></label>
          <input style={inp} placeholder="Community Banking · Healthcare · Manufacturing · Logistics · Insurance..."
            value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={lbl}>We're trying to... <span style={{ color: '#C41E3A' }}>*</span></label>
          <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }}
            placeholder='e.g. "We&#39;re trying to automate monthly compliance reporting — our team spends 3 days pulling data from 4 different systems."'
            value={form.useCase} onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={btnP(!form.industry || !form.useCase || loading)} disabled={!form.industry || !form.useCase || loading} onClick={onAnalyze}>
            {loading ? `⏳  ${loadMsg}` : 'Research & Analyze →'}
          </button>
          {loading && <span style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>~20 seconds...</span>}
        </div>
      </div>
      <div style={card()}>
        <h2 style={h2}>D8:PLATFORM — 8 Agents, Any Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
          {AGENTS.map(a => (
            <div key={a.id} style={{ padding: '11px 13px', borderRadius: 8, border: `1.5px solid ${a.color}28`, background: a.color + '09' }}>
              <div style={{ fontWeight: 700, color: a.color, fontSize: 11, marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: 10, color: '#777', lineHeight: 1.45 }}>{a.short}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
