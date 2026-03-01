/**
 * email.ts — Transactional email via Resend
 *
 * Exports sendReportEmail({ env, to, token, intake, reportJson, workerUrl })
 */

import type { Env } from "./types";

interface SendOptions {
  env: Env;
  to: string;
  token: string;
  intake: Record<string, string>;
  reportJson: unknown;
  workerUrl: string;
}

export async function sendReportEmail(opts: SendOptions): Promise<void> {
  const { env, to, token, intake, workerUrl } = opts;

  const firstName = (intake?.firstName ?? intake?.name ?? "there").split(" ")[0];
  const pdfUrl = `${workerUrl}/api/report/${token}/pdf`;
  const reportUrl = `${env.APP_URL ?? "https://offerintegrity.io"}/report/${token}`;

  const html = buildHtml({ firstName, reportUrl, pdfUrl, token });
  const text = buildText({ firstName, reportUrl, pdfUrl });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OfferIntegrity <reports@offerintegrity.io>",
      to: [to],
      subject: "Your Offer Validation Report is Ready",
      html,
      text,
      tags: [{ name: "report_token", value: token }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
}

// ─── HTML Template ─────────────────────────────────────────────────────────

function buildHtml({
  firstName,
  reportUrl,
  pdfUrl,
  token,
}: {
  firstName: string;
  reportUrl: string;
  pdfUrl: string;
  token: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Offer Validation Report</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0c;font-family:Georgia,'Times New Roman',serif;color:#e8e0d0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0c;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px;border-bottom:1px solid #2a2420;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#d8b35a;font-family:Arial,sans-serif;">
                      OFFERINTEGRITY
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#6b5f50;font-family:Arial,sans-serif;">
                      Offer Validation Report
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 0 32px;">
              <p style="margin:0 0 20px;font-size:18px;color:#e8e0d0;">
                ${firstName},
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#b8aca0;">
                Your 7-pillar offer validation report is ready. It covers positioning, pricing integrity, proof structure, conversion clarity, and the risk factors most likely to stall your sales conversations.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#b8aca0;">
                Read it carefully — the findings in this report reflect patterns that consistently separate high-converting offers from those that generate interest but rarely close.
              </p>

              <!-- Primary CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#d8b35a;border-radius:4px;">
                    <a href="${reportUrl}"
                       style="display:block;padding:14px 32px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#0b0b0c;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;">
                      View Your Report
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary CTA -->
              <p style="margin:24px 0 0;font-size:13px;color:#6b5f50;font-family:Arial,sans-serif;">
                Prefer a PDF?
                <a href="${pdfUrl}" style="color:#d8b35a;text-decoration:none;">
                  Download your report (PDF)
                </a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #2a2420;padding:24px 0 0;">
              <p style="margin:0 0 8px;font-size:11px;color:#4a403a;font-family:Arial,sans-serif;line-height:1.6;">
                This email was sent because a report was purchased at offerintegrity.io.<br/>
                Your report token: <code style="color:#6b5f50;">${token}</code><br/>
                Keep this email — it contains your access link.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Plain Text Fallback ────────────────────────────────────────────────────

function buildText({
  firstName,
  reportUrl,
  pdfUrl,
}: {
  firstName: string;
  reportUrl: string;
  pdfUrl: string;
}): string {
  return `${firstName},

Your 7-pillar offer validation report is ready.

View your report:
${reportUrl}

Download as PDF:
${pdfUrl}

This report covers positioning, pricing integrity, proof structure, conversion clarity, and the risk factors most likely to stall your sales conversations.

— OfferIntegrity
https://offerintegrity.io
`;
}
