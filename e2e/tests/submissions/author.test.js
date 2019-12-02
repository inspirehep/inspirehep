const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter } = require('../../utils/form');
const routes = require('../../utils/routes');

describe('author submissions', () => {
  let context;
  let page;

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();

    await login(context);

    page = await context.newPage();
    await page.goto(routes.AUTHOR_SUBMISSION);
  });

  it('submits new author', async () => {
    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      given_name: 'Diego',
      family_name: 'Martínez Santos',
      display_name: 'Diego Martínez',
      alternate_name: 'Santos, Diego Martinez',
      status: 'retired',
      arxiv_categories: ['hep-ex', 'hep-ph'],
      emails: [{ value: 'private@martinez.ch', hidden: true }],
      positions: [
        {
          institution: 'CERN',
          start_date: '2015',
          current: true,
        },
      ],
      advisors: [
        {
          name: 'Urhan, Harun',
        },
      ],
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
      name_variants: ['Santos, Diego Martinez'],
    });
    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.arxiv_categories).toEqual(['hep-ex', 'hep-ph']);
    expect(metadata.email_addresses).toEqual([
      { value: 'private@martinez.ch', hidden: true },
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
    expect(metadata.advisors).toEqual([
      {
        curated_relation: false,
        name: 'Urhan, Harun',
      },
    ]);
  });

  it('does not submit a new author with existing orcid [authors/999108]', async () => {
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.fill({
      given_name: 'Diego',
      family_name: 'Martínez Santos',
      display_name: 'Diego Martínez',
      orcid: '0000-0002-9127-1687',
    });

    const orcidErrorElement = await formSubmitter.getErrorElementForFieldPath(
      'orcid'
    );
    const authorUpdateLink = await orcidErrorElement.$eval(
      'a',
      linkEl => linkEl.href
    );

    expect(authorUpdateLink).toEqual(`${routes.AUTHOR_SUBMISSION}/999108`);
  });
});
