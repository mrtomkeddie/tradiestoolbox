// Netlify Function — submit-enquiry
// Proxies form submissions to Airtable, keeping the API key server-side.
// Set AIRTABLE_API_KEY in Netlify → Site settings → Environment variables.

const BASE_ID = 'appkAMJ5sYFWNkfyq';
const TABLE_ID = 'tbl5jBdshlYo8I0yN'; // Enquiries

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY is not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { businessName, trade, location, currentSite, package: pkg, email } = body;

  if (!businessName || !trade || !location || !pkg || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const record = {
    fields: {
      'Business Name': businessName,
      'Trade': trade,
      'Location': location,
      'Current Website': currentSite || undefined,
      'Package': pkg,
      'Email': email,
      'Submitted At': new Date().toISOString(),
      'Status': 'New',
    },
  };

  // Remove undefined fields (Airtable rejects them)
  Object.keys(record.fields).forEach(k => record.fields[k] === undefined && delete record.fields[k]);

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [record] }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Airtable error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save enquiry' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Network error' }) };
  }
}
