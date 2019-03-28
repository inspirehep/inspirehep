const ID_ATTRIBUTE = 'data-test-id';
const TYPE_ATTRIBUTE = 'data-test-type';

async function selectFromSelectBox(page, selectId, value) {
  await page.click(`[${ID_ATTRIBUTE}=${selectId}]`);
  await page.click(`[${ID_ATTRIBUTE}=${selectId}-option-${value}]`);
  await page.click('body');
  await page.waitFor('.ant-select-dropdown-hidden');
}

module.exports = {
  selectFromSelectBox,
  ID_ATTRIBUTE,
  TYPE_ATTRIBUTE,
};
