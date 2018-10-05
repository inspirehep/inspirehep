const { routes } = require('./constants');

async function login() {
  await page.goto(routes.localLogin);
  await page.click('[data-test-id=login]');
}

async function logout() {
  const page = await browser.newPage();
  await page.goto(routes.public.home);
  await page.hover('[data-test-id=my-account-dropdown]');
  await page.waitFor('[data-test-id=logout]');
  await page.click('[data-test-id=logout]');
  await page.waitFor(() => !document.querySelector('[data-test-id=logout]'));
  await page.close();
}

module.exports = {
  login,
  logout,
};
