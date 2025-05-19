const { chromium } = require('playwright');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/get-reviewer', async (req, res) => {
  const { review_url } = req.body;

  if (!review_url) {
    return res.status(400).json({ error: 'Missing review_url' });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(review_url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.d4r55');

    const name = await page.$eval('.d4r55', el => el.textContent.trim());
    const profileUrl = await page.$eval('.d4r55 a', el => el.href).catch(() => null);

    let contributorId = null;
    if (profileUrl && profileUrl.includes('/contrib/')) {
      contributorId = profileUrl.split('/contrib/')[1];
    }

    res.json({
      reviewer: name,
      contributor_profile: profileUrl,
      contributor_id: contributorId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
