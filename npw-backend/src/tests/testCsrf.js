const API = 'http://localhost:5000';

async function run() {
  // Create session cookie by logging in
  let res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nexus.com', password: 'admin123' }),
    redirect: 'manual'
  });
  const cookie = res.headers.get('set-cookie');
  console.log('Set-Cookie:', cookie);

  // Try to POST product without CSRF token (should 403)
  res = await fetch(`${API}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name: 'NoCSRF', category: 'Accessory', shortDescription: 'test', description: 'test', price: 1, stock: 1, imageUrls: [], specs: [] })
  });
  console.log('POST without CSRF status:', res.status);

  // Fetch CSRF token
  res = await fetch(`${API}/api/csrf-token`, { headers: { 'Cookie': cookie } });
  const csrfSetCookie = res.headers.get('set-cookie');
  const tokenJson = await res.json();
  const { csrfToken } = tokenJson;
  console.log('got csrf token:', csrfToken ? 'yes' : 'no');

  // Now POST with CSRF token
  // include both the auth cookie and the csrf cookie returned from the previous response
  const combinedCookies = [cookie, csrfSetCookie].filter(Boolean).join('; ');
  res = await fetch(`${API}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': combinedCookies, 'X-CSRF-Token': csrfToken },
    body: JSON.stringify({ name: 'WithCSRF', category: 'Accessory', shortDescription: 'test', description: 'test', price: 1, stock: 1, imageUrls: [], specs: [] })
  });
  console.log('POST with CSRF status:', res.status);
  const body = await res.text();
  console.log('Response body:', body);
}

run().catch(e => console.error(e));
