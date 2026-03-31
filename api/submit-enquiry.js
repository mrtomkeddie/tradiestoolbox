// Vercel Serverless Function — /api/submit-enquiry
// Proxies form submissions to Airtable, keeping the API key server-side.
// Set AIRTABLE_API_KEY in Vercel → Project settings → Environment variables.

const BASE_ID = 'appkAMJ5sYFWNkfyq';
const TABLE_ID = 'tbl5jBdshlYo8I0yN'; // Enquiries

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { businessName, trade, location, currentSite, package: pkg, email } = req.body;

  if (!businessName || !trade || !location || !pkg || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const fields = {
    'Business Name': businessName,
    'Trade': trade,
    'Location': location,
    'Package': pkg,
    'Email': email,
    'Submitted At': new Date().toISOString(),
    'Status': 'New',
  };

  if (currentSite) fields['Current Website'] = currentSite;

  try {
    const airtableRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!airtableRes.ok) {
      const err = await airtableRes.json();
      console.error('Airtable error:', err);
      return res.status(500).json({ error: 'Failed to save enquiry' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Network error' });
  }
}
