'use client';

import { useMemo, useState } from 'react';

type FormData = {
  customer_name: string;
  phone: string;
  service_address: string;
  service_type: string;
  urgency: string;
  property_type: string;
  source: string;
  problem_duration: string;
  customer_notes: string;
};

const initialForm: FormData = {
  customer_name: '',
  phone: '',
  service_address: '',
  service_type: '',
  urgency: '',
  property_type: '',
  source: '',
  problem_duration: '',
  customer_notes: '',
};

export default function HomePage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState<'success' | 'error' | ''>('');

  const completedCount = useMemo(() => {
    return Object.values(form).filter((value) => value.trim() !== '').length;
  }, [form]);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSubmitMessage('');
      setSubmitType('');

      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit request');
      }

      setSubmitMessage(
        'Request submitted successfully. We will contact you shortly. / 已成功提交，我们会尽快联系您。'
      );
      setSubmitType('success');
      setForm(initialForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error(error);
      setSubmitMessage(
        error?.message ||
          'Submission failed. Please call us directly at 626-503-7777. / 提交失败，请直接致电我们。'
      );
      setSubmitType('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        color: '#111827',
        fontFamily:
          'Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        padding: '20px 14px 50px',
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        {submitMessage ? (
          <div
            style={{
              marginBottom: '14px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: submitType === 'success' ? '#dcfce7' : '#fee2e2',
              color: submitType === 'success' ? '#166534' : '#991b1b',
              border:
                submitType === 'success'
                  ? '1px solid #86efac'
                  : '1px solid #fca5a5',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {submitMessage}
          </div>
        ) : null}

        <section
          style={{
            background:
              'linear-gradient(135deg, #0b1731 0%, #10244c 45%, #183c7a 100%)',
            color: '#ffffff',
            borderRadius: '18px 18px 0 0',
            padding: '14px 18px 16px',
            boxShadow: '0 10px 28px rgba(15,23,42,0.16)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.78)',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Licensed • Professional • Fast Response
          </div>

          <h1
            style={{
              margin: '0 0 10px',
              fontSize: 'clamp(28px, 4.5vw, 42px)',
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            KCW Construction & Plumbing Inc.
          </h1>

          <div
            style={{
              fontSize: '15px',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            Licensed Plumbing & Construction Service
            <br />
            双语服务 (English / 中文)
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <a href="tel:6265037777" style={callButtonStyle}>
              📞 Call Now
            </a>

            <a
              href="https://www.kcwpro.com"
              target="_blank"
              rel="noreferrer"
              style={websiteButtonStyle}
            >
              🌐 Visit Website
            </a>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            padding: '16px',
          }}
        >
          <div style={infoBoxStyle}>
            <InfoRow label="License" value="#1129463" />
            <InfoRow label="Phone" value="626-503-7777" />
            <InfoRow label="Email" value="kcwpro7777@gmail.com" />
            <InfoRow label="Service Area" value="Greater Los Angeles" />
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #e5e7eb',
            borderRight: '1px solid #e5e7eb',
            padding: '0 16px 16px',
          }}
        >
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 14px',
            }}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                marginBottom: '8px',
                color: '#111827',
              }}
            >
              Supported Services / 服务范围
            </div>

            <div
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#4b5563',
              }}
            >
              Water Heater • Drain Cleaning • Main Water Line • Gas Line • Leak Repair • General Plumbing
            </div>
          </div>
        </section>

        <section
          id="request-service"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 18px 18px',
            padding: '16px',
            boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            Form completion: {completedCount}/9
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input
                value={form.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                placeholder="Customer Name / 客户姓名"
                autoComplete="name"
                style={inputStyle}
              />

              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Phone Number / 电话"
                autoComplete="tel"
                inputMode="tel"
                style={inputStyle}
              />

              <input
                value={form.service_address}
                onChange={(e) => updateField('service_address', e.target.value)}
                placeholder="Service Address / 服务地址"
                autoComplete="street-address"
                style={inputStyle}
              />

              <select
                value={form.service_type}
                onChange={(e) => updateField('service_type', e.target.value)}
                style={inputStyle}
              >
                <option value="">Service Type / 服务类型</option>
                <option value="water heater">Water Heater</option>
                <option value="drain cleaning">Drain Cleaning</option>
                <option value="main water line">Main Water Line</option>
                <option value="gas line">Gas Line</option>
                <option value="leak repair">Leak Repair</option>
                <option value="general plumbing">General Plumbing</option>
                <option value="other">Other</option>
              </select>

              <select
                value={form.urgency}
                onChange={(e) => updateField('urgency', e.target.value)}
                style={inputStyle}
              >
                <option value="">Urgency / 紧急程度</option>
                <option value="urgent">Urgent / 紧急</option>
                <option value="normal">Normal / 一般</option>
                <option value="low">Low / 不急</option>
              </select>

              <select
                value={form.property_type}
                onChange={(e) => updateField('property_type', e.target.value)}
                style={inputStyle}
              >
                <option value="">Property Type / 物业类型</option>
                <option value="residential">Residential / 住宅</option>
                <option value="commercial">Commercial / 商业</option>
              </select>

              <select
                value={form.source}
                onChange={(e) => updateField('source', e.target.value)}
                style={inputStyle}
              >
                <option value="">How did you find us? / 您通过什么渠道找到我们？</option>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="wechat">微信</option>
                <option value="referral">Referral / 介绍</option>
                <option value="website">Website</option>
                <option value="other">Other</option>
              </select>

              <select
                value={form.problem_duration}
                onChange={(e) => updateField('problem_duration', e.target.value)}
                style={inputStyle}
              >
                <option value="">Problem Duration / 问题持续时间</option>
                <option value="same day">Same day / 当天</option>
                <option value="1 day">1 day / 1天</option>
                <option value="2-3 days">2-3 days / 2-3天</option>
                <option value="1 week">1 week / 1周</option>
                <option value="more than 1 week">More than 1 week / 超过1周</option>
              </select>

              <textarea
                value={form.customer_notes}
                onChange={(e) => updateField('customer_notes', e.target.value)}
                placeholder="Problem Description / 问题描述"
                rows={5}
                style={{
                  ...inputStyle,
                  minHeight: '130px',
                  paddingTop: '14px',
                  resize: 'vertical',
                }}
              />

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '6px',
                  width: '100%',
                  minHeight: '54px',
                  borderRadius: '12px',
                  border: 'none',
                  background: submitting ? '#93c5fd' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <span
        style={{
          display: 'inline-block',
          minWidth: '95px',
          fontSize: '15px',
          fontWeight: 800,
          color: '#111827',
          verticalAlign: 'top',
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: '#374151',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const infoBoxStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '14px',
  background: '#ffffff',
};

const callButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0 18px',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#111827',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 800,
};

const websiteButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0 18px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '50px',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  boxSizing: 'border-box',
  background: '#ffffff',
  color: '#111827',
  outline: 'none',
};