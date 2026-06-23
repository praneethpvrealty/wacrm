const { decodeQuotedPrintable, decodeMimeSubject, parseMimeEmail } = require('../src/app/api/leads/email-webhook/route');

// Simulated raw MIME email for verification
const rawMime = `Delivered-To: lead-sync-4f1247de-269c-47c2-8974-36ef8f77f77d@leads.convoreal.com
Received: by 2002:a05:620a:2514:b0:45b:57ab:4eb9 with SMTP id c20csp1148117qkn;
        Tue, 23 Jun 2026 03:33:01 -0700 (PDT)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=gmail.com; s=20230601; t=1782183517; x=1782190717;
        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject:date:message-id:reply-to;
        bh=abc=;
        b=def=
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20230601; t=1782183517; x=1782190717;
        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject:date:message-id:reply-to;
        bh=abc=;
        b=def=
From: pransss@gmail.com
Date: Tue, 23 Jun 2026 03:33:01 -0700
Subject: Gmail Forwarding Confirmation - Receive Mail from pransss@gmail.com
To: lead-sync-4f1247de-269c-47c2-8974-36ef8f77f77d@leads.convoreal.com
Content-Type: multipart/alternative; boundary="000000000000305fcd061b8fbf4c"

--000000000000305fcd061b8fbf4c
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

pransss@gmail.com has requested to automatically forward mail to your email
address lead-sync-4f1247de-269c-47c2-8974-36ef8f77f77d@leads.convoreal.com.

To allow pransss@gmail.com to automatically forward mail to your address,
please click the link below to confirm the request:

https://mail.google.com/mail/vf-%5BANGjdJ-EGaYKDQQNNSB-6FFdao2JK_7jU-f-Q6Ni=
MfFBjBj8cL37TFe4DHAQrDw6T3PcRjNLV6RgcBsODw8H2Qz5jd6Kmm4xMyyEUnOXgk-m-0HIItz=
92t4e04bQJj-GqlvppNbU5Y65FeQ0W5O9%5D-ZnXVqpvzHSd67mdjE1yZG18KMdc

If you click the link and it appears to be broken, please copy and paste it
into a new browser window.

Thanks for using Gmail.

--000000000000305fcd061b8fbf4c
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div style="font-family: Arial;">
<p>pransss@gmail.com has requested to automatically forward mail to your email address lead-sync-4f1247de-269c-47c2-8974-36ef8f77f77d@leads.convoreal.com.</p>
<p>To allow pransss@gmail.com to automatically forward mail to your address, please click the link below to confirm the request:</p>
<p><a href="https://mail.google.com/mail/vf-%5BANGjdJ-EGaYKDQQNNSB-6FFdao2JK_7jU-f-Q6NiMfFBjBj8cL37TFe4DHAQrDw6T3PcRjNLV6RgcBsODw8H2Qz5jd6Kmm4xMyyEUnOXgk-m-0HIItz92t4e04bQJj-GqlvppNbU5Y65FeQ0W5O9%5D-ZnXVqpvzHSd67mdjE1yZG18KMdc">https://mail.google.com/mail/vf-%5BANGjdJ-EGaYKDQQNNSB-6FFdao2JK_7jU-f-Q6NiMfFBjBj8cL37TFe4DHAQrDw6T3PcRjNLV6RgcBsODw8H2Qz5jd6Kmm4xMyyEUnOXgk-m-0HIItz92t4e04bQJj-GqlvppNbU5Y65FeQ0W5O9%5D-ZnXVqpvzHSd67mdjE1yZG18KMdc</a></p>
<p>If you click the link and it appears to be broken, please copy and paste it into a new browser window.</p>
<p>Thanks for using Gmail.</p>
</div>

--000000000000305fcd061b8fbf4c--
`;

function testParse() {
  const rawText = rawMime;
  const isMimeEmail = /Content-Type:/i.test(rawText) || /MIME-Version:/i.test(rawText) || /Received:/i.test(rawText);
  
  console.log('isMimeEmail:', isMimeEmail);
  
  let subject = '';
  let sender = '';
  let htmlContent = '';
  let bodyText = '';

  if (isMimeEmail) {
    const parsedMime = parseMimeEmail(rawText);
    htmlContent = parsedMime.html;
    bodyText = parsedMime.text || parsedMime.html;
    
    // Extract subject from MIME headers
    // OLD regex:
    const oldSubjectMatch = rawText.match(/Subject:\s*([^\r\n]+)/i);
    const oldFromMatch = rawText.match(/From:\s*([^\r\n]+)/i);
    
    console.log('OLD Subject Match:', oldSubjectMatch ? oldSubjectMatch[1] : null);
    console.log('OLD From Match:', oldFromMatch ? oldFromMatch[1] : null);

    // NEW regex:
    const newSubjectMatch = rawText.match(/^Subject:\s*([^\r\n]+)/im);
    const newFromMatch = rawText.match(/^From:\s*([^\r\n]+)/im);
    
    console.log('NEW Subject Match:', newSubjectMatch ? newSubjectMatch[1] : null);
    console.log('NEW From Match:', newFromMatch ? newFromMatch[1] : null);
    
    subject = newSubjectMatch ? newSubjectMatch[1].trim() : '';
    sender = newFromMatch ? newFromMatch[1].trim() : '';
  }

  console.log('--- Decoded bodyText ---');
  console.log(bodyText);

  // Link parser
  const linkRegex = /https:\/\/mail\.google\.com\/mail\/v?f-[^\s"'>]+/i;
  const linkMatch = bodyText.match(linkRegex);
  console.log('Parsed Link:', linkMatch ? linkMatch[0] : null);
}

testParse();
