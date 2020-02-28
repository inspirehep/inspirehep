const moment = require('moment');
const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter, DATE_FORMAT } = require('../../utils/form');
const routes = require('../../utils/routes');

describe('job submissions', () => {
  let context;
  let page;

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();
    await login(context);

    page = await context.newPage();
    await page.goto(routes.JOB_SUBMISSION);
  });

  it('submits and updates a job', async () => {
    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      title: 'Software developer',
      external_job_identifier: '07587',
      institutions: [{ value: 'CERN' }, { value: 'Berkley' }],
      regions: ['Europe', 'Asia'],
      field_of_interest: ['cond-mat', 'astro-ph'],
      ranks: ['POSTDOC', 'MASTER'],
      experiments: [{ legacy_name: 'Atlas' }, { legacy_name: 'CMS' }],
      url: 'https://someinfo.com',
      deadline_date: moment().add(1, 'day'),
      contacts: [
        {
          name: 'John Doe',
          email: 'john@yahoo.com',
        },
        {
          name: 'Jane Doe',
          email: 'jane@yahoo.com',
        },
      ],
      reference_letters: [
        'references@yahoo.com',
        'https://uploadReferences.com',
      ],
      description: 'This is my description',
    });
    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.JOB_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const jobPid = await submitResponseJson.pid_value;
    const jobResponse = await page.goto(`${routes.JOB_API}/${jobPid}`);

    const expectedMetadata = {
      acquisition_source: {
        email: 'admin@inspirehep.net',
        method: 'submitter',
      },
      status: 'pending',
      position: 'Software developer',
      external_job_identifier: '07587',
      institutions: [{ value: 'CERN' }, { value: 'Berkley' }],
      regions: ['Europe', 'Asia'],
      arxiv_categories: ['cond-mat', 'astro-ph'],
      ranks: ['POSTDOC', 'MASTER'],
      accelerator_experiments: [{ name: 'Atlas' }, { name: 'CMS' }],
      urls: [{ value: 'https://someinfo.com' }],
      deadline_date: moment()
        .add(1, 'day')
        .format(DATE_FORMAT),
      contact_details: [
        {
          name: 'John Doe',
          email: 'john@yahoo.com',
        },
        {
          name: 'Jane Doe',
          email: 'jane@yahoo.com',
        },
      ],
      reference_letters: {
        emails: ['references@yahoo.com'],
        urls: [{ value: 'https://uploadReferences.com' }],
      },
      description: '<div>This is my description</div>',
    };
    const { metadata } = await jobResponse.json();

    expect(metadata).toMatchObject(expectedMetadata);

    // Update job

    await page.goto(`${routes.JOB_SUBMISSION}/${jobPid}`);
    await formSubmitter.submit({
      title: '-Updated',
      status: 'closed',
    });
    const updatedJobResponse = await page.goto(`${routes.JOB_API}/${jobPid}`);
    const expectedUpdatedMetadata = {
      ...expectedMetadata,
      status: 'closed',
      position: 'Software developer-Updated',
    };
    const { metadata: updatedMetadata } = await updatedJobResponse.json();
    expect(updatedMetadata).toMatchObject(expectedUpdatedMetadata);
  });
});
