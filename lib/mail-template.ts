function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

/** Render the stored plain-text message too, so queued mail gets the same design. */
export function renderMailHtml(mail: {
  key: string;
  subject: string;
  text: string;
}) {
  const invitation = mail.key.startsWith('invite:');
  const paragraphs = mail.text.trim().split(/\r?\n\s*\r?\n/);
  if (paragraphs.at(-1) === 'Secret Santa') paragraphs.pop();
  const content = paragraphs
    .map((paragraph) => {
      // Only a standalone web URL becomes a button; all user content is escaped.
      if (/^https?:\/\/[^\s]+$/i.test(paragraph)) {
        const url = escapeHtml(paragraph);
        const label = invitation
          ? 'Odkryj swoje losowanie'
          : 'Przeczytaj list do Mikołaja';
        return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;width:100%"><tr><td align="center" bgcolor="#be363c" style="border-radius:12px"><a href="${url}" style="display:block;padding:18px 20px;border:1px solid #be363c;border-radius:12px;background:#be363c;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;text-align:center;mso-padding-alt:18px 20px">${label} &rarr;</a></td></tr></table><p style="margin:0 0 24px;color:#78716c;font-size:12px;line-height:1.7">Jeśli przycisk nie działa, otwórz ten link:<br><a href="${url}" style="color:#997039;word-break:break-all;overflow-wrap:anywhere">${url}</a></p>`;
      }
      return `<p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#57534e">${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`;
    })
    .join('\n');
  const heading = invitation
    ? 'Mały sekret.<br>Wielka radość.'
    : 'Świąteczne życzenia<br>już na Ciebie czekają.';
  return `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(mail.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#faf7f4;font-family:Arial,Helvetica,sans-serif;color:#292524;-webkit-text-size-adjust:100%">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escapeHtml(mail.subject)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#faf7f4"><tr><td align="center" style="padding:32px 12px">
<!--[if mso]><table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px">
<tr><td align="center" style="padding:0 0 24px;color:#be363c;font-size:15px;font-weight:bold;letter-spacing:3px">SECRET SANTA</td></tr>
<tr><td bgcolor="#ffffff" style="border:1px solid #e7e5e4;border-radius:20px;overflow:hidden">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td align="center" bgcolor="#fceeed" style="padding:32px 24px;border-radius:20px 20px 0 0"><div style="font-size:36px;line-height:1.4" aria-hidden="true">${invitation ? '🎁' : '✉️'}</div><p style="margin:12px 0;color:#997039;font-size:11px;font-weight:bold;letter-spacing:2px">${invitation ? 'CZAS NA ŚWIĄTECZNĄ MAGIĘ' : 'INSPIRACJA NA IDEALNY PREZENT'}</p><h1 style="margin:0;color:#292524;font-family:Georgia,serif;font-size:32px;font-weight:normal;line-height:1.25">${heading}</h1></td></tr>
<tr><td style="padding:32px 24px 12px">${content}</td></tr>
</table></td></tr>
<tr><td align="center" style="padding:24px 16px;color:#78716c;font-size:12px;line-height:1.8">Od Ciebie zaczyna się czyjaś świąteczna radość.<br><span style="color:#997039">Secret Santa &middot; Zachowaj magię w sekrecie.</span></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}
