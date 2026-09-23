const express = require("express");
const puppeteer = require("puppeteer");
const KeyvS3 = require("keyv-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { createCache } = require("cache-manager");
const pLimit = require("p-limit");
const app = express();
const PORT = process.env.PORT || 8080;
const p_limit = process.env.PLIMIT || 1;
const promMid = require('express-prometheus-middleware');

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

const MAX_BROWSER_LIFETIME = 1000 * 60 * 10;
const NAVIGATION_TIMEOUT = 20000;
const NON_HTML_PATH = /^\/assets\/|\.(js|mjs|css|map|json|xml|txt|ico|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|otf|eot|pdf|zip|gz|mp4|webm)$/i;

let current = null;
let launching = null;

async function closeBrowser(entry) {
  try {
    await entry.browser.close();
  } catch (err) {
    console.warn("Error closing browser, killing it:", err.message);
  } finally {
    const proc = entry.browser.process();
    if (proc && proc.exitCode === null && proc.signalCode === null) {
      proc.kill("SIGKILL");
    }
  }
}

function retire(entry) {
  entry.retired = true;
  if (entry.activePages === 0) closeBrowser(entry);
}

async function acquireBrowser() {
  const expired =
    current &&
    (Date.now() - current.startTime > MAX_BROWSER_LIFETIME ||
      !current.browser.connected);
  if (expired) {
    retire(current);
    current = null;
  }
  if (!current) {
    if (!launching) {
      launching = puppeteer
        .launch({
          headless: true,
          args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
        })
        .then((browser) => {
          current = { browser, startTime: Date.now(), activePages: 0 };
          return current;
        })
        .finally(() => {
          launching = null;
        });
    }
    await launching;
  }
  const entry = current;
  entry.activePages++;
  return entry;
}

function releaseBrowser(entry) {
  entry.activePages--;
  if (entry.retired && entry.activePages === 0) closeBrowser(entry);
}

const limit = pLimit.default(parseInt(p_limit));

app.use(
  promMid({
    metricsPath: "/metrics",
    collectDefaultMetrics: true,
    requestDurationBuckets: [1, 2, 3, 5, 10, 20],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  })
);

app.get("/healthz", (req, res) => {
  if (current && !current.browser.connected) {
    return res.status(503).send("browser disconnected");
  }
  return res.send("ok");
});

app.get("/render", async (req, res) => {
  return limit(() => renderPage(req, res));
});

async function renderPage(req, res) {
  const targetUrl = req.query.url;
  const raw = req.query.raw === "true";

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).send("Missing or invalid ?url= query parameter");
  }

  if (NON_HTML_PATH.test(new URL(targetUrl).pathname)) {
    return res.status(404).send("Not a renderable page");
  }

  const cacheKey = `${targetUrl}|${raw}`;
  const cached_result = await cache.get(cacheKey);
  if (cached_result) {
    return res.set("Content-Type", "text/html").send(cached_result);
  }

  let entry;
  let page;
  try {
    entry = await acquireBrowser();
    page = await entry.browser.newPage();

    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: NAVIGATION_TIMEOUT,
    });

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
    console.error(`Render error for ${targetUrl}:`, err.message);
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
    if (entry) releaseBrowser(entry);
  }
}

app.listen(PORT, () => {
  console.log(
    `Render server running at http://localhost:${PORT}/render?url=...`
  );
});

async function shutdown() {
  if (current) await closeBrowser(current);
  process.exit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
