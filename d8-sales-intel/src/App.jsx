import { useState } from 'react';
import { BG } from './lib/constants';
import { calcROI, fmtK } from './lib/roi';
import { claudeJSON } from './lib/api';
import { SYS_RESEARCH, SYS_SOLUTION, SYS_EXPORT, SYS_DECK } from './lib/prompts';
import NavBar from './components/NavBar';
import StepTarget from './components/StepTarget';
import StepSolution from './components/StepSolution';
import StepROI from './components/StepROI';
import StepExport from './components/StepExport';

export default function App() {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState({ company: '', contact: '', industry: '', useCase: '' });
  const [research, setResearch]   = useState(null);
  const [solution, setSolution]   = useState(null);
  const [materials, setMaterials] = useState(null);
  const [deck, setDeck]           = useState(null);
  const [roi, setRoi]             = useState({ vol: 12, hrs: 24, staff: 3, rate: 55, errPct: 15, errCost: 850 });
  const [loading, setLoading]     = useState(false);
  const [loadMsg, setLoadMsg]     = useState('');
  const [deckBusy, setDeckBusy]   = useState(false);
  const [roiTouched, setRoiTouched] = useState(false);

  const runAnalysis = async () => {
    if (!form.industry || !form.useCase) return;
    setLoading(true);
    try {
      setLoadMsg('Researching industry benchmarks...');
      const r = await claudeJSON(SYS_RESEARCH,
        `Company: ${form.company || 'Not specified'}\nContact: ${form.contact || 'Not specified'}\nIndustry: ${form.industry}\nGoal: "${form.useCase}"`);
      setResearch(r);
      setLoadMsg('Designing D8:PLATFORM configuration...');
      const s = await claudeJSON(SYS_SOLUTION,
        `Prospect: ${JSON.stringify(r)}\nGoal: "${form.useCase}"`);
      setSolution(s);
      setStep(2);
    } catch (e) { alert('Analysis failed: ' + e.message); }
    setLoading(false);
  };

  const runExport = async () => {
    if (materials) { setStep(4); return; }
    const r = calcROI(roi);
    setLoading(true); setLoadMsg('Writing sales materials...');
    try {
      const roiConfidence = roiTouched ? 'USER-CONFIRMED' : 'ILLUSTRATIVE-DEFAULTS';
      const m = await claudeJSON(SYS_EXPORT,
        `Prospect: ${form.company || form.industry + ' prospect'}\nIndustry: ${form.industry}\nContact: ${form.contact || 'Stakeholder'}\nGoal: ${form.useCase}\nSolution: ${JSON.stringify({ headline: solution?.headline, agents: solution?.agents?.map(a => a.id), workflow: solution?.workflow })}\nROI CONFIDENCE: ${roiConfidence}\nROI: ${fmtK(r.total)} annual value · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr · ${roi.hrs * roi.staff} hrs/cycle → ${r.aiMins} min\nKCU (Kitsap Credit Union): $1.2M+ savings, 97% faster, 99.5% accuracy, sub-12-month break-even. Frame as "a heavily regulated financial institution" unless prospect is in financial services. Bridge on shared complexity (compliance, accuracy mandates, audit requirements), not the vertical.\n${roiConfidence === 'ILLUSTRATIVE-DEFAULTS' ? 'IMPORTANT: ROI inputs are illustrative defaults — the user did NOT provide real numbers. Do NOT cite specific dollar amounts in the email. Instead use relative metrics: "97% reduction in processing time", "99.5% data accuracy vs. industry average of 80-82%", "sub-12-month break-even." Invite the prospect to share their numbers for a custom projection.' : 'ROI inputs have been confirmed by the sales leader. You may cite specific dollar projections.'}`,
        { maxTokens: 2048 });
      setMaterials(m); setStep(4);
    } catch (e) { alert('Export failed: ' + e.message); }
    setLoading(false);
  };

  const runDeck = async () => {
    if (deck) return;
    const r = calcROI(roi);
    const roiConfidence = roiTouched ? 'USER-CONFIRMED' : 'ILLUSTRATIVE-DEFAULTS';
    setDeckBusy(true);
    try {
      const d = await claudeJSON(SYS_DECK,
        `Prospect: ${form.company || form.industry + ' prospect'}\nIndustry: ${form.industry}\nGoal: ${form.useCase}\nSolution headline: ${solution?.headline}\nAgents: ${solution?.agents?.map(a => a.id + ' — ' + a.role).join('; ')}\nWorkflow: ${solution?.workflow}\nROI CONFIDENCE: ${roiConfidence}\nROI: ${fmtK(r.total)} · ${r.roiPct}% ROI · ${r.payback}-month payback · ${r.hrsSaved.toLocaleString()} person-hrs/yr saved\n${roiConfidence === 'ILLUSTRATIVE-DEFAULTS' ? 'IMPORTANT: ROI figures are illustrative defaults. Use relative metrics (97% faster, 99.5% accuracy, sub-12-month break-even) instead of specific dollar amounts on slides.' : 'ROI figures are confirmed by the sales leader. You may cite specific dollar projections on slides.'}`,
        { maxTokens: 4096 });
      setDeck(d);
    } catch (e) { alert('Deck failed: ' + e.message); }
    setDeckBusy(false);
  };

  const handleRoiChange = (updater) => {
    setRoi(updater);
    setMaterials(null);
    setDeck(null);
  };

  const handleReset = () => {
    setStep(1); setResearch(null); setSolution(null);
    setMaterials(null); setDeck(null); setRoiTouched(false);
    setForm({ company: '', contact: '', industry: '', useCase: '' });
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: BG, minHeight: '100vh' }}>
      <NavBar step={step} setStep={setStep} />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 18px 60px' }}>
        {step === 1 && <StepTarget form={form} setForm={setForm} loading={loading} loadMsg={loadMsg} onAnalyze={runAnalysis} />}
        {step === 2 && <StepSolution form={form} research={research} solution={solution} setStep={setStep} />}
        {step === 3 && <StepROI roi={roi} setRoi={handleRoiChange} roiTouched={roiTouched} setRoiTouched={setRoiTouched} loading={loading} loadMsg={loadMsg} setStep={setStep} onExport={runExport} />}
        {step === 4 && <StepExport form={form} solution={solution} materials={materials} roi={roi} roiTouched={roiTouched} deck={deck} deckBusy={deckBusy} onDeck={runDeck} setStep={setStep} onReset={handleReset} />}
      </div>
    </div>
  );
}
