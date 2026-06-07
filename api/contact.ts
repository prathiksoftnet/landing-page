import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, industry, services, budget, contactMethod, description } = req.body;

  if (!name || !email || !phone || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    company ? `Company: ${company}` : '',
    industry ? `Industry: ${industry}` : '',
    services?.length ? `Services: ${services.join(', ')}` : '',
    budget ? `Budget: ${budget}` : '',
    `Preferred Contact: ${contactMethod}`,
    '',
    'Requirements:',
    description,
  ].filter(Boolean).join('\n');

  try {
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'prathik@prathiksoftnet.com',
      replyTo: email,
      subject: `Website Inquiry from ${name}`,
      text: lines,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
