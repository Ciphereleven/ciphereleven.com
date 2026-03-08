module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const data = payload.data || payload;
    const { from, to, subject, html, text, reply_to } = data;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hello@ciphereleven.com',
        to: ['benchbrex@gmail.com'],
        subject: '[FWD] ' + (subject || '(No Subject)'),
        html: html || ('<pre>' + (text || 'No content') + '</pre>'),
        reply_to: from || reply_to,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return res.status(500).json({ error: 'Failed to forward', details: result });
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
