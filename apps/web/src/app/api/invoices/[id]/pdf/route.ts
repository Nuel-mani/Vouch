import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch invoice
  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Fetch user details
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      businessName: true,
      businessAddress: true,
      phoneNumber: true,
      email: true,
      brandColor: true,
      tinNumber: true,
    },
  });

  const items = JSON.parse(invoice.items as string) as {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];

  const subtotal = Number(invoice.amount) - Number(invoice.vatAmount);

  // Generate HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoice.serialId.toString().padStart(4, '0')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      font-size: 12px;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { 
      width: 60px; height: 60px; 
      background: ${fullUser?.brandColor || '#2252c9'}; 
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 24px;
    }
    .company-name { 
      font-size: 20px; font-weight: bold; 
      color: ${fullUser?.brandColor || '#2252c9'}; 
      margin-top: 12px; 
    }
    .company-info { color: #666; font-size: 11px; margin-top: 4px; }
    .invoice-title { 
      font-size: 32px; font-weight: 900; 
      color: ${fullUser?.brandColor || '#2252c9'}; 
      text-align: right; 
    }
    .invoice-number { font-size: 16px; color: #666; font-family: monospace; text-align: right; margin-top: 4px; }
    .invoice-dates { text-align: right; margin-top: 16px; font-size: 11px; color: #666; }
    .invoice-dates strong { color: #333; }
    .status-paid {
      display: inline-block; background: #dcfce7; color: #166534;
      padding: 6px 16px; border-radius: 20px; font-weight: bold;
      font-size: 11px; margin-top: 12px;
    }
    .bill-to { 
      background: ${fullUser?.brandColor || '#2252c9'}08;
      padding: 20px; border-radius: 12px; margin-bottom: 32px;
    }
    .bill-to-label { 
      font-size: 10px; text-transform: uppercase; 
      color: #666; letter-spacing: 1px; margin-bottom: 8px; 
    }
    .customer-name { font-size: 16px; font-weight: 600; color: #1a1a1a; }
    .customer-info { color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { 
      background: ${fullUser?.brandColor || '#2252c9'}10;
      padding: 12px 16px; text-align: left; font-weight: 600; color: #333;
    }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
    th:nth-child(2), th:nth-child(3) { text-align: center; }
    td { padding: 12px 16px; border-bottom: 1px solid #eee; }
    td:last-child { text-align: right; font-weight: 500; }
    td:nth-child(2), td:nth-child(3) { text-align: center; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-box { width: 240px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; color: #666; }
    .total-row.final { 
      border-top: 2px solid ${fullUser?.brandColor || '#2252c9'}; 
      padding-top: 12px; margin-top: 8px;
      font-weight: bold; font-size: 16px; color: #1a1a1a;
    }
    .total-row.final span:last-child { color: ${fullUser?.brandColor || '#2252c9'}; }
    .notes { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 32px; }
    .notes-label { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 8px; }
    .notes-text { color: #666; white-space: pre-line; }
    .footer { 
      text-align: center; padding-top: 24px; 
      border-top: 1px solid #eee; color: #999; font-size: 11px; 
    }
    .footer-brand { color: ${fullUser?.brandColor || '#2252c9'}; font-weight: 600; }
    @media print {
      body { padding: 0; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">${(fullUser?.businessName?.[0] || 'O').toUpperCase()}</div>
      <div class="company-name">${fullUser?.businessName || 'Your Business'}</div>
      ${fullUser?.businessAddress ? `<div class="company-info">${fullUser.businessAddress}</div>` : ''}
      ${fullUser?.phoneNumber ? `<div class="company-info">${fullUser.phoneNumber}</div>` : ''}
      <div class="company-info">${fullUser?.email}</div>
      ${fullUser?.tinNumber ? `<div class="company-info">TIN: ${fullUser.tinNumber}</div>` : ''}
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">#${invoice.serialId.toString().padStart(4, '0')}</div>
      <div class="invoice-dates">
        <div><strong>Date:</strong> ${new Date(invoice.dateIssued).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        ${invoice.dateDue ? `<div><strong>Due:</strong> ${new Date(invoice.dateDue).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>` : ''}
      </div>
      ${invoice.status === 'paid' ? '<div class="status-paid">PAID</div>' : ''}
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-to-label">Bill To</div>
    <div class="customer-name">${invoice.customerName}</div>
    ${invoice.customerEmail ? `<div class="customer-info">${invoice.customerEmail}</div>` : ''}
    ${invoice.customerAddress ? `<div class="customer-info">${invoice.customerAddress}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>₦${item.unitPrice.toLocaleString()}</td>
          <td>₦${(item.quantity * item.unitPrice).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₦${subtotal.toLocaleString()}</span>
      </div>
      <div class="total-row">
        <span>VAT (7.5%)</span>
        <span>₦${Number(invoice.vatAmount).toLocaleString()}</span>
      </div>
      <div class="total-row final">
        <span>Total</span>
        <span>₦${Number(invoice.amount).toLocaleString()}</span>
      </div>
    </div>
  </div>

  ${invoice.notes ? `
    <div class="notes">
      <div class="notes-label">Notes</div>
      <div class="notes-text">${invoice.notes}</div>
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">Vouched by <span class="footer-brand">Vouch</span> • Tax-Compliant Invoice</p>
  </div>
</body>
</html>
  `;

  // Return HTML that can be printed as PDF
  // Note: For actual PDF generation, you would use a library like puppeteer, @react-pdf/renderer, or a service like html-pdf-node
  // This returns HTML that the browser can print to PDF
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="invoice-${invoice.serialId.toString().padStart(4, '0')}.pdf"`,
    },
  });
}
