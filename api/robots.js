export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).send("User-agent: *\nAllow: /weibo\nAllow: /bilibili\nAllow: /zhihu\nAllow: /douyin\nDisallow: /\n");
}
