const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter } = require('../../utils/form');
const routes = require('../../utils/routes');

describe('seminar submissions', () => {
  let context;
  let page;

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();
    await login(context);

    page = await context.newPage();
    await page.goto(routes.SEMINAR_SUBMISSION);
  });

  it('submits and updates a seminar', async () => {
    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      name: 'The Cool Seminar',
      timezone: 'Europe/Zurich',
      dates: ['2020-05-06 08:30 AM', '2020-05-06 02:30 PM'],
      abstract: 'This is cool',
      join_urls: [
        {
          description: 'primary',
          value: 'https://example.com/join/1',
        },
        {
          value: 'https://example.com/join/2',
        },
      ],
      speakers: [
        {
          name: 'Urhan, Ahmet',
        },
        {
          name: 'Urhan, Harun',
          affiliation: 'CERN',
        },
      ],
      address: {
        city: 'Geneva',
        country: 'Switzerland',
      },
      contacts: [
        {
          email: 'contact@example.com',
          name: 'Contact',
        },
      ],
      field_of_interest: ['Accelerators', 'Math and Math Physics'],
      series_name: 'A seminar serie',
      series_number: '1',
      additional_info: 'A public note',
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.SEMINAR_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const seminarId = await submitResponseJson.pid_value;
    const seminarResponse = await page.goto(
      `${routes.SEMINAR_API}/${seminarId}`
    );

    const expectedMetadata = {
      title: { title: 'The Cool Seminar' },
      abstract: {
        value: '<div>This is cool</div>',
      },
      public_notes: [
        {
          value: 'A public note',
        },
      ],
      series: [
        {
          name: 'A seminar serie',
          number: 1,
        },
      ],
      contact_details: [
        {
          email: 'contact@example.com',
          name: 'Contact',
        },
      ],
      inspire_categories: [
        {
          term: 'Accelerators',
        },
        {
          term: 'Math and Math Physics',
        },
      ],
      address: {
        cities: ['Geneva'],
        country_code: 'CH',
      },
      speakers: [
        {
          name: 'Urhan, Ahmet',
        },
        {
          name: 'Urhan, Harun',
          affiliations: [
            {
              value: 'CERN',
            },
          ],
        },
      ],
      join_urls: [
        {
          description: 'primary',
          value: 'https://example.com/join/1',
        },
        {
          value: 'https://example.com/join/2',
        },
      ],
      end_datetime: '2020-05-06T16:30:00.000000',
      start_datetime: '2020-05-06T10:30:00.000000',
      timezone: 'Europe/Zurich',
    };
    const { metadata } = await seminarResponse.json();

    expect(metadata).toMatchObject(expectedMetadata);

    await page.goto(`${routes.SEMINAR_SUBMISSION}/${seminarId}`);
    await formSubmitter.submit({
      name: ': Updated',
    });
    await page.waitFor(5000);
    await formSubmitter.waitForSubmissionSuccess();

    const updatedseminarResponse = await page.goto(
      `${routes.SEMINAR_API}/${seminarId}`
    );
    const expectedUpdatedMetadata = {
      ...expectedMetadata,
      title: { title: 'The Cool Seminar: Updated' },
    };
    const { metadata: updatedMetadata } = await updatedseminarResponse.json();
    expect(updatedMetadata).toMatchObject(expectedUpdatedMetadata);
  });
});
