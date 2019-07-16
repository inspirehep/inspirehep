async function mockPageDateForNextNavigation(page, fakeDate) {
  const fakeTime = new Date(fakeDate).getTime();
  await page.evaluateOnNewDocument(time => {
    Date.now = () => time;
  }, fakeTime);
}

module.exports = {
  mockPageDateForNextNavigation,
};
