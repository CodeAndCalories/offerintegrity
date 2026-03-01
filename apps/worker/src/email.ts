export async function sendReportEmail(params: {
  to: string;
  offerName: string;
  reportToken: string;
  verdict: string;
  scorePercent: number;
  appUrl: string;
  resendApiKey: string;
}): Promise<void> {
  const { to, offerName, reportToken, verdict, scorePercent, appUrl, resendApiKey } = params;
  const reportUrl = `${appUrl}/report/${reportToken}`;
  const pdfUrl = `https://api.offerintegrity.io/api/report/${reportToken}/pdf`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #0a0a0a; color: #e8e0d0; margin: 0; padding: 40px 20px; }
    .container { max-width: 580px; margin: 0 auto; }
    .header { border-bottom: 1px solid #2a2a2a; padding-bottom: 24px; margin-bottom: 32px; }
    .brand { font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7a6a; }
    h1 { font-size: 24px; font-weight: normal; margin: 16px 0 8px; color: #e8e0d0; }
    .score-block { background: #111; border: 1px solid #2a2a2a; border-radius: 4px; padding: 24px; margin: 24px 0; text-align: center; }
    .score-number { font-size: 48px; color: #c9a96e; font-weight: 300; }
    .verdict { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #8a7a6a; margin-top: 4px; }
    .btn { display: inline-block; background: #c9a96e; color: #0a0a0a; text-decoration: none; padding: 14px 28px; border-radius: 3px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 8px 4px; }
    .btn-secondary { background: transparent; color: #c9a96e; border: 1px solid #c9a96e; }
    .footer { margin-top: 40px; font-size: 12px; color: #4a4a4a; border-top: 1px solid #1a1a1a; padding-top: 24px; }
    p { color: #a09080; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">OfferIntegrity.io</div>
      <h1>Your Offer Report is Ready</h1>
      <p>Your validation report for <strong style="color:#e8e0d0">${offerName}</strong> has been generated.</p>
    </div>

    <div class="score-block">
      <div class="score-number">${scorePercent}%</div>
      <div class="verdict">${verdict}</div>
    </div>

    <p>Your report includes a full breakdown across 7 scoring pillars, identified risks, strengths, and a prioritized 30-day action plan to improve your offer before launch.</p>

    <div style="text-align:center; margin: 32px 0;">
      <a href="${reportUrl}" class="btn">View Full Report</a>
      <a href="${pdfUrl}" class="btn btn-secondary">Download PDF</a>
    </div>

    <p style="font-size:13px; color:#5a5a5a;">This link is unique to your session. Bookmark it for future reference. Your report will remain accessible at the link above.</p>

    <div class="footer">
      OfferIntegrity.io &mdash; High Ticket Offer Validation<br>
      You received this because you submitted an offer for validation.
    </div>
  </div>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OfferIntegrity <reports@offerintegrity.io>",
      to: [to],
      subject: `Your Offer Report: ${verdict} (${scorePercent}%) — ${offerName}`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Resend error:", err);
    // Don't throw — email failure shouldn't block the user from seeing report
  }
}
