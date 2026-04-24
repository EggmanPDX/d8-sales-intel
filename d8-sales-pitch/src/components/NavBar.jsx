import { NAVY, BLUE } from '../lib/constants';

export default function NavBar({ mode, setMode, step, setStep }) {
  const modeBtn = (id, label) => {
    const active = mode === id;
    return (
      <button onClick={() => setMode(id)}
        style={{
          padding: '6px 14px', borderRadius: 6, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, fontWeight: 600,
          background: active ? '#fff' : 'rgba(255,255,255,0.08)',
          color: active ? NAVY : 'rgba(255,255,255,0.5)',
          transition: 'all 0.15s'
        }}>
        {label}
      </button>
    );
  };

  const navBtn = (n, label) => {
    const active = step === n, done = step > n, ok = done || active;
    return (
      <button key={n} onClick={() => ok && setStep(n)}
        style={{
          padding: '5px 13px', borderRadius: 20, border: 'none',
          cursor: ok ? 'pointer' : 'default', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
          background: active ? BLUE : done ? 'rgba(4,119,191,0.3)' : 'rgba(255,255,255,0.1)',
          color: active ? '#fff' : done ? '#90CAF9' : 'rgba(255,255,255,0.3)'
        }}>
        {done ? '✓' : n}. {label}
      </button>
    );
  };

  return (
    <nav style={{
      background: NAVY, padding: '0 24px', height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div>
          <div style={{ color: BLUE, fontWeight: 700, fontSize: 16, letterSpacing: '0.06em' }}>D8TAOPS</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 1, letterSpacing: '0.04em' }}>SALES INTELLIGENCE PLATFORM</div>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {modeBtn('intel', 'Sales Intel')}
          {modeBtn('quick', 'Quick Generate')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        {mode === 'intel' && <>
          {navBtn(1, 'Target')}{navBtn(2, 'Solution')}{navBtn(3, 'ROI Model')}{navBtn(4, 'Export')}
        </>}
      </div>
    </nav>
  );
}
