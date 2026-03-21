export default async function handler(req, res) {
  const { path } = req.query;
  const fplUrl = 'https://fantasy.premierleague.com/api/' + (path || 'bootstrap-static/');
  try {
    const fplRes = await fetch(fplUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    if (!fplRes.ok) {
      return res.status(fplRes.status).json({ error: 'FPL API error: ' + fplRes.statusText });
    }
    const data = await fplRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
