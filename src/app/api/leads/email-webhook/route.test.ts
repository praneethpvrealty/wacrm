import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parsePortalLead,
  extractHousingUrls,
  resolvePhoneNumberFromUrl,
  resolveHousingPhone,
  decodeQuotedPrintable,
  decodeMimeSubject,
  parseMimeEmail
} from './route';

describe('Email Webhook Lead Parsing', () => {
  describe('parsePortalLead', () => {
    it('should parse Magicbricks emails correctly', () => {
      const subject = 'Buyer has contacted you on Magicbricks for - Commercial Showroom';
      const body = `
        Dear Praneeth,
        A user is interested in your Property.
        Details of Contact Made:
        Name: S (Individual)
        Mobile: 9738622542
        Email: shreyasrvce@gmail.com
        Requirement: Commercial Showroom in Indiranagar
      `;
      const res = parsePortalLead(subject, body, '');
      expect(res.source).toBe('Magic Bricks');
      expect(res.name).toBe('S (Individual)');
      expect(res.phone).toBe('9738622542');
      expect(res.email).toBe('shreyasrvce@gmail.com');
      expect(res.requirementText).toBe('Commercial Showroom in Indiranagar');
    });

    it('should parse 99acres emails correctly', () => {
      const subject = 'Property Advertisement Response';
      const body = `
        Dear PRANEETH KUMAR,
        You have received a response on 99acres.
        Details of the response:
        Name: Pavan
        Mobile: +91-9700364876
        Email: srivirinchi.kadiyala@gmail.com
        Requirements: 4 BHK Villa in HSR
      `;
      const res = parsePortalLead(subject, body, '');
      expect(res.source).toBe('99acres');
      expect(res.name).toBe('Pavan');
      expect(res.phone).toBe('+91-9700364876');
      expect(res.email).toBe('srivirinchi.kadiyala@gmail.com');
      expect(res.requirementText).toBe('4 BHK Villa in HSR');
    });

    it('should parse Housing.com emails with plain fallback', () => {
      const subject = 'Housing - Lead interested in your property';
      const body = `
        Name: Sreeramkrishna Krishna
        Phone: +91-9988776655
        Email: sreeram@example.com
      `;
      const res = parsePortalLead(subject, body, '');
      expect(res.source).toBe('Housing');
      expect(res.name).toBe('Sreeramkrishna Krishna');
      expect(res.phone).toBe('+91-9988776655');
      expect(res.email).toBe('sreeram@example.com');
    });
  });

  describe('extractHousingUrls', () => {
    it('should parse mailto, whatsapp and call now links from email HTML', () => {
      const html = `
        <div style="font-family: Arial;">
          <p>We have received a contact request:</p>
          <a href="mailto:sreeram@gmail.com?subject=Inquiry">Send Email</a>
          <a href="https://housing.com/leads/whatsapp?lead_id=12345">Chat On WhatsApp</a>
          <a href="https://housing.com/leads/call?lead_id=12345">Call Now</a>
        </div>
      `;
      const res = extractHousingUrls(html);
      expect(res.mailtoEmail).toBe('sreeram@gmail.com');
      expect(res.whatsappUrl).toBe('https://housing.com/leads/whatsapp?lead_id=12345');
      expect(res.callNowUrl).toBe('https://housing.com/leads/call?lead_id=12345');
    });
  });

  describe('resolvePhoneNumberFromUrl', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should extract phone number directly if present in the URL', async () => {
      const url = 'https://api.whatsapp.com/send?phone=919876543210&text=hello';
      const res = await resolvePhoneNumberFromUrl(url);
      expect(res).toBe('919876543210');
    });

    it('should follow redirect headers manually to extract number', async () => {
      const mockFetch = vi.fn().mockImplementation((url) => {
        if (url === 'https://housing.com/leads/whatsapp?lead_id=12345') {
          return Promise.resolve({
            status: 302,
            headers: new Headers({
              location: 'https://api.whatsapp.com/send?phone=919900112233'
            })
          });
        }
        return Promise.reject(new Error('Unknown url'));
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await resolvePhoneNumberFromUrl('https://housing.com/leads/whatsapp?lead_id=12345');
      expect(res).toBe('919900112233');
    });
  });

  describe('resolveHousingPhone', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should resolve phone number from whatsapp redirect in HTML', async () => {
      const html = `<a href="https://housing.com/rd?id=555">Chat On WhatsApp</a>`;
      const mockFetch = vi.fn().mockResolvedValue({
        status: 302,
        headers: new Headers({
          location: 'https://api.whatsapp.com/send?phone=918887776665'
        })
      });
      vi.stubGlobal('fetch', mockFetch);

      const phone = await resolveHousingPhone(html, '');
      expect(phone).toBe('918887776665');
    });
  });

  describe('MIME & QP Decoders', () => {
    it('should decode MIME UTF-8 Q-encoded subject headers', () => {
      const input = '=?UTF-8?Q?=28Gmail_Forwarding_confirmation_=E2=80=93_Receive_mail_from?=';
      const decoded = decodeMimeSubject(input);
      expect(decoded).toContain('Gmail Forwarding confirmation');
    });

    it('should decode Quoted-Printable body text with soft breaks', () => {
      const input = 'Confirmation code: =\r\n12345678\r\nTo confirm, click: https://mail.google.com/mail/f-=3D12345';
      const decoded = decodeQuotedPrintable(input);
      expect(decoded).toBe('Confirmation code: 12345678\r\nTo confirm, click: https://mail.google.com/mail/f-=12345');
    });
  });

  describe('99acres Fallback Parsing', () => {
    it('should parse 99acres email in block format without labels', () => {
      const subject = 'Fwd: Property Advertisement Response on 99acres';
      const body = `
        Details of the response
        Pavan
        srivirinchi.kadiyala@gmail.com
        +91-9700364876 (Verified)
      `;
      const res = parsePortalLead(subject, body, '');
      expect(res.source).toBe('99acres');
      expect(res.name).toBe('Pavan');
      expect(res.phone).toBe('+91-9700364876');
      expect(res.email).toBe('srivirinchi.kadiyala@gmail.com');
    });
  });

  describe('parseMimeEmail', () => {
    it('should parse raw multipart MIME emails with boundary', () => {
      const rawEmail = `
Received: from mail.example.com
Content-Type: multipart/alternative; boundary="boundary-123"
Subject: =?UTF-8?Q?Test_Subject?=

--boundary-123
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

Hello plain text.

--boundary-123
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

<h1>Hello HTML</h1>

--boundary-123--
      `.trim();
      
      const parsed = parseMimeEmail(rawEmail);
      expect(parsed.text.trim()).toBe('Hello plain text.');
      expect(parsed.html.trim()).toBe('<h1>Hello HTML</h1>');
    });
  });
});
