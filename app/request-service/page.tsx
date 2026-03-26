'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type FormState = {
  customer_name: string;
  phone: string;
  service_address: string;
  service_type: string;
  urgency: string;
  customer_notes: string;
  property_type: string;
  source: string;
  problem_duration: string;
  quote_amount: string;
  contact_method: string;
  photos: FileList | null;
};

const initialForm: FormState = {
  customer_name: '',
  phone: '',
  service_address: '',
  service_type: '',
  urgency: 'soon',
  customer_notes: '',
  property_type: '',
  source: 'website',
  problem_duration: '',
  quote_amount: '',
  contact_method: '',
  photos: null,
};

export default function RequestServicePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(
      form.customer_name.trim() &&
        form.phone.trim() &&
        form.service_address.trim() &&
        form.service_type.trim() &&
        form.customer_notes.trim(),
    );
  }, [form]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          phone: form.phone,
          city: form.service_address,
          service_address: form.service_address,
          service_type: form.service_type,
          urgency: form.urgency,
          customer_notes: form.customer_notes,
          property_type: form.property_type,
          source: form.source,
          problem_duration: form.problem_duration,
          quote_amount: form.quote_amount,
          contact_method: form.contact_method,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send your request right now.');
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to send your request right now.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ← Back to Home
        </Link>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {!success ? (
            <>
              <header>
                <h1 className="text-3xl font-semibold tracking-tight">Request Service</h1>
                <p className="mt-1 text-sm text-slate-500">提交服务申请</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                  Tell us a few details about your plumbing or construction issue. We&apos;ll review your request and
                  follow up as soon as possible.
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">请填写一些基本信息，我们会尽快查看并与您联系。</p>
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  If your issue is urgent, please call us directly at{' '}
                  <a href="tel:6265037777" className="font-semibold text-amber-800 underline hover:text-amber-900">
                    626-503-7777
                  </a>
                  .
                </p>
              </header>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h2 className="text-base font-semibold text-slate-900">Contact Information</h2>
                  <p className="mt-1 text-xs text-slate-500">联系信息</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-slate-800">
                      Full Name
                      <input
                        required
                        value={form.customer_name}
                        onChange={(e) => updateField('customer_name', e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-800">
                      Phone Number
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2 text-sm font-medium text-slate-800">
                    Service Address
                    <input
                      required
                      value={form.service_address}
                      onChange={(e) => updateField('service_address', e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                    />
                    <p className="text-xs font-normal leading-5 text-slate-500">
                      You can enter the job site or property address where service is needed.
                    </p>
                    <p className="text-xs font-normal text-slate-400">请填写需要服务的工地或物业地址。</p>
                  </label>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h2 className="text-base font-semibold text-slate-900">Service Details</h2>
                  <p className="mt-1 text-xs text-slate-500">服务情况</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-slate-800">
                      Service Type
                      <select
                        required
                        value={form.service_type}
                        onChange={(e) => updateField('service_type', e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                      >
                        <option value="">Select service type</option>
                        <option value="water_heater">Water Heater</option>
                        <option value="leak_repair">Leak Repair</option>
                        <option value="drain_cleaning">Drain Services</option>
                        <option value="gas_line">Gas Line Work</option>
                        <option value="repipe">Repipe Services</option>
                        <option value="remodel_plumbing">Remodel Plumbing</option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-800">
                      How urgent is this?
                      <select
                        value={form.urgency}
                        onChange={(e) => updateField('urgency', e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                      >
                        <option value="urgent">Urgent (as soon as possible)</option>
                        <option value="soon">Soon (next few days)</option>
                        <option value="flexible">Flexible schedule</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2 text-sm font-medium text-slate-800">
                    Describe the problem
                    <p className="text-xs font-normal leading-5 text-slate-500">
                      Please tell us what is happening and any details that may help us understand the issue.
                    </p>
                    <textarea
                      required
                      rows={6}
                      value={form.customer_notes}
                      onChange={(e) => updateField('customer_notes', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none ring-blue-600 transition focus:ring-2"
                    />
                  </label>
                </section>

                <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <h2 className="text-base font-medium text-slate-700">Optional Details</h2>
                  <p className="mt-1 text-xs text-slate-500">补充信息（选填）</p>
                  <p className="mt-1 text-sm text-slate-500">
                    You can add more details if you&apos;d like, but this section is optional.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      Property Type (optional)
                      <select
                        value={form.property_type}
                        onChange={(e) => updateField('property_type', e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-blue-600 transition focus:ring-2"
                      >
                        <option value="">Select property type</option>
                        <option value="single_family">Single Family Home</option>
                        <option value="multi_family">Multi-Family Property</option>
                        <option value="commercial">Commercial</option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      Preferred Contact Method (optional)
                      <select
                        value={form.contact_method}
                        onChange={(e) => updateField('contact_method', e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-blue-600 transition focus:ring-2"
                      >
                        <option value="">No preference</option>
                        <option value="phone">Phone Call</option>
                        <option value="text">Text Message</option>
                        <option value="email">Email</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      Upload Photos (optional)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => updateField('photos', e.target.files)}
                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      How long has this been happening? (optional)
                      <input
                        value={form.problem_duration}
                        onChange={(e) => updateField('problem_duration', e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-blue-600 transition focus:ring-2"
                        placeholder="Example: 2 days / 1 week"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
                    Do you have a budget range in mind? (optional)
                    <input
                      value={form.quote_amount}
                      onChange={(e) => updateField('quote_amount', e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-blue-600 transition focus:ring-2"
                      placeholder="Only if you already have one in mind"
                    />
                  </label>
                </section>

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

                <section className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm text-slate-700">
                    We&apos;ll review your request and follow up as soon as possible after submission.
                  </p>
                </section>

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitting ? 'Sending...' : 'Request Service 提交申请'}
                </button>
              </form>
            </>
          ) : (
            <section className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Your request has been received.</h2>
              <p className="mt-1 text-sm text-slate-600">我们已收到您的申请。</p>
              <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
                Thank you for contacting KCW Construction & Plumbing. Our team will review your request and follow up
                as soon as possible.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                If your issue is urgent, please call us directly at{' '}
                <a href="tel:6265037777" className="font-semibold text-blue-700 hover:text-blue-800">
                  626-503-7777
                </a>
                .
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Back to Home
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Submit Another Request
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
