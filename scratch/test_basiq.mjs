

const key = 'Yjk4YzIzZDItYTY5My00ODEyLTkwNzgtYmI5NmIzMWFiOGY3OmRiNjBjODk3LTM2ZjItNDgxYi1iM2RlLWUwM2FmOTUwNzAzNg==';

async function testBasiq() {
  console.log("Testing Basiq Auth...");
  try {
    const response = await fetch('https://au-api.basiq.io/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'basiq-version': '3.0'
      },
      body: 'scope=SERVER_ACCESS'
    });

    const data = await response.json();
    if (response.ok) {
      console.log("SUCCESS! Token received:", data.access_token.substring(0, 10) + "...");
    } else {
      console.error("FAILED:", data);
    }
  } catch (err) {
    console.error("ERROR:", err);
  }
}

testBasiq();
