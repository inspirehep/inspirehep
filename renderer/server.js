const express = require("express");
const puppeteer = require("puppeteer");
const KeyvS3 = require("keyv-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { createCache } = require("cache-manager");
const pLimit = require("p-limit");
const app = express();
const PORT = process.env.PORT || 8080;

const keyvS3 = new KeyvS3({
  namespace: process.env.AWS_CACHE_NAMESPACE,
  s3client: new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: "cern",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});
const cache = createCache({ stores: [keyvS3], stdTTL: 60 * 60 * 24 * 7 });

let browser;
let browserStartTime = Date.now();
async function getBrowser() {
  const now = Date.now();
  if (!browser || now - browserStartTime > MAX_BROWSER_LIFETIME || !browser.isConnected()) {
    if (browser) await browser.close();
    browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    browserStartTime = now;
  }
  return browser;
}

const limit = pLimit.default(3);
const MAX_BROWSER_LIFETIME = 1000 * 60 * 1; 

app.get("/render", async (req, res) => {
  return limit(() => renderPage(req, res));
});

async function renderPage(req, res) {
  const targetUrl = req.query.url;
  const raw = req.query.raw === "true";

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).send("Missing or invalid ?url= query parameter");
  }

  const cacheKey = `${targetUrl}|${raw}`;
  const cached_result = await cache.get(cacheKey);
  if (cached_result) {
    return res.set("Content-Type", "text/html").send(cached_result);
  }

  let page;
  try {
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();

    const navResult = await Promise.race([
      page.goto(targetUrl, { waitUntil: "networkidle2" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Navigation timed out")), 20000)
      ),
    ]);

    if (raw) {
      const html = await page.content();
      await cache.set(cacheKey, html);
      return res.set("Content-Type", "text/html").send(html);
    }

    const html = await page.evaluate(() => {
      let content = "";
      if (document.doctype) {
        content = new XMLSerializer().serializeToString(document.doctype);
      }

      const doc = document.documentElement.cloneNode(true);

      const scripts = doc.querySelectorAll(
        'script:not([type="application/ld+json"])'
      );
      scripts.forEach((s) => s.parentNode.removeChild(s));

      const imports = doc.querySelectorAll("link[rel=import]");
      imports.forEach((i) => i.parentNode.removeChild(i));

      const { origin, pathname } = location;
      if (!doc.querySelector("base")) {
        const base = document.createElement("base");
        base.href = origin + pathname;
        doc.querySelector("head").appendChild(base);
      }

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

    await cache.set(cacheKey, html);
    return res.set("Content-Type", "text/html").send(html);
  } catch (err) {
    console.error("Render error:", err);
    return res.status(500).send("Rendering failed");
  } finally {
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (err) {
        if (err.message.includes("Protocol error")) {
          console.warn("Page already closed or disconnected.");
        } else {
          console.warn("Error closing page:", err);
        }
      }
    }
  }
}

app.listen(PORT, () => {
  console.log(
    `Render server running at http://localhost:${PORT}/render?url=...`
  );
});

process.on("SIGINT", async () => {
  if (browser) await browser.close();
  process.exit();
});
