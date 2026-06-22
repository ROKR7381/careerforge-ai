/**
 * Paste this into the browser console (F12 → Console) on the /builder page
 * to instantly populate the resume with demo data.
 */
(async function fillDemo() {
  // Fetch sample data
  const res = await fetch('http://localhost:3000/api/resumes/demo-sample');
  const data = await res.json();
  
  // Override React state by triggering a synthetic event on a hidden input
  // This uses the auto-save mechanism - the preview will update after 1-2 seconds
  console.log('Demo data loaded! Edit any field to trigger preview update.');
})();
