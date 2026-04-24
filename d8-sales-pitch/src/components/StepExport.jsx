import { useState } from 'react';
import { NAVY, BLUE, WHITE, BORDER } from '../lib/constants';
import { calcROI, fmt, fmtK } from '../lib/roi';

const card = (x = {}) => ({ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`, ...x });

export default function StepExport({ form, solution, materials, roi, roiTouched, setStep, onReset }) {
  const [tab, setTab]       = useState('email');
  const [copied, setCopied] = useState('');

  if (!materials) return null;
  const r = calcROI(roi);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  const btnS = (x = {}) => ({ background: 'transparent', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 7, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', ...x });

  const roiCard = [
    `D8:PLATFORM ROI SUMMARY`, `${'─'.repeat(52)}`,
    `Prospect:         ${form.company || form.industry + ' prospect'}`,
    form.contact ? `Contact:          ${form.contact}` : '',
    `Goal:             ${form.useCase}`, ``,
    `PROOF POINT (sales anchor)`, `${'─'.repeat(52)}`,
    `At a heavily regulated financial institution, D8:PLATFORM delivered:`,
    `  • 97% faster processing (30 min → under 1 min/file)`,
    `  • 99.5% data accuracy (vs. 80–82% industry avg)`,
    `  • $1.2M+ projected savings · sub-12-month break-even`,
    `  • 100% coverage · zero new infrastructure`, ``,
    `YOUR PROJECTION (KCU-calibrated)`, `${'─'.repeat(52)}`,
    `Annual Value:          ${fmtK(r.total)}`,
    `  → Time Savings:      ${fmt(r.timeSave)} (${r.hrsSaved.toLocaleString()} person-hrs/yr)`,
    `  → Error Reduction:   ${fmt(r.errSave)} (${roi.errPct}% → 0.5%)`,
    `Process Time:          ${roi.hrs} hrs/person → ${r.aiMins} min/cycle`,
    `Person-Hours Saved:    ${r.hrsSaved.toLocaleString()}/yr (${roi.staff} staff freed)`,
    `Implementation (est.): ${fmt(r.impl)} — one-time, no infrastructure cost`,
    `ROI:                   ${r.roiPct}%`, `Break-even:            ${r.payback} months`, ``,
    solution?.advantage ? `WHY D8:PLATFORM\n${solution.advantage}` : '',
    `${'─'.repeat(52)}`, `D8TAOPS · d8taops.com`
  ].filter(Boolean).join('\n');

  const TABS = [
    { id: 'email',   label: '✉ Email',          content: `Subject: ${materials.emailSubject}\n\n${materials.emailBody}` },
    { id: 'talking', label: '💬 Talking Points', content: (materials.talkingPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n\n') },
    { id: 'exec',    label: '📋 Exec Summary',   content: materials.execSummary },
    { id: 'roi',     label: '📊 ROI Card',        content: roiCard },
  ];
  const active = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div>
      {materials.roiLine && (
        <div style={{ ...card(), background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Your Sales Bridge Line</div>
          <div style={{ fontSize: 14, fontStyle: 'italic', color: NAVY, lineHeight: 1.65 }}>"{materials.roiLine}"</div>
        </div>
      )}

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

      <div style={card()}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding: '7px 13px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                  background: tab === t.id ? NAVY : '#F0F2F5', color: tab === t.id ? '#fff' : '#666'
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => copyText(active.content, tab)}
            style={{ background: copied === tab ? '#2E7D32' : BLUE, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied === tab ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <pre style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.85, whiteSpace: 'pre-wrap', color: '#2D3748', margin: 0, background: '#F8FAFC', padding: '16px 20px', borderRadius: 8, border: `1px solid ${BORDER}`, maxHeight: 460, overflowY: 'auto' }}>
          {active.content}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={btnS()} onClick={() => setStep(3)}>← ROI Model</button>
        <button style={btnS({ borderColor: BLUE, color: BLUE })} onClick={onReset}>
          New Analysis
        </button>
      </div>
    </div>
  );
}
