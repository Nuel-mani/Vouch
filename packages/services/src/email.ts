import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@vouch.ng';
const FROM_NAME = 'Vouch';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent:', options.subject);
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  businessName: string;
  pdfUrl?: string;
  brandColor?: string;
}): Promise<boolean> {
  const { to, customerName, invoiceNumber, amount, dueDate, businessName, pdfUrl, brandColor = '#2252c9' } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: ${brandColor}; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Invoice from ${businessName}</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 24px;">Hi ${customerName},</p>
      <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
        You have received a new invoice. Please find the details below:
      </p>
      
      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #666; padding: 8px 0;">Invoice Number</td>
            <td style="color: #333; font-weight: 600; text-align: right; padding: 8px 0;">#${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 8px 0;">Amount Due</td>
            <td style="color: ${brandColor}; font-weight: 700; font-size: 24px; text-align: right; padding: 8px 0;">₦${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 8px 0;">Due Date</td>
            <td style="color: #333; font-weight: 600; text-align: right; padding: 8px 0;">${dueDate}</td>
          </tr>
        </table>
      </div>
      
      ${pdfUrl ? `
        <a href="${pdfUrl}" style="display: block; background: ${brandColor}; color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
          View Invoice PDF
        </a>
      ` : ''}
      
      <p style="color: #666; font-size: 14px; margin: 0;">
        If you have any questions about this invoice, please reply to this email.
      </p>
    </div>
    <div style="background: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Sent via <span style="color: ${brandColor}; font-weight: 600;">Vouch</span> • Tax-Compliant Invoicing
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Invoice #${invoiceNumber} from ${businessName}`,
    html,
    text: `Invoice #${invoiceNumber} from ${businessName}\n\nAmount Due: ₦${amount.toLocaleString()}\nDue Date: ${dueDate}\n\n${pdfUrl ? `View Invoice: ${pdfUrl}` : ''}`,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  paidDate: string;
  businessName: string;
  brandColor?: string;
}): Promise<boolean> {
  const { to, customerName, invoiceNumber, amount, paidDate, businessName, brandColor = '#2252c9' } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
    <div style="background: #22c55e; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 24px;">Hi ${customerName},</p>
      <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
        Thank you for your payment! This email confirms that we have received your payment for Invoice #${invoiceNumber}.
      </p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #666; padding: 8px 0;">Invoice</td>
            <td style="color: #333; font-weight: 600; text-align: right;">#${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 8px 0;">Amount Paid</td>
            <td style="color: #22c55e; font-weight: 700; font-size: 24px; text-align: right;">₦${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 8px 0;">Payment Date</td>
            <td style="color: #333; font-weight: 600; text-align: right;">${paidDate}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666; font-size: 14px; margin: 0;">
        Thank you for your business!<br>
        <strong>${businessName}</strong>
      </p>
    </div>
    <div style="background: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Sent via <span style="color: ${brandColor}; font-weight: 600;">Vouch</span>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Payment Received - Invoice #${invoiceNumber}`,
    html,
    text: `Payment Received\n\nThank you for your payment of ₦${amount.toLocaleString()} for Invoice #${invoiceNumber}.\n\nPayment Date: ${paidDate}`,
  });
}

/**
 * Send tax deadline reminder
 */
export async function sendTaxReminderEmail(params: {
  to: string;
  name: string;
  deadline: string;
  taxType: string;
  estimatedAmount: number;
}): Promise<boolean> {
  const { to, name, deadline, taxType, estimatedAmount } = params;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
    <div style="background: #f59e0b; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">Tax Deadline Reminder</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 24px;">Hi ${name},</p>
      <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
        This is a reminder that your <strong>${taxType}</strong> filing deadline is approaching.
      </p>
      
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 8px;">Deadline</p>
        <p style="color: #92400e; font-size: 24px; font-weight: 700; margin: 0;">${deadline}</p>
        ${estimatedAmount > 0 ? `<p style="color: #666; font-size: 14px; margin: 16px 0 0;">Estimated Liability: ₦${estimatedAmount.toLocaleString()}</p>` : ''}
      </div>
      
      <a href="${process.env.APP_URL || 'https://vouch.ng'}/tax-engine" style="display: block; background: #2252c9; color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Review Your Tax Status
      </a>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `⏰ Tax Reminder: ${taxType} due ${deadline}`,
    html,
  });
}
