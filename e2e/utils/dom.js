const ID_ATTRIBUTE = 'data-test-id';
const TYPE_ATTRIBUTE = 'data-test-type';

async function selectFromSelectBox(page, selectId, value) {
  const selectSelector = `[${ID_ATTRIBUTE}=${selectId}]`;
  const selectOptionSelector = `[${ID_ATTRIBUTE}=${selectId}-option-${value}]`;

  // click selecbox to render options into DOM incase not there
  await page.click(selectSelector);
  await page.waitFor(selectOptionSelector);

  // close it because puppeteer sometimes clicks on other option accidentally
  await page.keyboard.press('Escape');

  // click via DOM, because puppeteer can't click display: none elements
  await page.$eval(selectOptionSelector, optionEl => optionEl.click());
}

module.exports = {
  selectFromSelectBox,
  ID_ATTRIBUTE,
  TYPE_ATTRIBUTE,
};
