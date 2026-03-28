const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const FRAME_DIR = path.join(__dirname, 'frames');
const STUDIO_URL = 'http://localhost:3000';

// Each scene: what to do + narration text overlay
const scenes = [
  // Scene 0: Title card
  {
    name: '00-title',
    type: 'title',
    duration: 5,
    title: 'PAMlab',
    subtitle: 'Open-Source Dev Environment for Privileged Access Management',
  },
  // Scene 1: The Problem
  {
    name: '01-problem',
    type: 'title',
    duration: 6,
    title: 'The Problem',
    subtitle: 'You need to develop IAM/PAM integrations.\nBut real systems cost thousands, are locked in production,\nand take weeks to get test environments approved.',
  },
  // Scene 2: Dashboard - all services green
  {
    name: '02-dashboard',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      await page.goto(STUDIO_URL, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForSelector('h2', { timeout: 5000 });
      await sleep(2000); // Let health checks load
    },
    narration: 'Dashboard: All 6 APIs are online and healthy.',
  },
  // Scene 3: Navigate to Scenarios
  {
    name: '03-scenarios',
    type: 'browser',
    duration: 4,
    action: async (page) => {
      // Click "Scenarios" in sidebar
      const links = await page.$$('nav a, button, [role="button"]');
      for (const link of links) {
        const text = await link.evaluate(el => el.textContent);
        if (text && text.includes('Scenario')) {
          await link.click();
          break;
        }
      }
      await sleep(1000);
    },
    narration: 'Scenario Builder: 15 real-world IAM workflows ready to go.',
  },
  // Scene 4: Select Onboarding Scenario
  {
    name: '04-select-onboarding',
    type: 'browser',
    duration: 4,
    action: async (page) => {
      const select = await page.$('select');
      if (select) {
        await select.select('onboarding');
        await sleep(1000);
      }
    },
    narration: 'Let\'s run the Employee Onboarding scenario.',
  },
  // Scene 5: View Onboarding Details
  {
    name: '05-onboarding-details',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      // Scroll down to see the full scenario
      await page.evaluate(() => window.scrollBy(0, 200));
      await sleep(500);
    },
    narration: '5 steps across AD, Fudo PAM, and Matrix42 ESM.',
  },
  // Scene 6: Click Generate Script
  {
    name: '06-generate-script',
    type: 'browser',
    duration: 4,
    action: async (page) => {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.includes('Generate Script')) {
          await btn.click();
          break;
        }
      }
      await sleep(2000); // Wait for editor to load
    },
    narration: 'One click generates the full PowerShell script.',
  },
  // Scene 7: Editor with code
  {
    name: '07-editor',
    type: 'browser',
    duration: 6,
    action: async (page) => {
      await sleep(1000);
    },
    narration: 'Monaco Editor with syntax highlighting. Ready to customize.',
  },
  // Scene 8: Click Run
  {
    name: '08-run-script',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && (text.includes('Run') || text.includes('▶'))) {
          await btn.click();
          break;
        }
      }
      await sleep(3000); // Wait for execution
    },
    narration: 'Hit Run — real API calls against the mock services.',
  },
  // Scene 9: Navigate to Results
  {
    name: '09-results',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      const links = await page.$$('nav a, button, [role="button"]');
      for (const link of links) {
        const text = await link.evaluate(el => el.textContent);
        if (text && text.includes('Result')) {
          await link.click();
          break;
        }
      }
      await sleep(1000);
    },
    narration: 'Results: Every step with status codes and response data.',
  },
  // Scene 10: API Explorer
  {
    name: '10-api-explorer',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      const links = await page.$$('nav a, button, [role="button"]');
      for (const link of links) {
        const text = await link.evaluate(el => el.textContent);
        if (text && text.includes('Explorer')) {
          await link.click();
          break;
        }
      }
      await sleep(1000);
    },
    narration: 'API Explorer: Browse and test all endpoints from all 6 systems.',
  },
  // Scene 11: Try an API call
  {
    name: '11-try-api',
    type: 'browser',
    duration: 5,
    action: async (page) => {
      // Click first endpoint in the list
      const endpointBtns = await page.$$('.text-left');
      if (endpointBtns.length > 1) {
        await endpointBtns[1].click();
        await sleep(500);
        // Click Try it
        const btns = await page.$$('button');
        for (const btn of btns) {
          const text = await btn.evaluate(el => el.textContent);
          if (text && text.includes('Try it')) {
            await btn.click();
            break;
          }
        }
        await sleep(2000);
      }
    },
    narration: 'Try it: Live API response in real-time.',
  },
  // Scene 12: Event Stream
  {
    name: '12-events',
    type: 'browser',
    duration: 4,
    action: async (page) => {
      const links = await page.$$('nav a, button, [role="button"]');
      for (const link of links) {
        const text = await link.evaluate(el => el.textContent);
        if (text && text.includes('Event')) {
          await link.click();
          break;
        }
      }
      await sleep(2000);
    },
    narration: 'Event Stream: Live SSE events from all services.',
  },
  // Scene 13: Getting Started
  {
    name: '13-getting-started',
    type: 'title',
    duration: 6,
    title: 'Getting Started',
    subtitle: 'git clone https://github.com/BenediktSchackenberg/PAMlab\ndocker compose up -d\nopen http://localhost:3000\n\n⭐ Star the repo · MIT License · Contributions welcome!',
  },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  // Clean up
  if (fs.existsSync(FRAME_DIR)) fs.rmSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.log(`Scene ${i}/${scenes.length - 1}: ${scene.name}...`);

    if (scene.type === 'title') {
      // Render a title card HTML
      await page.setContent(`
        <html>
        <head><style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #0a0a0f; color: #e0e0e8; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            height: 100vh; text-align: center; padding: 60px;
          }
          h1 { font-size: 5rem; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 24px; }
          .sub { font-size: 1.4rem; color: #8888a0; max-width: 800px; line-height: 1.8; white-space: pre-line; }
          .accent { color: #4a9eff; }
          .icon { font-size: 4rem; margin-bottom: 20px; }
        </style></head>
        <body>
          ${scene.name === '00-title' ? '<div class="icon">🔐</div>' : ''}
          <h1>${scene.title}</h1>
          <p class="sub">${scene.subtitle}</p>
        </body></html>
      `, { waitUntil: 'load' });
      await sleep(500);
    } else if (scene.type === 'browser' && scene.action) {
      try {
        await scene.action(page);
      } catch (err) {
        console.log(`  Warning: ${err.message}`);
      }
    }

    // Take screenshot
    const framePath = path.join(FRAME_DIR, `${scene.name}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    const size = fs.statSync(framePath).size;
    console.log(`  ✓ ${(size / 1024).toFixed(0)}KB`);
  }

  await browser.close();
  console.log('\nAll scenes captured!');
  
  // Write ffmpeg concat file
  const concatPath = path.join(__dirname, 'concat.txt');
  let concat = '';
  for (const scene of scenes) {
    concat += `file 'frames/${scene.name}.png'\n`;
    concat += `duration ${scene.duration}\n`;
  }
  // Last frame needs to be repeated
  concat += `file 'frames/${scenes[scenes.length - 1].name}.png'\n`;
  fs.writeFileSync(concatPath, concat);
  console.log('Concat file written.');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
