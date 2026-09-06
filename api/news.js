export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    // Fetch from BBC Sport Football and Sky Sports Premier League feeds concurrently
    const [bbcRes, skyRes] = await Promise.allSettled([
      fetch("https://feeds.bbci.co.uk/sport/football/rss.xml", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FPLStock/1.0)" }
      }).then(r => r.text()),
      fetch("https://www.skysports.com/rss/12040", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FPLStock/1.0)" }
      }).then(r => r.text())
    ]);

    const articles = [];

    // Helper to parse XML items
    const parseRssItems = (xmlText, sourceName) => {
      if (!xmlText) return [];
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemContent = match[1];

        // Extract Title
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                           itemContent.match(/<title>(.*?)<\/title>/);
        const rawTitle = titleMatch ? titleMatch[1].trim() : "";

        // Extract Description / Summary
        const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                          itemContent.match(/<description>(.*?)<\/description>/);
        let rawDesc = descMatch ? descMatch[1].trim() : "";
        rawDesc = rawDesc.replace(/<[^>]*>?/gm, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

        // Extract Link
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/) ||
                          itemContent.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/);
        const link = linkMatch ? linkMatch[1].trim() : "#";

        // Extract PubDate
        const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
        const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

        if (rawTitle && !rawTitle.toLowerCase().includes("listen:") && !rawTitle.toLowerCase().includes("bbc sport app")) {
          items.push({
            id: Buffer.from(rawTitle).toString("base64").slice(0, 16),
            title: rawTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
            summary: rawDesc.length > 140 ? rawDesc.slice(0, 137) + "..." : rawDesc,
            link,
            pubDate,
            source: sourceName
          });
        }
      }
      return items;
    };

    if (bbcRes.status === "fulfilled") {
      const bbcItems = parseRssItems(bbcRes.value, "BBC Sport");
      articles.push(...bbcItems.slice(0, 6));
    }

    if (skyRes.status === "fulfilled") {
      const skyItems = parseRssItems(skyRes.value, "Sky Sports");
      articles.push(...skyItems.slice(0, 6));
    }

    // Sort newest first
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Return deduplicated top 10 articles
    const seen = new Set();
    const finalArticles = articles.filter(a => {
      const norm = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    }).slice(0, 8);

    return res.status(200).json({
      success: true,
      count: finalArticles.length,
      timestamp: new Date().toISOString(),
      articles: finalArticles
    });
  } catch (error) {
    console.error("Error in /api/news:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      articles: []
    });
  }
}
