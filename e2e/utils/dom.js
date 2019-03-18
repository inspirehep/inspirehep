const routes = require('./routes');

async function submitForm(page, formData) {
  const fieldNames = Object.keys(formData);
  await page.waitFor(`[name=${fieldNames[0]}]`);
  // see https://github.com/GoogleChrome/puppeteer/issues/1958 on why not `Promise.all(fieldNames.map...`
  // eslint-disable-next-line no-restricted-syntax
  for (const fieldName of fieldNames) {
    await page.type(`[name=${fieldName}]`, formData[fieldName]); // eslint-disable-line no-await-in-loop
  }
  await page.click('button[type=submit]');
}

async function waitForSubmissionSuccess(page) {
  await page.waitFor(
    SUBMISSIONS_SUCCESS => document.location.href === SUBMISSIONS_SUCCESS,
    {},
    routes.SUBMISSIONS_SUCCESS
  );
}

module.exports = {
  submitForm,
  waitForSubmissionSuccess,
};
