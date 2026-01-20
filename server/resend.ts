import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendPdfEmail(
  toEmail: string, 
  pdfBuffer: Buffer, 
  userName: string,
  dominantFunction: string
) {
  const { client, fromEmail } = await getResendClient();
  
  const result = await client.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: 'Your Jungian Typology Assessment Results',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #44403c; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
          Your Jungian Typology Results
        </h1>
        
        <p style="color: #57534e; font-size: 16px; line-height: 1.6;">
          Dear ${userName || 'Explorer'},
        </p>
        
        <p style="color: #57534e; font-size: 16px; line-height: 1.6;">
          Thank you for completing the Jungian Typology Assessment. Your dominant cognitive function appears to be <strong>${dominantFunction}</strong>.
        </p>
        
        <p style="color: #57534e; font-size: 16px; line-height: 1.6;">
          Your complete 25+ page premium analysis is attached as a PDF. This report includes:
        </p>
        
        <ul style="color: #57534e; font-size: 16px; line-height: 1.8;">
          <li>Deep analysis of all 8 cognitive functions</li>
          <li>Your archetypal stack with detailed descriptions</li>
          <li>The Grip: Your stress patterns and recovery paths</li>
          <li>Relationships & compatibility insights</li>
          <li>Career alignment guidance</li>
          <li>Individuation path with exercises</li>
          <li>Active imagination prompts</li>
          <li>Dream journaling guide</li>
        </ul>
        
        <p style="color: #57534e; font-size: 16px; line-height: 1.6;">
          Remember: Your type is a starting point for self-reflection, not a fixed label. As Jung wrote, 
          <em>"The classification of individuals means nothing, nothing at all."</em>
        </p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fafaf9; border-left: 4px solid #d4a574;">
          <p style="color: #78716c; font-size: 14px; margin: 0;">
            <strong>Next Steps:</strong> Visit your results page to explore interactive features, 
            compare with past results, or share with others.
          </p>
        </div>
        
        <p style="color: #a8a29e; font-size: 12px; margin-top: 30px; text-align: center;">
          Jungian Typology Assessment<br>
          Based on the typological work of Carl Gustav Jung
        </p>
      </div>
    `,
    attachments: [
      {
        filename: 'jungian-typology-results.pdf',
        content: pdfBuffer.toString('base64'),
      }
    ]
  });
  
  return result;
}
