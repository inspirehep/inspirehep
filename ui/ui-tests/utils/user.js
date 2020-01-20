const { routes } = require('./constants');
const { createPollyInstance } = require('./polly');

async function login() {
  const page = await browser.newPage();

  const polly = await createPollyInstance('Login', page);

  await page.goto(routes.localLogin, {
    waitUntil: 'networkidle0',
  });

  await page.type('[data-test-id=email]', 'admin@inspirehep.net');
  await page.type('[data-test-id=password]', '123456');
  await page.click('[data-test-id=login]');
  await page.waitFor(() => !document.querySelector('[data-test-id=login]'));

  await polly.stop();
  await page.close();
}

async function logout() {
  const page = await browser.newPage();

  await page.goto(routes.public.home, {
    waitUntil: 'networkidle0',
  });
  await page.evaluate(() => {
    document.querySelector('[data-test-id=logout]').click();
  });
  await page.waitFor(() => !document.querySelector('[data-test-id=logout]'));

  await page.close();
}

module.exports = {
  login,
  logout,
};
