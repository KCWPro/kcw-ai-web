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
        background: '#f7f7f7',
        padding: '32px 16px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            KCW Construction & Plumbing Inc.
          </h1>
          <p style={{ fontSize: '18px', margin: 0 }}>
            AI Lead Intake Form
          </p>
          <p style={{ color: '#555', marginTop: '12px', lineHeight: 1.6 }}>
            Fast plumbing and construction request intake for Los Angeles County.
            Fill in the form below and generate an internal AI summary for follow-up.
          </p>
          <div style={{ marginTop: '16px', lineHeight: 1.8 }}>
            <div><strong>License:</strong> #1129463</div>
            <div><strong>Phone:</strong> 626-503-7777</div>
            <div><strong>Email:</strong> kcwpro7777@gmail.com</div>
            <div><strong>Website:</strong> www.kcwpro.com</div>
          </div>
        </div>

        <div
          style={{
            background: '#eef5ff',
            border: '1px solid #d6e6ff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <strong>Supported services:</strong>
          <div style={{ marginTop: '8px', lineHeight: 1.8 }}>
            • Water Heater Installation / Replacement<br />
            • Drain Cleaning<br />
            • Main Water Line Work<br />
            • Gas Line Repair<br />
            • General Plumbing Requests
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
              borderRadius: '10px',
              padding: '14px 18px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Generate AI Summary'}
          </button>
        </form>

        {result ? (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              background: '#fafafa',
              whiteSpace: 'pre-wrap',
            }}
          >
            <h3 style={{ marginTop: 0 }}>AI Result</h3>
            {result}
          </div>
        ) : null}
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  boxSizing: 'border-box' as const,
};
