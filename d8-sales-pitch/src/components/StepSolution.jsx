import { NAVY, BLUE, WHITE, BORDER, AGENTS } from '../lib/constants';

const card  = (x = {}) => ({ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`, ...x });
const h2    = { color: NAVY, fontSize: 14, fontWeight: 600, margin: '0 0 12px' };
const badge = (color) => ({ display: 'inline-block', background: color + '1A', color, padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' });
const ovl   = { fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 };

export default function StepSolution({ form, research, solution, setStep }) {
  if (!research || !solution) return null;

  const btnP = (dis) => ({ background: dis ? '#93C5FD' : BLUE, color: '#fff', border: 'none', borderRadius: 7, padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', fontFamily: 'inherit' });
  const btnS = (x = {}) => ({ background: 'transparent', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 7, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', ...x });

  return (
    <div>
      <div style={{ background: NAVY, borderRadius: 12, padding: '22px 28px', marginBottom: 14 }}>
        <div style={{ ...ovl, color: '#7FC5F0' }}>{research.companyProfile?.name || form.industry.toUpperCase()} · D8:PLATFORM SOLUTION</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 8 }}>{solution.headline}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{solution.sub}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card({ marginBottom: 0 })}>
          <h2 style={h2}>Company Profile</h2>
          <p style={{ color: '#555', fontSize: 12, lineHeight: 1.65, marginBottom: 12 }}>{research.companyProfile?.overview}</p>
          <div style={{ fontSize: 10, fontWeight: 600, color: NAVY, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Likely Data Systems</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {(research.companyProfile?.dataSystems || []).map((d, i) => <span key={i} style={badge(BLUE)}>{d}</span>)}
          </div>
        </div>
        <div style={card({ marginBottom: 0 })}>
          <h2 style={h2}>Industry Benchmarks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ padding: '8px 11px', background: '#FEF3C7', borderRadius: 7, fontSize: 11, color: '#92400E' }}><strong>Process time:</strong> {research.benchmarks?.processTime}</div>
            <div style={{ padding: '8px 11px', background: '#FEE2E2', borderRadius: 7, fontSize: 11, color: '#991B1B' }}><strong>Error rate:</strong> {research.benchmarks?.errorRate}</div>
            <div style={{ padding: '8px 11px', background: '#F3F4F6', borderRadius: 7, fontSize: 11, color: '#374151' }}><strong>Capacity:</strong> {research.benchmarks?.staffChallenge}</div>
          </div>
        </div>
      </div>

      <div style={card()}>
        <h2 style={h2}>Identified Pain Points</h2>
        {(research.painPoints || []).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '11px 14px', background: '#F8FAFC', borderRadius: 8, borderLeft: `3px solid ${BLUE}`, marginBottom: 7 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: NAVY, marginBottom: 2 }}>{p.process}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{p.problem}</div>
            </div>
            <div style={{ fontSize: 11, color: '#C41E3A', fontWeight: 600, maxWidth: 200, flexShrink: 0, background: '#FEF2F2', padding: '4px 10px', borderRadius: 6, lineHeight: 1.4 }}>{p.impact}</div>
          </div>
        ))}
      </div>

      <div style={card()}>
        <h2 style={h2}>Recommended D8:PLATFORM Configuration</h2>
        <p style={{ color: '#555', fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>{solution.workflow}</p>
        {(solution.agents || []).map((a, i) => {
          const id   = (a.id || '').toUpperCase().replace('D8:', '');
          const meta = AGENTS.find(ag => ag.id === id) || AGENTS[0];
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 14, alignItems: 'center', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${meta.color}22`, background: meta.color + '08', marginBottom: 7 }}>
              <div>
                <div style={{ fontWeight: 700, color: meta.color, fontSize: 11, letterSpacing: '0.03em' }}>{meta.label}</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 2, lineHeight: 1.3 }}>{meta.short.split(' — ')[0]}</div>
              </div>
              <div style={{ fontSize: 12, color: '#333', lineHeight: 1.5 }}>{a.role}</div>
              <span style={badge('#167A45')}>{a.benefit}</span>
            </div>
          );
        })}
        {solution.advantage && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#F0F9FF', borderRadius: 7, fontSize: 12, color: '#1D4ED8', borderLeft: `3px solid ${BLUE}` }}>
            <strong>Key advantage:</strong> {solution.advantage}
          </div>
        )}
      </div>

      {(solution.outcomes || []).length > 0 && (
        <div style={card()}>
          <h2 style={h2}>Expected Outcomes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(solution.outcomes.length, 3)},1fr)`, gap: 10 }}>
            {solution.outcomes.map((o, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 8, background: '#F0F9FF', border: `1px solid ${BLUE}18` }}>
                <div style={{ fontWeight: 600, fontSize: 11, color: NAVY, marginBottom: 9 }}>{o.metric}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#bbb', textDecoration: 'line-through', fontSize: 12 }}>{o.before}</span>
                  <span style={{ color: '#ccc', fontSize: 10 }}>→</span>
                  <span style={{ color: '#167A45', fontWeight: 700, fontSize: 13 }}>{o.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={btnS()} onClick={() => setStep(1)}>← Edit Inputs</button>
        <button style={btnP(false)} onClick={() => setStep(3)}>Build ROI Model →</button>
      </div>
    </div>
  );
}
