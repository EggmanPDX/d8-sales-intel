import { NAVY, BLUE, WHITE, BORDER } from '../lib/constants';
import { calcROI, fmt, fmtK } from '../lib/roi';

const card = (x = {}) => ({ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`, ...x });
const h2   = { color: NAVY, fontSize: 14, fontWeight: 600, margin: '0 0 12px' };
const ovl  = { fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 };

export default function StepROI({ roi, setRoi, loading, loadMsg, setStep, onExport }) {
  const r = calcROI(roi);

  const btnP = (dis) => ({ background: dis ? '#93C5FD' : BLUE, color: '#fff', border: 'none', borderRadius: 7, padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', fontFamily: 'inherit' });
  const btnS = (x = {}) => ({ background: 'transparent', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 7, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', ...x });

  const sldr = (label, field, min, max, step, disp) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{disp(roi[field])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={roi[field]}
        style={{ width: '100%', accentColor: BLUE, cursor: 'pointer' }}
        onChange={e => setRoi(p => ({ ...p, [field]: Number(e.target.value) }))} />
    </div>
  );

  return (
    <div>
      <div style={{ background: NAVY, borderRadius: 12, padding: '20px 26px', marginBottom: 14 }}>
        <div style={{ ...ovl, color: '#7FC5F0', marginBottom: 12 }}>KCU-CALIBRATED ROI PROJECTION</div>
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

      {/* KCU → You bridge */}
      <div style={{ ...card(), background: '#ECFDF5', border: '1.5px solid #6EE7B7' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#065F46', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>We Saved KCU → We Can Save You</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 14, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>What we achieved at KCU</div>
            {[['97% faster processing', '30 min → under 1 min per file'], ['99.5% data accuracy', 'vs. 80–82% industry avg'], ['$1.2M+ projected savings', 'sub-12-month break-even'], ['100% coverage', 'every record, every night']].map(([k, v], i) => (
              <div key={i} style={{ fontSize: 11, color: '#065F46', marginBottom: 4 }}><strong>{k}</strong> <span style={{ color: '#555' }}>— {v}</span></div>
            ))}
          </div>
          <div style={{ fontSize: 24, color: '#34D399', fontWeight: 700, textAlign: 'center' }}>→</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>What we project for you</div>
            {[
              [fmtK(r.total) + '/yr estimated value', 'based on your inputs'],
              [roi.hrs + ' hrs → ' + r.aiMins + ' min per cycle', '97% reduction applied'],
              [r.hrsSaved.toLocaleString() + ' person-hours saved/yr', roi.staff + ' staff reclaimed for strategic work'],
              [r.payback + '-month break-even', 'similar to KCU profile'],
            ].map(([k, v], i) => (
              <div key={i} style={{ fontSize: 11, color: '#1E3A5F', marginBottom: 4 }}><strong>{k}</strong> <span style={{ color: '#555' }}>— {v}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card({ marginBottom: 0 })}>
          <h2 style={h2}>Adjust Model Inputs</h2>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 14, fontStyle: 'italic', lineHeight: 1.5 }}>
            Hours per cycle = per person. Staff = headcount. Total person-hours = hrs × staff × annual cycles.
          </div>
          {sldr('Monthly Volume (cycles)', 'vol', 1, 200, 1, v => v + ' / mo')}
          {sldr('Hours Per Cycle (per person)', 'hrs', 0.5, 48, 0.5, v => v + ' hrs')}
          {sldr('Staff on This Process', 'staff', 1, 30, 1, v => v + ' people')}
          {sldr('Avg Hourly Rate (burdened)', 'rate', 25, 175, 5, v => '$' + v + '/hr')}
          {sldr('Current Error / Rework Rate', 'errPct', 1, 40, 1, v => v + '%')}
          {sldr('Avg Cost Per Error', 'errCost', 100, 5000, 100, v => '$' + v.toLocaleString())}
          <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 7, fontSize: 11, color: '#555', marginTop: 4 }}>
            <strong>Total person-hours/cycle:</strong> {(roi.hrs * roi.staff).toFixed(1)} hrs · <strong>Annual:</strong> {Math.round(roi.hrs * roi.staff * roi.vol * 12).toLocaleString()} hrs
          </div>
        </div>
        <div>
          <div style={card({ marginBottom: 10 })}>
            <h2 style={h2}>Value Breakdown</h2>
            {[
              { lbl: 'Time Savings', val: fmt(r.timeSave), sub: `${r.hrsSaved.toLocaleString()} person-hrs/yr reclaimed`, color: BLUE },
              { lbl: 'Error Reduction', val: fmt(r.errSave), sub: `${roi.errPct}% → 0.5% error rate`, color: '#167A45' },
              { lbl: 'Total Annual Value', val: fmtK(r.total), sub: 'Combined annual impact', color: NAVY, bold: true },
              { lbl: 'Implementation (est.)', val: fmt(r.impl), sub: 'One-time · zero infrastructure cost', color: '#bbb' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: item.bold ? 700 : 500, color: item.bold ? NAVY : '#444' }}>{item.lbl}</div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{item.sub}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card({ marginBottom: 0 }), background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2E7D32', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Model Calibration</div>
            <div style={{ fontSize: 11, color: '#1A4D2E', lineHeight: 1.7 }}>
              Projections scaled from KCU results: <strong>97% time reduction</strong> applied to your hours · <strong>99.5% accuracy</strong> applied to your error rate. Implementation range: $65K–$280K based on volume.
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button style={btnS()} onClick={() => setStep(2)}>← Solution</button>
        <button style={btnP(loading)} disabled={loading} onClick={onExport}>
          {loading ? `⏳  ${loadMsg}` : 'Generate Sales Materials →'}
        </button>
      </div>
    </div>
  );
}
