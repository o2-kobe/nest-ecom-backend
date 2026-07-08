import { Inject, Injectable } from '@nestjs/common';
import { RESEND_CLIENT } from './provider/resend.provider';
import { Resend } from 'resend';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class EmailService {
  constructor(@Inject(RESEND_CLIENT) private readonly resend: Resend) {}

  async sendMail(to: string, subject: string, message: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject,
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f7fa; padding: 40px 0;">
        <tr>
          <td align="center" valign="top">
            
            <!-- Main Container (600px standard email width) -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              
              <!-- Header Section (Deep Blue) -->
              <tr>
                <td align="center" valign="top" style="background-color: #031B4E; padding: 40px 40px 30px 40px; border-bottom: 4px solid #C9A054;">
                  <!-- Logo Placeholder (Shopping Bag) -->
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="border: 2px solid #C9A054; border-radius: 4px; padding: 6px 10px; color: #C9A054; font-family: 'Georgia', serif; font-weight: bold; font-size: 18px; letter-spacing: 1px;">
                        LK
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Brand Name -->
                  <h1 style="margin: 15px 0 5px 0; font-family: 'Georgia', serif; font-size: 32px; color: #ffffff; font-weight: normal; letter-spacing: 1px;">LK-Stores</h1>
                  
                  <!-- Tagline -->
                  <p style="margin: 0; font-size: 11px; color: #ffffff; opacity: 0.8; letter-spacing: 3px; text-transform: uppercase;">Quality. Style. Value.</p>
                </td>
              </tr>
              
              <!-- Body Content Card -->
              <tr>
                <td align="center" valign="top" style="padding: 40px 40px 30px 40px;">
                  
                  <!-- Top Decorative Diamond -->
                  <div style="color: #C9A054; font-size: 14px; margin-bottom: 10px;">✦</div>
                  
                  <!-- Greeting Header -->
                  <h2 style="margin: 0; font-family: 'Georgia', serif; font-size: 38px; color: #031B4E; font-weight: bold;">Hello!</h2>
                  
                  <!-- Gold Accent Line -->
                  <table border="0" cellpadding="0" cellspacing="0" width="60" style="margin: 15px 0 25px 0;">
                    <tr>
                      <td height="3" style="background-color: #C9A054; line-height: 3px; font-size: 3px;">&nbsp;</td>
                    </tr>
                  </table>
                  
                  <!-- Ornate Divider -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" valign="middle">
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;" />
                      </td>
                      <td width="40" align="center" style="color: #C9A054; font-size: 12px; font-family: Arial, sans-serif;">&nbsp;✦&nbsp;</td>
                      <td align="center" valign="middle">
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;" />
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Dynamic Message Area -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                    <tr>
                      <td align="left" style="font-size: 16px; color: #4A5568; line-height: 1.6; font-family: Arial, sans-serif;">
                        ${message}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Bottom Decorative Diamond -->
                  <div style="color: #C9A054; font-size: 14px; margin-bottom: 30px;">✦</div>
                  
                  <!-- Thank You Callout Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F7FC; border-radius: 12px; padding: 25px;">
                    <tr>
                      <!-- Callout Icon -->
                      <td width="60" valign="top" align="left">
                        <table border="0" cellpadding="0" cellspacing="0" width="46" height="46" style="background-color: #031B4E; border-radius: 50%;">
                          <tr>
                            <td align="center" valign="middle" style="color: #C9A054; font-size: 20px;">
                              🛍️
                            </td>
                          </tr>
                        </table>
                      </td>
                      <!-- Callout Text -->
                      <td valign="top" align="left" style="font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 6px 0; font-size: 16px; color: #031B4E; font-weight: bold;">Thank you for being with LK-Stores.</h4>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #4A5568; line-height: 1.4;">We are committed to bringing you the best products and an exceptional shopping experience.</p>
                        <p style="margin: 0; font-size: 14px; color: #031B4E; font-weight: bold;">– The LK-Stores Team</p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table> <!-- End Main Container -->
            
            <!-- Footer Section -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="margin-top: 30px;">
              <tr>
                <td align="center" valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #718096;">
                  <p style="margin: 0 0 15px 0;">Stay connected with us</p>
                  
                  <!-- Social Links -->
                  <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                    <tr>
                      <td align="center" width="40">
                        <a href="#" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; background-color: #031B4E; color: #ffffff; border-radius: 50%; text-decoration: none; font-size: 14px; font-weight: bold;">f</a>
                      </td>
                      <td align="center" width="40">
                        <a href="#" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; background-color: #031B4E; color: #ffffff; border-radius: 50%; text-decoration: none; font-size: 14px; font-weight: bold;">i</a>
                      </td>
                      <td align="center" width="40">
                        <a href="#" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; background-color: #031B4E; color: #ffffff; border-radius: 50%; text-decoration: none; font-size: 12px;">✉</a>
                      </td>
                    </tr>
                  </table>
                  
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0 0 20px 0;" />
                  
                  <!-- Dynamic Footer Meta Text -->
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #a0aec0;">&copy; \${new Date().getFullYear()} LK-Stores. All rights reserved.</p>
                  <p style="margin: 0; font-size: 12px; color: #a0aec0;">This email was sent to \${to}</p>
                </td>
              </tr>
            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
    });

    if (error) {
      throw new Error(`Resend error: ${error?.message}`);
    }

    return data;
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to LK-Stores!';

    const message = `
      <p>Hi <strong>${name}</strong>,</p>

      <p>
        Thank you for creating an account with <strong>LK-Stores</strong>.
        We're delighted to have you join our community.
      </p>

      <p>
        Your account has been successfully created. You can now browse our
        products, manage your cart, and place orders with ease.
      </p>

      <p>
        We hope you enjoy shopping with us!
      </p>
    `;

    return this.sendMail(to, subject, message);
  }

  async sendOrderConfirmationEmail(order: Order) {
    const subject = `Order Confirmation - ${order.orderCode}`;

    const message = `
  <p style="margin: 0 0 18px 0;">
    Hi <strong>${order.user.firstName}</strong>,
  </p>

  <p style="margin: 0 0 18px 0;">
    Thank you for shopping with <strong>LK-Stores</strong>! We're pleased to let you know that we've successfully received your order.
  </p>

  <table
    width="100%"
    cellpadding="12"
    cellspacing="0"
    style="
      border:1px solid #e2e8f0;
      border-radius:8px;
      margin:24px 0;
      border-collapse:collapse;
      background:#f8fafc;
    "
  >
    <tr>
      <td style="font-weight:bold; width:40%;">Order Number</td>
      <td>${order.orderCode}</td>
    </tr>

    <tr>
      <td style="font-weight:bold;">Order Date</td>
      <td>${order.createdAt.toLocaleDateString()}</td>
    </tr>

    <tr>
      <td style="font-weight:bold;">Delivery Address</td>
      <td>
        ${order.address.street},
        ${order.address.city},
        ${order.address.country}
      </td>
    </tr>

    <tr>
      <td style="font-weight:bold;">Total Amount</td>
      <td><strong>GH₵ ${order.totalAmount.toFixed(2)}</strong></td>
    </tr>
  </table>

  <h3 style="color:#031B4E; margin-bottom:12px;">
    Order Summary
  </h3>

  <table
    width="100%"
    cellpadding="10"
    cellspacing="0"
    style="border-collapse:collapse;"
  >
    <thead>
      <tr style="background:#031B4E; color:white;">
        <th align="left">Product</th>
        <th align="center">Qty</th>
        <th align="right">Price</th>
      </tr>
    </thead>

    <tbody>
      ${order.items
        .map(
          (item) => `
            <tr>
              <td style="border-bottom:1px solid #e2e8f0;">
                ${item.product.name}
              </td>

              <td
                align="center"
                style="border-bottom:1px solid #e2e8f0;"
              >
                ${item.quantity}
              </td>

              <td
                align="right"
                style="border-bottom:1px solid #e2e8f0;"
              >
                GH₵ ${Number(item.price).toFixed(2)}
              </td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  </table>

  <p style="margin-top:28px;">
    Your invoice has been attached to this email as a PDF for your records.
  </p>

  <p>
    Our team will begin processing your order shortly. We'll notify you again once your order has been prepared and is ready for shipment or collection.
  </p>

  <p>
    If you have any questions regarding your order, feel free to contact our support team—we're always happy to help.
  </p>

  <p style="margin-top:30px;">
    Thank you once again for choosing <strong>LK-Stores</strong>. We appreciate your business and look forward to serving you again.
  </p>
`;

    return this.sendMail(order.user.email, subject, message);
  }
}
