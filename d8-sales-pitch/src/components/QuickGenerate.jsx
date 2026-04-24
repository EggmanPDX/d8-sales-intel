import { useState, useRef, useEffect } from 'react';
import { NAVY, BLUE, WHITE, BORDER, BG } from '../lib/constants';
import { callClaudeText } from '../lib/api';
import { SYS_QUICKGEN_CLARIFY, SYS_QUICKGEN_GENERATE } from '../lib/prompts';

const card = (x = {}) => ({ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`, ...x });

export default function QuickGenerate() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);     // { role, content, phase }
  const [phase, setPhase] = useState('input');       // input | clarify | generating | done
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [reply, setReply] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setPrompt('');

    if (phase === 'input') {
      // First message — send to clarify prompt
      setMessages([{ role: 'user', content: userMsg, phase: 'request' }]);
      setLoading(true);
      setLoadMsg('Thinking about what you need...');
      try {
        const clarification = await callClaudeText(SYS_QUICKGEN_CLARIFY, [
          { role: 'user', content: userMsg }
        ]);
        setMessages(prev => [...prev, { role: 'assistant', content: clarification, phase: 'clarify' }]);
        setPhase('clarify');
      } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Something went wrong: ${e.message}. Try again.`, phase: 'error' }]);
      }
      setLoading(false);

    } else if (phase === 'clarify') {
      // User answered clarifying questions — generate the content
      const updatedMessages = [...messages, { role: 'user', content: userMsg, phase: 'answer' }];
      setMessages(updatedMessages);
      setLoading(true);
      setLoadMsg('Generating your content...');
      setPhase('generating');
      try {
        // Build the conversation for the generate call
        const convo = updatedMessages
          .filter(m => m.phase !== 'error')
          .map(m => ({ role: m.role, content: m.content }));
        const result = await callClaudeText(SYS_QUICKGEN_GENERATE, convo, 3000);
        setOutput(result);
        setMessages(prev => [...prev, { role: 'assistant', content: result, phase: 'output' }]);
        setPhase('done');
      } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Generation failed: ${e.message}. Try again.`, phase: 'error' }]);
        setPhase('clarify');
      }
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!reply.trim()) return;
    const userMsg = reply.trim();
    setReply('');
    const updatedMessages = [...messages, { role: 'user', content: userMsg, phase: 'refine' }];
    setMessages(updatedMessages);
    setLoading(true);
    setLoadMsg('Refining...');
    setPhase('generating');
    try {
      const convo = updatedMessages
        .filter(m => m.phase !== 'error')
        .map(m => ({ role: m.role, content: m.content }));
      const result = await callClaudeText(SYS_QUICKGEN_GENERATE, convo, 3000);
      setOutput(result);
      setMessages(prev => [...prev, { role: 'assistant', content: result, phase: 'output' }]);
      setPhase('done');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Refinement failed: ${e.message}`, phase: 'error' }]);
      setPhase('done');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setPrompt('');
    setMessages([]);
    setPhase('input');
    setOutput('');
    setReply('');
    setCopied(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleKeyDown = (e, fn) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fn(); }
  };

  const inputStyle = {
    width: '100%', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.7,
    padding: '14px 18px', borderRadius: 10, border: `1.5px solid ${BORDER}`,
    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const btnPrimary = (x = {}) => ({
    background: BLUE, color: '#fff', border: 'none', borderRadius: 8,
    padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', ...x
  });

  const btnSecondary = (x = {}) => ({
    background: 'transparent', color: NAVY, border: `1.5px solid ${NAVY}`,
    borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', ...x
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>Quick Generate</h2>
        <p style={{ fontSize: 13, color: '#666', marginTop: 6, lineHeight: 1.6 }}>
          Tell us what you need — a script, soundbite, talking points, one-pager, elevator pitch, or anything else.
          We'll ask a question or two, then generate brand-aligned content grounded in D8TAOPS proof points.
        </p>
      </div>

      {/* Conversation thread */}
      {messages.length > 0 && (
        <div ref={scrollRef} style={{ ...card(), maxHeight: 400, overflowY: 'auto', padding: '16px 20px' }}>
          {messages.filter(m => m.phase !== 'output').map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: m.role === 'user' ? BLUE : '#666', marginBottom: 5
              }}>
                {m.role === 'user' ? 'You' : 'D8TAOPS'}
              </div>
              <div style={{
                fontSize: 13, lineHeight: 1.75, color: '#2D3748',
                background: m.role === 'user' ? '#F0F7FF' : '#F8FAFC',
                padding: '10px 14px', borderRadius: 8,
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic', padding: '6px 0' }}>
              {loadMsg}
            </div>
          )}
        </div>
      )}

      {/* Input area — initial prompt or clarification answer */}
      {(phase === 'input' || phase === 'clarify') && (
        <div style={card()}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => handleKeyDown(e, handleSubmit)}
            placeholder={phase === 'input'
              ? 'What do you need? e.g., "Write a 60-second script about our platform for a healthcare CIO"'
              : 'Answer the question above...'
            }
            rows={phase === 'input' ? 4 : 2}
            style={inputStyle}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
            {phase === 'clarify' && (
              <span style={{ fontSize: 11, color: '#999', marginRight: 'auto' }}>
                Press Enter to send
              </span>
            )}
            <button onClick={handleSubmit} disabled={loading || !prompt.trim()} style={btnPrimary({ opacity: loading || !prompt.trim() ? 0.5 : 1 })}>
              {loading ? 'Working...' : phase === 'input' ? 'Go' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      {/* Loading state during generation */}
      {phase === 'generating' && (
        <div style={{ ...card(), textAlign: 'center', padding: '30px 24px' }}>
          <div style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{loadMsg}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>This usually takes 10-15 seconds</div>
        </div>
      )}

      {/* Output */}
      {phase === 'done' && output && (
        <div>
          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Your Content
              </div>
              <button onClick={copyOutput} style={btnPrimary({ padding: '7px 14px', fontSize: 11, background: copied ? '#2E7D32' : BLUE })}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'inherit', fontSize: 13, lineHeight: 1.85, whiteSpace: 'pre-wrap',
              color: '#2D3748', margin: 0, background: '#F8FAFC', padding: '16px 20px',
              borderRadius: 8, border: `1px solid ${BORDER}`, maxHeight: 500, overflowY: 'auto'
            }}>
              {output}
            </pre>
          </div>

          {/* Refine or start over */}
          <div style={card()}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleRefine)}
              placeholder='Want changes? e.g., "Make it shorter" or "Add more about D8:SEC"'
              rows={2}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={handleReset} style={btnSecondary()}>Start Over</button>
              <button onClick={handleRefine} disabled={!reply.trim()} style={btnPrimary({ opacity: !reply.trim() ? 0.5 : 1 })}>
                Refine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {phase === 'input' && messages.length === 0 && (
        <div style={{ ...card(), background: '#F0F7FF', border: `1.5px solid #BFDBFE` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 8, letterSpacing: '0.06em' }}>IDEAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              '"Write a 60-second script about D8TAOPS for a healthcare conference"',
              '"Give me a 2-sentence soundbite about our data orchestration platform for a CIO"',
              '"Create an elevator pitch for a manufacturing VP worried about data quality"',
              '"Draft talking points for a partner intro meeting with a Snowflake rep"',
              '"Write a one-pager for a logistics company drowning in manual data reconciliation"',
            ].map((ex, i) => (
              <button key={i} onClick={() => setPrompt(ex.replace(/^"|"$/g, ''))}
                style={{
                  textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, color: BLUE, padding: '4px 0', lineHeight: 1.5
                }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
