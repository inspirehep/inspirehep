const ID_ATTRIBUTE = 'data-test-id';
const TYPE_ATTRIBUTE = 'data-test-type';

async function selectFromSelectBox(page, selectId, value) {
  const selectSelector = `[${ID_ATTRIBUTE}=${selectId}]`;
  await page.click(selectSelector);

  const openSelectSelector = `.ant-select-open>${selectSelector}`;
  await page.waitFor(openSelectSelector);

  await page.click(`[${ID_ATTRIBUTE}=${selectId}-option-${value}]`);

  await page.click('label'); // FIXME: won't work if there is no label on the page
  await page.waitFor(
    ctx => !document.querySelector(ctx.openSelectSelector),
    {},
    { openSelectSelector }
  );
}

module.exports = {
  selectFromSelectBox,
  ID_ATTRIBUTE,
  TYPE_ATTRIBUTE,
};
