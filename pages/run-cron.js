// pages/run-cron.js
// Purpose: avoid build-time prerender errors and run only on request.
// If you need to trigger cron logic, do it via /api/cron (server-side), not in this page.

export default function RunCron() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Run Cron</h1>
      <p>This page is server-rendered to avoid build-time prerendering.</p>
      <p>Trigger logic should live in <code>/api/cron</code>.</p>
    </main>
  );
}

// Force server-side rendering so Next.js will NOT statically prerender this page during build.
export async function getServerSideProps() {
  // Do NOT call res.status(...) here; this is NOT an API route.
  // If you need to trigger the cron, call your API from here or move logic into /api/cron.
  // Example (optional):
  // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cron`).catch(() => {});
  return { props: {} };
}
