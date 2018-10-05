const { routes } = require('./constants');

async function login() {
  await page.goto(routes.localLogin);
  await page.click('[data-test-id=login]');
}

async function logout() {
  await page.hover('[data-test-id=my-account-dropdown]');
  await page.waitFor('[data-test-id=logout]');
  await page.click('[data-test-id=logout]');
}

module.exports = {
  login,
  logout,
};
