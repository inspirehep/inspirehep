const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { submitForm, waitForSubmissionSuccess } = require('../../utils/dom');
const routes = require('../../utils/routes');

describe('author submissions', () => {
  it('submits new author', async () => {
    const context = await browser.createIncognitoBrowserContext();
    await login(context);

    const page = await context.newPage();
    await page.goto(routes.AUTHOR_SUBMISSION);

    const interceptor = new ResponseInterceptor(page);

    await submitForm(page, {
      given_name: 'Diego',
      family_name: 'Martínez Santos',
      display_name: 'Diego Martínez',
    });
    await waitForSubmissionSuccess(page);

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.AUTHOR_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );
    const workflowJson = await workflowResponse.json();

    // TODO: implement a partial object matcher to avoid multiple expects
    expect(workflowJson.metadata.name).toEqual({
      preferred_name: 'Diego Martínez',
      value: 'Martínez Santos, Diego',
    });
    expect(workflowJson.metadata.acquisition_source.email).toEqual(
      'admin@inspirehep.net'
    );
    expect(workflowJson.metadata.acquisition_source.method).toEqual(
      'submitter'
    );

    expect(workflowJson._workflow.data_type).toEqual('authors');
  });
});
