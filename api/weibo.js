let cached;
let cachedAt = 0;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (cached && Date.now() - cachedAt < 60000) {
    return res.status(200).json({ ...cached, fromCache: true });
  }
  try {
    const response = await fetch("https://weibo.com/ajax/side/hotSearch", {
      headers: {
        Referer: "https://weibo.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`微博返回 HTTP ${response.status}`);
    const result = await response.json();
    const list = result?.data?.realtime;
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error("微博没有返回可用的热搜数据");
    }
    const data = list.map((item, index) => {
      const title = item.word || item.word_scheme || `热搜${index + 1}`;
      const url = `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`;
      return {
        id: item.mid || item.word_scheme || `weibo-${index}`,
        title,
        desc: item.note || item.word_scheme || `#${title}#`,
        hot: Number(item.num) || 0,
        url,
        mobileUrl: url,
      };
    });
    cached = {
      code: 200,
      name: "weibo",
      title: "微博",
      type: "热搜榜",
      link: "https://s.weibo.com/top/summary/",
      total: data.length,
      fromCache: false,
      updateTime: new Date().toISOString(),
      data,
    };
    cachedAt = Date.now();
    return res.status(200).json(cached);
  } catch (error) {
    return res.status(502).json({
      code: 502,
      name: "weibo",
      message: error instanceof Error ? error.message : "微博数据获取失败",
    });
  }
}
