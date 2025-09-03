const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(buf); } catch (e) { json = buf; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const r1 = await request('POST', '/api/v1/login', {});
    console.log('POST /api/v1/login', r1.status, r1.headers.deprecation, r1.headers.link);

    const r2 = await request('POST', '/api/v1/auth/login', {});
    console.log('POST /api/v1/auth/login', r2.status, r2.headers.deprecation, r2.headers.link);

    const r3 = await request('GET', '/api/v1/nonexistent', null);
    console.log('GET /api/v1/nonexistent', r3.status, typeof r3.body === 'object' ? r3.body.success : null);

    const r4 = await request('POST', '/api/v1/questions/upload', {});
    console.log('POST /api/v1/questions/upload', r4.status);
  } catch (e) {
    console.error('HTTP test error:', e.message);
    process.exit(1);
  }
})();
