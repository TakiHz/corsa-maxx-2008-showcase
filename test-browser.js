const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = 3456;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  const errors = [];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      console.error('Page error:', err.message);
      errors.push(err.message);
    });

    console.log('Navigating to website...');
    await page.goto(`http://localhost:${PORT}`);

    console.log('Waiting for preloader to finish...');
    await page.waitForSelector('#preloader.loaded', { timeout: 15000 });
    console.log('Preloader completed! Frames successfully loaded.');

    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, 'test_hero_take1.png') });
    console.log('Screenshot 1 (Take 1) saved.');

    // Click Take 2 (Zoom)
    console.log('Clicking Take 2 button...');
    await page.click('#btn-take-2');
    await page.waitForTimeout(1800); // Allow smooth scrub transition
    await page.screenshot({ path: path.join(__dirname, 'test_take2_zoom.png') });
    console.log('Screenshot 2 (Take 2 Zoom) saved.');

    // Click Take 3 (Traseira)
    console.log('Clicking Take 3 button...');
    await page.click('#btn-take-3');
    await page.waitForTimeout(1800); // Allow smooth scrub transition
    await page.screenshot({ path: path.join(__dirname, 'test_take3_rear.png') });
    console.log('Screenshot 3 (Take 3 Rear) saved.');

    // Test Video Modal
    console.log('Opening Video Modal...');
    await page.click('#open-video-btn');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, 'test_video_modal.png') });
    console.log('Screenshot modal saved.');
    await page.click('#close-video-btn');
    await page.waitForTimeout(400);

    // Scroll to Specs
    await page.evaluate(() => {
      document.getElementById('especificacoes').scrollIntoView();
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(__dirname, 'test_specs_section.png') });
    console.log('Screenshot 4 (Specs) saved.');

    await browser.close();
    console.log('Browser test complete! Console errors count:', errors.length);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
