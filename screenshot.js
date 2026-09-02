const { firefox } = require('playwright');
const path = require('path');
const { exec } = require('child_process');

(async () => {
  // Start python server
  const server = exec('python3 -m http.server 8080');
  
  // Wait a second for server to start
  await new Promise(r => setTimeout(r, 1000));

  const browser = await firefox.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:8080/index.html');
  
  // Wait for 3D to render
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'firefox_screenshot.png' });

  await browser.close();
  server.kill();
})();
