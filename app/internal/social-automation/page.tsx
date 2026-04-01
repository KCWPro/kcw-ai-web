export default function SocialAutomationPage() {
  return (
    <main style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Social Automation</h1>
      <section>
        <h2>Platform Connections</h2>
        <p>Minimal placeholder for connection status.</p>
      </section>
      <section>
        <h2>Publish Queue</h2>
        <p>Minimal placeholder for queued publish jobs.</p>
      </section>
      <section
        style={{
          marginTop: '16px',
          padding: '12px',
          border: '1px solid #f59e0b',
          background: '#fffbeb',
        }}
      >
        <strong>Degraded Mode Notice</strong>
        <p>This page is running in a minimal, scope-locked mode.</p>
      </section>
    </main>
  );
}
