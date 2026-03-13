'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Lead = {
  id?: number | string;
  status?: string;
  created_at: string;
  customer_name: string;
  phone: string;
  service_address?: string;
  service_type: string;
  urgency: string;
  property_type: string;
  source?: string;
  problem_duration: string;
  customer_notes: string;
  ai_result: string;
  quote_amount?: string;
  appointment_date?: string;
  follow_up_notes?: string;
};

type EditableLeadFields = {
  status: string;
  quote_amount: string;
  appointment_date: string;
  follow_up_notes: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editableFields, setEditableFields] = useState<
    Record<string, EditableLeadFields>
  >({});
  const [savingId, setSavingId] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageType, setSaveMessageType] = useState<
    'success' | 'error' | ''
  >('');

  function showMessage(message: string, type: 'success' | 'error') {
    setSaveMessage(message);
    setSaveMessageType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.setTimeout(() => {
      setSaveMessage('');
      setSaveMessageType('');
    }, 3000);
  }

  async function loadLeads() {
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
      const data = await res.json();

      const sortedLeads = (data.leads || []).sort((a: Lead, b: Lead) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setLeads(sortedLeads);

      const draftMap: Record<string, EditableLeadFields> = {};
      sortedLeads.forEach((lead: Lead) => {
        const key = String(lead.id || '');
        draftMap[key] = {
          status: lead.status || 'new',
          quote_amount: lead.quote_amount || '',
          appointment_date: lead.appointment_date || '',
          follow_up_notes: lead.follow_up_notes || '',
        };
      });
      setEditableFields(draftMap);
    } catch (error) {
      console.error(error);
      showMessage('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function updateEditableField(
    leadId: number | string | undefined,
    field: keyof EditableLeadFields,
    value: string
  ) {
    if (!leadId) return;

    const key = String(leadId);

    setEditableFields((prev) => ({
      ...prev,
      [key]: {
        status: prev[key]?.status || 'new',
        quote_amount: prev[key]?.quote_amount || '',
        appointment_date: prev[key]?.appointment_date || '',
        follow_up_notes: prev[key]?.follow_up_notes || '',
        [field]: value,
      },
    }));
  }

  async function saveLead(leadId: number | string | undefined) {
    if (!leadId) return;

    const key = String(leadId);
    const draft = editableFields[key];
    if (!draft) return;

    try {
      setSavingId(key);
      setSaveMessage('');
      setSaveMessageType('');

      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          status: draft.status,
          quote_amount: draft.quote_amount,
          appointment_date: draft.appointment_date,
          follow_up_notes: draft.follow_up_notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await loadLeads();
        showMessage('Saved successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to save lead', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Failed to save lead', 'error');
    } finally {
      setSavingId('');
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === 'all' ? true : (lead.status || 'new') === statusFilter;

      const keyword = searchText.trim().toLowerCase();

      const matchesSearch =
        keyword === ''
          ? true
          : `${lead.customer_name} ${lead.phone} ${lead.service_address || ''} ${lead.service_type} ${lead.customer_notes} ${lead.source || ''}`
              .toLowerCase()
              .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [leads, searchText, statusFilter]);

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
          maxWidth: '960px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h1>KCW Saved Leads</h1>
          <p>Total Leads: {leads.length}</p>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← Back to Intake Form
          </Link>
        </div>

        {saveMessage ? (
          <div
            style={{
              position: 'sticky',
              top: '12px',
              zIndex: 20,
              marginBottom: '16px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: saveMessageType === 'success' ? '#dcfce7' : '#fee2e2',
              color: saveMessageType === 'success' ? '#166534' : '#991b1b',
              border:
                saveMessageType === 'success'
                  ? '1px solid #86efac'
                  : '1px solid #fca5a5',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            {saveMessage}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <input
            placeholder="Search by name, phone, address, service, notes"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
          >
            <option value="all">All statuses</option>
            <option value="new">new</option>
            <option value="contacted">contacted</option>
            <option value="quoted">quoted</option>
            <option value="won">won</option>
            <option value="lost">lost</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredLeads.length === 0 ? (
          <p>No matching leads found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredLeads.map((lead, index) => {
              const key = String(lead.id || index);
              const draft = editableFields[key] || {
                status: lead.status || 'new',
                quote_amount: lead.quote_amount || '',
                appointment_date: lead.appointment_date || '',
                follow_up_notes: lead.follow_up_notes || '',
              };

              return (
                <div
                  key={key}
                  style={{
                    border: '1px solid #ccc',
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#fafafa',
                  }}
                >
                  <p><strong>ID:</strong> {lead.id || 'old-record'}</p>
                  <p><strong>Date:</strong> {lead.created_at}</p>
                  <p><strong>Name:</strong> {lead.customer_name}</p>
                  <p><strong>Phone:</strong> {lead.phone}</p>
                  <p><strong>Service Address:</strong> {lead.service_address || ''}</p>
                  <p><strong>Service Type:</strong> {lead.service_type}</p>
                  <p><strong>Urgency:</strong> {lead.urgency}</p>
                  <p><strong>Property Type:</strong> {lead.property_type}</p>
                  <p><strong>Source:</strong> {lead.source || ''}</p>
                  <p><strong>Problem Duration:</strong> {lead.problem_duration}</p>
                  <p><strong>Customer Notes:</strong> {lead.customer_notes}</p>

                  <div style={{ marginTop: '14px' }}>
                    <p><strong>Status:</strong></p>
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        updateEditableField(lead.id, 'status', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        marginBottom: '12px',
                        background: '#fff',
                      }}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="quoted">quoted</option>
                      <option value="won">won</option>
                      <option value="lost">lost</option>
                    </select>

                    <p><strong>Quote Amount:</strong></p>
                    <input
                      type="text"
                      value={draft.quote_amount}
                      onChange={(e) =>
                        updateEditableField(lead.id, 'quote_amount', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        marginBottom: '12px',
                        background: '#fff',
                      }}
                    />

                    <p><strong>Appointment Date:</strong></p>
                    <input
                      type="date"
                      value={draft.appointment_date}
                      onChange={(e) =>
                        updateEditableField(
                          lead.id,
                          'appointment_date',
                          e.target.value
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        marginBottom: '12px',
                        background: '#fff',
                      }}
                    />

                    <p><strong>Follow-up Notes:</strong></p>
                    <textarea
                      value={draft.follow_up_notes}
                      onChange={(e) =>
                        updateEditableField(
                          lead.id,
                          'follow_up_notes',
                          e.target.value
                        )
                      }
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        marginBottom: '12px',
                        resize: 'vertical',
                        background: '#fff',
                      }}
                    />

                    <button
                      onClick={() => saveLead(lead.id)}
                      disabled={savingId === key}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: savingId === key ? '#93c5fd' : '#2563eb',
                        color: '#fff',
                        cursor: savingId === key ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {savingId === key ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <p><strong>AI Result:</strong></p>
                    <div
                      style={{
                        background: '#fff',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                      }}
                    >
                      {lead.ai_result}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}