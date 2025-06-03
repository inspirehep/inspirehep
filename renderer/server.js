const express = require("express");
const puppeteer = require("puppeteer");
const KeyvS3 = require('keyv-s3')
const { S3Client } = require("@aws-sdk/client-s3");
const { createCache } = require("cache-manager")
const app = express();
const PORT = process.env.PORT || 8080;
let browser;

const keyvS3 = new KeyvS3({
  namespace: process.env.AWS_CACHE_NAMESPACE,
  s3client: new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: "cern",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })
})

const cache = createCache({stores: [keyvS3], stdTTL: 60 * 60 * 24 * 7});

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args:['--no-sandbox --disable-gpu']
    });
  }
  return browser;
}

app.get("/render", async (req, res) => {
  const targetUrl = req.query.url;
  const raw = req.query.raw === "true";

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).send("Missing or invalid ?url= query parameter");
  }

  const cacheKey = `${targetUrl}|${raw}`;
  cached_result = await cache.get(cacheKey);
  if (cached_result) {
    return res.set("Content-Type", "text/html").send(cached_result);
  }

  try {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const html = raw
      ? await page.content()
      : await page.evaluate(() => {
          let content = "";
          if (document.doctype) {
            content = new XMLSerializer().serializeToString(document.doctype);
          }

          const doc = document.documentElement.cloneNode(true);

          // Strip all non-JSON-LD scripts
          const scripts = doc.querySelectorAll(
            'script:not([type="application/ld+json"])'
          );
          scripts.forEach((s) => s.parentNode.removeChild(s));

          // Remove HTML imports
          const imports = doc.querySelectorAll("link[rel=import]");
          imports.forEach((i) => i.parentNode.removeChild(i));

          // Add <base> tag for relative URLs
          const { origin, pathname } = location;
          if (!doc.querySelector("base")) {
            const base = document.createElement("base");
            base.href = origin + pathname;
            doc.querySelector("head").appendChild(base);
          }

          // Fix relative URLs
          const absEls = doc.querySelectorAll(
            'link[href^="/"], script[src^="/"], img[src^="/"]'
          );
          absEls.forEach((el) => {
            const href = el.getAttribute("href");
            const src = el.getAttribute("src");
            if (src && /^\/[^/]/i.test(src)) el.src = origin + src;
            else if (href && /^\/[^/]/i.test(href)) el.href = origin + href;
          });

          content += doc.outerHTML;
          return content.replace(/<!--[\s\S]*?-->/g, "");
        });

    await page.close();
    cache.set(cacheKey, html);

    res.set("Content-Type", "text/html").send(html);
  } catch (err) {
    console.error("Render error:", err);
    res.status(500).send("Rendering failed");
  }
});

app.get("/healthz", async (_, res) => {
  try {
    const instance = await getBrowser();
    if (instance && instance.isConnected()) {
      return res.status(200).send("OK");
    }
    throw new Error("Browser not connected");
  } catch (err) {
    return res.status(500).send("Unhealthy");
  }
});

app.listen(PORT, () => {
  console.log(
    `Render server running at http://localhost:${PORT}/render?url=...`
  );
});

process.on("SIGINT", async () => {
  if (browser) await browser.close();
  process.exit();
});
