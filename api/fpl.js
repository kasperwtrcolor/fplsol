export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  // Ensure trailing slash is present if needed (FPL API requires trailing slashes on many endpoints)
  const safePath = path.endsWith('/') ? path : path + '/';
  const targetUrl = 'https://fantasy.premierleague.com/api/' + safePath;

  try {
    const fplResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!fplResponse.ok) {
      return res.status(fplResponse.status).json({ error: `FPL Proxy error: ${fplResponse.status}` });
    }

    const data = await fplResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
