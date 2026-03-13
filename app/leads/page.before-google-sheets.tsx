'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Lead = {
  id?: number;
  status?: string;
  created_at: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: string;
  property_type: string;
  problem_duration: string;
  customer_notes: string;
  ai_result: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadLeads() {
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
      const data = await res.json();

      const sortedLeads = (data.leads || []).sort((a: Lead, b: Lead) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setLeads(sortedLeads);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function updateStatus(id: number | undefined, status: string) {
    if (!id) return;

    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();

      if (data.success) {
        await loadLeads();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
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
          : `${lead.customer_name} ${lead.phone} ${lead.city} ${lead.service_type} ${lead.customer_notes}`
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

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <input
            placeholder="Search by name, phone, city, service, notes"
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
            {filteredLeads.map((lead, index) => (
              <div
                key={lead.id || index}
                style={{
                  border: '1px solid #ccc',
                  padding: '16px',
                  borderRadius: '12px',
                  whiteSpace: 'pre-wrap',
                  background: '#fafafa',
                }}
              >
                <p><strong>ID:</strong> {lead.id || 'old-record'}</p>
                <p><strong>Date:</strong> {lead.created_at}</p>
                <p><strong>Name:</strong> {lead.customer_name}</p>
                <p><strong>Phone:</strong> {lead.phone}</p>
                <p><strong>City:</strong> {lead.city}</p>
                <p><strong>Service Type:</strong> {lead.service_type}</p>
                <p><strong>Urgency:</strong> {lead.urgency}</p>
                <p><strong>Property Type:</strong> {lead.property_type}</p>
                <p><strong>Problem Duration:</strong> {lead.problem_duration}</p>
                <p><strong>Customer Notes:</strong> {lead.customer_notes}</p>

                <div style={{ margin: '12px 0' }}>
                  <strong>Status:</strong>{' '}
                  <select
                    value={lead.status || 'new'}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    disabled={!lead.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                    }}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="quoted">quoted</option>
                    <option value="won">won</option>
                    <option value="lost">lost</option>
                  </select>
                  {!lead.id ? ' (old record cannot be updated)' : ''}
                </div>

                <p><strong>AI Result:</strong></p>
                <div
                  style={{
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {lead.ai_result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
