export const NAVY   = '#1B3A5C';
export const BLUE   = '#0477BF';
export const BG     = '#EFF2F6';
export const WHITE  = '#FFFFFF';
export const BORDER = '#DDE2EA';

export const AGENTS = [
  { id:'INGEST',  label:'D8:INGEST',  color:'#0477BF', short:'Connects to all data sources — zero new infrastructure' },
  { id:'CAT',     label:'D8:CAT',     color:'#0D5F8C', short:'Discovers and catalogs data with full lineage tracking' },
  { id:'CURATE',  label:'D8:CURATE',  color:'#167A45', short:'Validates and cleans data — only quality data passes through' },
  { id:'FLOW',    label:'D8:FLOW',    color:'#6B3FA0', short:'Orchestrates workflows — the pipeline traffic cop' },
  { id:'SEC',     label:'D8:SEC',     color:'#B45A00', short:'Enforces security at every data touchpoint' },
  { id:'OBSERVE', label:'D8:OBSERVE', color:'#C41E3A', short:'Real-time anomaly monitoring and incident prevention' },
  { id:'STAGE',   label:'D8:STAGE',   color:'#2E7D32', short:'Delivers production-ready validated data products' },
  { id:'VIEW',    label:'D8:VIEW',    color:'#1B3A5C', short:'Human-facing dashboard for operators and decision-makers' },
];

export const PLATFORM = `
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

KCU PROOF POINT — "KCU" means Kitsap Credit Union (a community credit union in Washington state). NEVER expand KCU as "Kansas City University" or anything else.
Kitsap Credit Union (financial services):
D8TAOPS automated KCU's manual loan audit process across existing systems — no new infrastructure.
• 97% faster: 30+ min per file → under 1 minute
• 99.5% data accuracy (industry avg: ~80–82%)
• 100% coverage: every loan, every night (vs. manual sampling)
• $1.2M+ projected savings · sub-12-month break-even
• Zero new infrastructure · audit staff freed for strategic work

USE THIS AS YOUR SALES BRIDGE: "We helped a heavily regulated financial institution achieve [X]. The overlap isn't the industry — it's the complexity of [shared pain]. Based on what you've described, we project [Y] for you."
When the prospect is in financial services, you may name Kitsap Credit Union directly. For all other industries, frame as "a financial institution under strict regulatory requirements" and bridge on shared complexity.
`;
