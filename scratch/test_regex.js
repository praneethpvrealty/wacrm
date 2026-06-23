const bodyText = `pransss@gmail.com has requested to automatically forward mail to your email

address lead-sync-4f1247de-269c-47c2-8974-36ef8f77f77d@leads.convoreal.com.



To allow pransss@gmail.com to automatically forward mail to your address,

please click the link below to confirm the request:



https://mail.google.com/mail/vf-%5BANGjdJ-EGaYKDQQNNSB-6FFdao2JK_7jU-f-Q6NiMfFBjBj8cL37TFe4DHAQrDw6T3PcRjNLV6RgcBsODw8H2Qz5jd6Kmm4xMyyEUnOXgk-m-0HIItz92t4e04bQJj-GqlvppNbU5Y65FeQ0W5O9%5D-ZnXVqpvzHSd67mdjE1yZG18KMdc



If you click the link and it appears to be broken, please copy and paste it

into a new browser window.



Thanks for using Gmail.`;

const linkRegex = /https:\/\/mail\.google\.com\/mail\/v?f-[^\s"'>]+/i;
const linkMatch = bodyText.match(linkRegex);

console.log('linkMatch:', linkMatch ? linkMatch[0] : null);
