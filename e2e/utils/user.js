const routes = require('./routes');

async function submitLoginForm(page, username, password) {
  await page.type('[data-test-id=email]', username);
  await page.type('[data-test-id=password]', password);
  await page.click('[data-test-id=login]');
  await page.waitFor(() => !document.querySelector('[data-test-id=login]'));
}

async function login(
  browerOrContext,
  username = 'admin@inspirehep.net',
  password = '123456'
) {
  const page = await browerOrContext.newPage();
  await page.goto(routes.LOCAL_LOGIN, {
    waitUntil: 'networkidle0',
  });

  await submitLoginForm(page, username, password);

  await page.close();
}

async function logout() {
  const page = await browser.newPage();
  await page.goto(routes.HOME, {
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
