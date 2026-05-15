const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Missing Download Link',
        'This download link is incomplete. Please check your email and click the full link provided.')
    };
  }

  const { data: tokenRecord, error } = await supabase
    .from('download_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !tokenRecord) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Invalid Link',
        'This download link is invalid. If you believe this is an error, please contact support@nxt9leadgen.com')
    };
  }

  if (tokenRecord.used) {
    return {
      statusCode: 410,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Link Already Used',
        'This download link has already been used. Please contact support@nxt9leadgen.com for a new link.')
    };
  }

  if (new Date() > new Date(tokenRecord.expires_at)) {
    return {
      statusCode: 410,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Link Expired',
        'This download link expired 24 hours after it was sent. Please contact support@nxt9leadgen.com for a fresh link.')
    };
  }

  const { error: updateError } = await supabase
    .from('download_tokens')
    .update({
      used: true,
      used_at: new Date().toISOString()
    })
    .eq('token', token);

  if (updateError) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: errorPage('Server Error',
        'Something went wrong. Please contact support@nxt9leadgen.com and we will send you a new link immediately.')
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: successPage(tokenRecord.email)
  };
};

function successPage(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Download Ready — Debt Lead Qualifier</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06080f; color: #e8eeff; font-family: 'JetBrains Mono', monospace; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { background: #0b0e1a; border: 1px solid #1a1f35; border-radius: 16px; padding: 48px; max-width: 480px; width: 100%; text-align: center; }
  .icon { font-size: 56px; margin-bottom: 24px; }
  h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 12px; color: #00e5a0; }
  p { font-size: 13px; color: #7a85aa; line-height: 1.7; margin-bottom: 8px; font-weight: 300; }
  .email { color: #4f7eff; font-size: 12px; }
  .btn { display: inline-block; margin-top: 32px; background: #00e5a0; color: #03120a; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; padding: 16px 40px; border-radius: 8px; text-decoration: none; letter-spacing: 0.05em; }
  .security { margin-top: 20px; padding: 14px; background: rgba(255,61,90,0.05); border: 1px solid rgba(255,61,90,0.15); border-radius: 8px; font-size: 11px; color: #ff3d5a; line-height: 1.6; }
  .note { margin-top: 24px; font-size: 11px; color: #4a5272; line-height: 1.6; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">✅</div>
  <h1>Your download is ready.</h1>
  <p>Thank you for your purchase.</p>
  <p class="email">${email}</p>
  <p style="margin-top:16px">Click below to download the Debt Lead Qualifier.</p>
  <a class="btn" href="/debtleadqualifier/app/debtleadqualifier.html" download="DebtLeadQualifier.html">⬇ Download Now</a>
  <div class="security">⚠ This link has now been used and is no longer valid.<br>Save your downloaded file — you cannot use this link again.</div>
  <p class="note">Questions? Email support@nxt9leadgen.com<br>30-day money-back guarantee.</p>
</div>
<script>
  setTimeout(() => {
    const a = document.createElement('a');
    a.href = '/debtleadqualifier/app/debtleadqualifier.html';
    a.download = 'DebtLeadQualifier.html';
    a.click();
  }, 1000);
</script>
</body>
</html>`;
}

function errorPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Debt Lead Qualifier</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06080f; color: #e8eeff; font-family: 'JetBrains Mono', monospace; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { background: #0b0e1a; border: 1px solid rgba(255,61,90,0.3); border-radius: 16px; padding: 48px; max-width: 480px; width: 100%; text-align: center; }
  .icon { font-size: 56px; margin-bottom: 24px; }
  h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #ff3d5a; }
  p { font-size: 13px; color: #7a85aa; line-height: 1.8; font-weight: 300; }
  a { color: #4f7eff; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">🔒</div>
  <h1>${title}</h1>
  <p>${message}</p>
</div>
</body>
</html>`;
}
