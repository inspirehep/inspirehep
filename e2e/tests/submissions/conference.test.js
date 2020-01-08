const moment = require('moment');
const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter } = require('../../utils/form');
const routes = require('../../utils/routes');

describe('conference submissions', () => {
  let context;
  let page;

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();
    await login(context);

    page = await context.newPage();
    await page.goto(routes.CONFERENCE_SUBMISSION);
  });

  it('submits new conference', async () => {
    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);

    const startDateMoment = moment().add(1, 'day');
    const endDateMoment = moment().add(7, 'day');

    await formSubmitter.submit({
      name: 'Amazing conference',
      subtitle: 'The best conference ever',
      acronyms: ['AC'],
      series_name: 'Amazing conference series',
      series_number: '24',
      dates: [startDateMoment, endDateMoment],
      addresses: [
        {
          city: 'Geneva',
          country: 'Switzerland',
        },
      ],
      field_of_interest: ['Accelerators'],
      websites: ['https://home.cern'],
      contacts: [
        {
          name: 'Miguel Garcia',
          email: 'thisisnotmyemail@test.com',
        },
      ],
      description:
        'This is an amazing conference about the wonders of physics and accelerators',
      additional_info: 'This is some additional info',
      keywords: ['keyword1', 'keyword2'],
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.CONFERENCE_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const conferencePid = await submitResponseJson.pid_value;
    const conferenceResponse = await page.goto(
      `${routes.CONFERENCE_API}/${conferencePid}`
    );

    const expectedMetadata = {
      acronyms: ['AC'],
      addresses: [
        {
          cities: ['Geneva'],
          country: 'Switzerland',
          country_code: 'CH',
        },
      ],
      opening_date: startDateMoment.format('YYYY-MM-DD'),
      closing_date: endDateMoment.format('YYYY-MM-DD'),
      inspire_categories: [{ term: 'Accelerators' }],
      keywords: [{ value: 'keyword1' }, { value: 'keyword2' }],
      public_notes: [{ value: 'This is some additional info' }],
      series: [
        {
          name: 'Amazing conference series',
          number: 24,
        },
      ],
      short_description: {
        value:
          '<div>This is an amazing conference about the wonders of physics and accelerators</div>',
      },
      titles: [
        {
          subtitle: 'The best conference ever',
          title: 'Amazing conference',
        },
      ],
      urls: [{ value: 'https://home.cern' }],
    };

    const { metadata } = await conferenceResponse.json();

    expect(metadata).toMatchObject(expectedMetadata);

    const expectedCnum = startDateMoment.format('CYY-MM-DD');
    expect(metadata.cnum).toEqual(expect.stringContaining(expectedCnum));
  });

  it('conference already exists during selected dates', async () => {
    const formSubmitter = new FormSubmitter(page);

    await formSubmitter.fill({
      name: 'Please come to my conference',
      dates: [moment().add(20, 'day'), moment().add(24, 'day')],
      addresses: [
        {
          city: 'Stockholm',
          country: 'Sweden',
        },
      ],
      field_of_interest: ['Computing'],
    });

    const alertNumber = await page.$eval(
      '[data-test-id="conferences-exist-alert-number"]',
      alert => alert.textContent
    );

    expect(alertNumber).toEqual('1');
  });
});
