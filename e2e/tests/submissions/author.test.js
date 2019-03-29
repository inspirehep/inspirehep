const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter } = require('../../utils/form');
const routes = require('../../utils/routes');

describe('author submissions', () => {
  it('submits new author', async () => {
    const context = await browser.createIncognitoBrowserContext();
    await login(context);

    const page = await context.newPage();
    await page.goto(routes.AUTHOR_SUBMISSION);

    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      given_name: 'Diego',
      family_name: 'Martínez Santos',
      display_name: 'Diego Martínez',
      alternate_name: 'Nobel Prize e2e 2019',
      status: 'retired',
      arxiv_categories: ['hep-ex', 'hep-ph'],
      emails: [
        { value: 'private@martinez.ch', hidden: true },
        { value: 'public@martinez.ch' },
      ],
      positions: [{ institution: 'CERN', start_date: '2015', current: true }],
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.AUTHOR_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );
    const { metadata, _workflow } = await workflowResponse.json();

    // TODO: implement a partial object matcher to avoid multiple expects
    expect(_workflow.data_type).toEqual('authors');

    expect(metadata.name).toEqual({
      preferred_name: 'Diego Martínez',
      value: 'Martínez Santos, Diego',
      previous_names: ['Nobel Prize e2e 2019'],
    });
    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.arxiv_categories).toEqual(['hep-ex', 'hep-ph']);
    expect(metadata.email_addresses).toEqual([
      { value: 'private@martinez.ch', hidden: true },
      { value: 'public@martinez.ch' },
    ]);
    expect(metadata.status).toEqual('retired');
    expect(metadata.positions).toEqual([
      {
        curated_relation: false,
        current: true,
        institution: 'CERN',
        start_date: '2015',
      },
    ]);
  });
});
