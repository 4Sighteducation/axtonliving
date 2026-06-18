function formatEmailBody(items, generalNotes, submittedAt) {
  let body = 'AXTON LIVING — WEBSITE FEEDBACK FORM\n';
  body += `Submitted: ${submittedAt}\n`;
  body += 'Client: Catherine Marie Axton / Axton Living Ltd\n';
  body += '='.repeat(50) + '\n\n';

  for (const item of items) {
    body += `${item.ref} — ${item.label}\n`;
    body += `Status: ${item.status.toUpperCase()}\n`;
    if (item.notes) body += `Notes:\n${item.notes}\n`;
    body += '\n' + '-'.repeat(40) + '\n\n';
  }

  if (generalNotes?.trim()) {
    body += 'GENERAL COMMENTS\n';
    body += generalNotes.trim() + '\n';
  }

  return body;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const toEmail = process.env.FEEDBACK_TO_EMAIL || 'tony@4site.dev';

  if (!apiKey || !fromEmail) {
    console.error('Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { items = [], generalNotes = '', submittedAt } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No feedback items provided' });
    }

    const textBody = formatEmailBody(items, generalNotes, submittedAt);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: 'Axton Living Feedback' },
        subject: 'Axton Living — Website Feedback (Review Round 1)',
        content: [{ type: 'text/plain', value: textBody }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
