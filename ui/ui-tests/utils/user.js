const { routes } = require('./constants');

async function login() {
  await page.goto(routes.localLogin);
  await page.click('[data-test-id=login]');
}

module.exports = {
  login,
};
