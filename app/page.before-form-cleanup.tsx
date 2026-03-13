'use client';

import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    city: '',
    service_type: 'water heater',
    urgency: 'normal',
    property_type: 'residential',
    source: 'Google',
    quote_amount: '',
    problem_duration: '',
    customer_notes: '',
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data.result || data.message || 'Done');
    } catch (error) {
      setResult('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f6f8',
        padding: '24px 14px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #111827, #1f2937)',
            color: '#fff',
            padding: '28px 24px',
          }}
        >
          <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '8px' }}>
            Licensed • Professional • Fast Response
          </div>
          <h1 style={{ margin: 0, fontSize: '30px', lineHeight: 1.2 }}>
            KCW Construction & Plumbing Inc.
          </h1>
          <p style={{ marginTop: '10px', marginBottom: 0, fontSize: '16px', opacity: 0.92 }}>
            Service Request / 客户服务申请表
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gap: '12px',
              marginBottom: '22px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '18px',
            }}
          >
            <div><strong>License:</strong> #1129463</div>
            <div><strong>Phone:</strong> 626-503-7777</div>
            <div><strong>Email:</strong> kcwpro7777@gmail.com</div>
            <div><strong>Website:</strong> www.kcwpro.com</div>
          </div>

          <div
            style={{
              marginBottom: '22px',
              background: '#eef6ff',
              border: '1px solid #d9e9ff',
              borderRadius: '14px',
              padding: '18px',
              color: '#1f2937',
              lineHeight: 1.7,
            }}
          >
            <strong>Supported Services / 服务范围</strong>
            <div style={{ marginTop: '8px' }}>
              • Water Heater / 热水器<br />
              • Drain Cleaning / 下水疏通<br />
              • Main Water Line / 主水管<br />
              • Gas Line / 煤气管<br />
              • General Plumbing / 综合水管维修
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <input
              placeholder="Customer Name / 客户姓名"
              value={form.customer_name}
              onChange={(e) => updateField('customer_name', e.target.value)}
              required
              style={inputStyle}
            />

            <input
              placeholder="Phone Number / 电话"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
              style={inputStyle}
            />

            <input
              placeholder="City / 城市"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              required
              style={inputStyle}
            />

            <select
              value={form.service_type}
              onChange={(e) => updateField('service_type', e.target.value)}
              style={inputStyle}
            >
              <option>water heater</option>
              <option>drain</option>
              <option>main water line</option>
              <option>gas line</option>
              <option>other</option>
            </select>

            <select
              value={form.urgency}
              onChange={(e) => updateField('urgency', e.target.value)}
              style={inputStyle}
            >
              <option>urgent</option>
              <option>normal</option>
              <option>low</option>
            </select>

            <select
              value={form.property_type}
              onChange={(e) => updateField('property_type', e.target.value)}
              style={inputStyle}
            >
              <option>residential</option>
              <option>commercial</option>
            </select>

            <select
              value={form.source}
              onChange={(e) => updateField('source', e.target.value)}
              style={inputStyle}
            >
              <option>Google</option>
              <option>Yelp</option>
              <option>WeChat</option>
              <option>Referral</option>
              <option>TikTok</option>
              <option>Website</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Quote Amount / 报价金额 (optional)"
              value={form.quote_amount}
              onChange={(e) => updateField('quote_amount', e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Problem Duration / 问题持续时间"
              value={form.problem_duration}
              onChange={(e) => updateField('problem_duration', e.target.value)}
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Describe the problem / 请描述问题"
              value={form.customer_notes}
              onChange={(e) => updateField('customer_notes', e.target.value)}
              rows={5}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 18px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Generating...' : 'Generate AI Summary'}
            </button>
          </form>

          {result ? (
            <div
              style={{
                marginTop: '22px',
                padding: '18px',
                border: '1px solid #d1d5db',
                borderRadius: '14px',
                background: '#fafafa',
                whiteSpace: 'pre-wrap',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>AI Result</h3>
              {result}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  boxSizing: 'border-box' as const,
};
