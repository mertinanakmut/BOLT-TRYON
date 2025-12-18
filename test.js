// test.js
const fetch = require('node-fetch');

async function testApp() {
  console.log('Testing credits API...');
  const creditsRes = await fetch('http://localhost:3000/api/credits');
  console.log('Credits status:', creditsRes.status);
  
  console.log('Testing tryon API...');
  const tryonRes = await fetch('http://localhost:3000/api/tryon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
  });
  console.log('Tryon status:', tryonRes.status);
}
testApp();
