const { routes } = require('../../utils/constants');
const { login, logout } = require('../../utils/user');
const { createPollyInstance } = require('../../utils/polly');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

async function selectDocType(page, docType) {
  await page.click('[data-test-id=skip-import-button]');

  const docTypeSelectSelector = '[data-test-id=document-type-select]';
  const docTypeSelectOptionSelector = `[data-test-id=document-type-select-option-${docType}]`;
  // open select dropdown to render options into DOM
  await page.click(docTypeSelectSelector);
  await page.waitFor(docTypeSelectOptionSelector);

  // close it because puppeteer sometimes clicks on other option accidentally
  // and we need it closed for the screenshots
  await page.click(docTypeSelectSelector);
  await page.waitFor('.ant-select-dropdown-hidden');

  // click via DOM, because puppeteer can't click display: none elements
  await page.$eval(docTypeSelectOptionSelector, optionEl => optionEl.click());
}

describe('Literature Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for article submission form', async () => {
    const polly = await createPollyInstance('ArticleSubmission');

    await page.goto(routes.private.literatureSubmission, {
      waitUntil: 'networkidle0',
    });

    await selectDocType(page, 'article');

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.0006,
      failureThresholdType: 'percent',
    });

    await polly.stop();
  });

  it('matches screenshot for thesis submission form', async () => {
    const polly = await createPollyInstance('ThesisSubmission');

    await page.goto(routes.private.literatureSubmission, {
      waitUntil: 'networkidle0',
    });

    await selectDocType(page, 'thesis');

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  it('matches screenshot for book submission form', async () => {
    const polly = await createPollyInstance('BookSubmission');

    await page.goto(routes.private.literatureSubmission, {
      waitUntil: 'networkidle0',
    });

    await selectDocType(page, 'book');

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  it('matches screenshot for book chapter submission form', async () => {
    const polly = await createPollyInstance('BookChapterSubmission');

    await page.goto(routes.private.literatureSubmission, {
      waitUntil: 'networkidle0',
    });

    await selectDocType(page, 'bookChapter');

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});
