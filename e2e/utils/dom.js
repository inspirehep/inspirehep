const ID_ATTRIBUTE = 'data-test-id';
const TYPE_ATTRIBUTE = 'data-test-type';

async function selectFromSelectBox(page, selectId, value) {
  const selectSelector = `[${ID_ATTRIBUTE}="${selectId}"]`;
  const selectOptionSelector = `[${ID_ATTRIBUTE}="${selectId}-option-${value}"]`;
  const optionSearchSelector = `${selectSelector} input`;

  // type optio to selecbox to make sure it is rendered into DOM
  await page.type(optionSearchSelector, value);
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
