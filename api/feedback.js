function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statusMeta(status) {
  switch (status) {
    case 'approve':
      return { label: 'Approved', bg: '#dcfce7', color: '#166534', border: '#86efac' };
    case 'amend':
      return { label: 'Amend', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
    case 'replace':
      return { label: 'Replace', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    default:
      return { label: 'Not set', bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db' };
  }
}

function sectionFromRef(ref) {
  const prefix = (ref || '').split('-')[0];
  const map = {
    BRAND: '§ 01 — Brand & General',
    HOME: '§ 02 — Home Page',
    IMG: '§ 03 — Photography & Images',
    ABT: '§ 04 — About / Our Story',
    SVC: '§ 05 — Services',
    SOC: '§ 06 — Social Media & Gallery',
    CTT: '§ 07 — Contact & Details',
    SEO: '§ 08 — SEO & Visibility',
  };
  return map[prefix] || 'Other';
}

function summariseItems(items) {
  return items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      if (item.status === 'amend' || item.status === 'replace' || item.status === 'NOT SET') {
        acc.action.push(item);
      }
      return acc;
    },
    { approve: 0, amend: 0, replace: 0, 'NOT SET': 0, action: [] }
  );
}

function formatEmailBody(items, generalNotes, submittedAt) {
  const summary = summariseItems(items);
  let body = 'AXTON LIVING — WEBSITE FEEDBACK\n';
  body += `Submitted: ${submittedAt}\n`;
  body += 'Client: Catherine Marie Axton / Axton Living Ltd\n\n';
  body += 'SUMMARY\n';
  body += `Approved: ${summary.approve}  |  Amend: ${summary.amend}  |  Replace: ${summary.replace}  |  Not set: ${summary['NOT SET']}\n\n`;

  if (summary.action.length) {
    body += 'ACTION REQUIRED\n';
    summary.action.forEach((item) => {
      body += `• [${item.status.toUpperCase()}] ${item.ref} — ${item.label}\n`;
    });
    body += '\n';
  }

  let currentSection = '';
  for (const item of items) {
    const section = item.section || sectionFromRef(item.ref);
    if (section !== currentSection) {
      currentSection = section;
      body += `\n${'='.repeat(50)}\n${section.toUpperCase()}\n${'='.repeat(50)}\n\n`;
    }
    body += `${item.ref} — ${item.label}\n`;
    body += `Status: ${item.status.toUpperCase()}\n`;
    if (item.notes) body += `Notes:\n${item.notes}\n`;
    body += '\n';
  }

  if (generalNotes?.trim()) {
    body += `${'='.repeat(50)}\nGENERAL COMMENTS\n${'='.repeat(50)}\n\n`;
    body += `${generalNotes.trim()}\n`;
  }

  return body;
}

function renderItemCard(item) {
  const status = statusMeta(item.status);
  const notes = item.notes?.trim();

  return `
    <tr>
      <td style="padding:0 0 14px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#ffffff;">
          <tr>
            <td style="padding:16px 18px 12px 18px;border-left:4px solid ${status.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.3;color:#14462e;font-weight:600;">
                    ${escapeHtml(item.label)}
                  </td>
                  <td align="right" style="white-space:nowrap;padding-left:12px;">
                    <span style="display:inline-block;padding:5px 10px;border-radius:999px;background:${status.bg};color:${status.color};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                      ${status.label}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;margin-top:6px;">
                ${escapeHtml(item.ref)}
              </div>
              ${
                notes
                  ? `<div style="margin-top:12px;padding:12px 14px;background:#fffaf9;border-radius:8px;border:1px solid #f5c4cb;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap;">${escapeHtml(notes)}</div>`
                  : ''
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function formatEmailHtml(items, generalNotes, submittedAt) {
  const summary = summariseItems(items);

  const grouped = items.reduce((acc, item) => {
    const key = item.section || sectionFromRef(item.ref);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const actionRows = summary.action
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #fdeef0;font-family:Arial,sans-serif;font-size:14px;color:#374151;">
            <strong style="color:#14462e;">${escapeHtml(item.ref)}</strong>
            <span style="color:#9ca3af;"> — </span>${escapeHtml(item.label)}
            <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:${statusMeta(item.status).bg};color:${statusMeta(item.status).color};font-size:11px;font-weight:700;text-transform:uppercase;">
              ${statusMeta(item.status).label}
            </span>
          </td>
        </tr>
      `
    )
    .join('');

  const sectionBlocks = Object.entries(grouped)
    .map(([section, sectionItems]) => {
      const cards = sectionItems.map(renderItemCard).join('');
      return `
        <tr>
          <td style="padding:28px 0 8px 0;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;color:#14462e;font-weight:600;margin-bottom:14px;">
              ${escapeHtml(section)}
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${cards}
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Axton Living Feedback</title>
</head>
<body style="margin:0;padding:0;background:#fffaf9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffaf9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #f5c4cb;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#14462e 0%,#f5c4cb 50%,#14462e 100%);"></td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px 28px;background:#14462e;color:#ffffff;">
              <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#fbdade;margin-bottom:10px;">
                4site.dev — Axton Living Build Review
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.1;font-weight:600;margin-bottom:10px;">
                Website Feedback Received
              </div>
              <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.88);">
                Catherine Marie Axton · Axton Living Ltd<br>
                ${escapeHtml(submittedAt)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" style="padding:12px;background:#dcfce7;border-radius:10px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:28px;color:#166534;font-weight:600;">${summary.approve}</div>
                    <div style="font-family:Arial,sans-serif;font-size:11px;color:#166534;text-transform:uppercase;letter-spacing:0.08em;">Approved</div>
                  </td>
                  <td width="2%"></td>
                  <td width="25%" style="padding:12px;background:#fef3c7;border-radius:10px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:28px;color:#92400e;font-weight:600;">${summary.amend}</div>
                    <div style="font-family:Arial,sans-serif;font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;">Amend</div>
                  </td>
                  <td width="2%"></td>
                  <td width="25%" style="padding:12px;background:#fee2e2;border-radius:10px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:28px;color:#991b1b;font-weight:600;">${summary.replace}</div>
                    <div style="font-family:Arial,sans-serif;font-size:11px;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;">Replace</div>
                  </td>
                  <td width="2%"></td>
                  <td width="25%" style="padding:12px;background:#f3f4f6;border-radius:10px;text-align:center;">
                    <div style="font-family:Georgia,serif;font-size:28px;color:#4b5563;font-weight:600;">${summary['NOT SET']}</div>
                    <div style="font-family:Arial,sans-serif;font-size:11px;color:#4b5563;text-transform:uppercase;letter-spacing:0.08em;">Not set</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            summary.action.length
              ? `<tr>
                  <td style="padding:8px 28px 0 28px;">
                    <div style="font-family:Georgia,serif;font-size:20px;color:#14462e;font-weight:600;margin-bottom:10px;">Action required first</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f7;border:1px solid #f5c4cb;border-radius:12px;padding:4px 16px;">
                      ${actionRows}
                    </table>
                  </td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding:8px 28px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${sectionBlocks}
                ${
                  generalNotes?.trim()
                    ? `<tr>
                        <td style="padding-top:12px;">
                          <div style="font-family:Georgia,serif;font-size:24px;color:#14462e;font-weight:600;margin-bottom:14px;">General comments</div>
                          <div style="padding:16px 18px;background:#fffaf9;border:1px solid #f5c4cb;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escapeHtml(generalNotes.trim())}</div>
                        </td>
                      </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px 28px;border-top:1px solid #fdeef0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
              This feedback was submitted from the Axton Living review form at axtonliving.com/feedback
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    const htmlBody = formatEmailHtml(items, generalNotes, submittedAt);
    const actionCount = summariseItems(items).action.length;
    const subject = `Axton Living Feedback — ${actionCount} item${actionCount === 1 ? '' : 's'} need action`;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: 'Axton Living Feedback' },
        subject,
        content: [
          { type: 'text/plain', value: textBody },
          { type: 'text/html', value: htmlBody },
        ],
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
