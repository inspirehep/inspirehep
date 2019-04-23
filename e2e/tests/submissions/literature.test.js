/* eslint-disable camelcase */
const { ResponseInterceptor } = require('../../utils/interceptors');
const { login } = require('../../utils/user');
const { FormSubmitter } = require('../../utils/form');
const { selectFromSelectBox } = require('../../utils/dom');
const routes = require('../../utils/routes');

async function clickSkipImportToFillManually(page) {
  await page.click('[data-test-id=skip-import-button]');
}

async function selectDocumentType(page, docType) {
  await selectFromSelectBox(page, 'document-type-select', docType);
}

describe('literature submissions', () => {
  let context;
  let page;

  beforeEach(async () => {
    context = await browser.createIncognitoBrowserContext();

    await login(context);

    page = await context.newPage();
    await page.goto(routes.LITERATURE_SUBMISSION);
    await clickSkipImportToFillManually(page);
  });

  afterEach(async () => {
    await context.close();
  });

  it('submits new book chapter', async () => {
    await selectDocumentType(page, 'bookChapter');

    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      title: 'Cool Dev Livre: Chapitre 2',
      subjects: ['Computing'],
      language: 'fr',
      authors: [{ full_name: 'Urhan, Harun' }],
      start_page: '200',
      end_page: '300',
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.LITERATURE_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );

    const { metadata, _workflow } = await workflowResponse.json();

    expect(_workflow.data_type).toEqual('hep');

    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.acquisition_source.source).toEqual('submitter');
    expect(metadata.acquisition_source.submission_number).toEqual(
      `${submitResponseJson.workflow_object_id}`
    );

    expect(metadata.document_type).toEqual(['chapter']);
    expect(metadata.titles).toEqual([
      {
        source: 'submitter',
        title: 'Cool Dev Livre: Chapitre 2',
      },
    ]);
    expect(metadata.authors).toEqual([{ full_name: 'Urhan, Harun' }]);
    expect(metadata.languages).toEqual(['fr']);
    expect(metadata.inspire_categories).toEqual([{ term: 'Computing' }]);
    expect(metadata.publication_info).toEqual([
      { page_start: '200', page_end: '300' },
    ]);
  });

  it('submits new book', async () => {
    await selectDocumentType(page, 'book');

    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      title: 'Cool Book',
      subjects: ['Accelerators'],
      authors: [{ full_name: 'Urhan, Harun' }],
      publisher: 'CERN Library',
      publication_date: '2018-06',
      publication_place: 'Geneva, Switzerland',
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.LITERATURE_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );

    const { metadata, _workflow } = await workflowResponse.json();

    expect(_workflow.data_type).toEqual('hep');

    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.acquisition_source.source).toEqual('submitter');
    expect(metadata.acquisition_source.submission_number).toEqual(
      `${submitResponseJson.workflow_object_id}`
    );

    expect(metadata.document_type).toEqual(['book']);
    expect(metadata.titles).toEqual([
      {
        source: 'submitter',
        title: 'Cool Book',
      },
    ]);
    expect(metadata.authors).toEqual([{ full_name: 'Urhan, Harun' }]);
    expect(metadata.languages).toEqual(['en']);
    expect(metadata.inspire_categories).toEqual([{ term: 'Accelerators' }]);
    expect(metadata.imprints).toEqual([
      {
        date: '2018-06',
        publisher: 'CERN Library',
        place: 'Geneva, Switzerland',
      },
    ]);
  });

  it('submits new thesis', async () => {
    await selectDocumentType(page, 'thesis');

    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      pdf_link: 'https://uni.eu/docs/thesis.pdf',
      title: 'Cool Research',
      subjects: ['Accelerators', 'Experiment-HEP'],
      abstract: 'This contains some cool stuff about a super big thing',
      authors: [{ full_name: 'Urhan, Harun', affiliation: 'CERN' }],
      degree_type: 'phd',
      submission_date: '2018-11',
      defense_date: '2019-01-01',
      institution: 'University of Geneva',
      supervisors: [{ full_name: 'Tsanakoglu, Haruli', affiliation: 'CERN' }],
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.LITERATURE_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );

    const { metadata, _workflow, _extra_data } = await workflowResponse.json();

    expect(_workflow.data_type).toEqual('hep');

    expect(_extra_data.formdata.url).toEqual('https://uni.eu/docs/thesis.pdf');

    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.acquisition_source.source).toEqual('submitter');
    expect(metadata.acquisition_source.submission_number).toEqual(
      `${submitResponseJson.workflow_object_id}`
    );

    expect(metadata.document_type).toEqual(['thesis']);
    expect(metadata.abstracts).toEqual([
      {
        source: 'submitter',
        value: 'This contains some cool stuff about a super big thing',
      },
    ]);
    expect(metadata.titles).toEqual([
      {
        source: 'submitter',
        title: 'Cool Research',
      },
    ]);
    expect(metadata.authors).toEqual([
      { affiliations: [{ value: 'CERN' }], full_name: 'Urhan, Harun' },
      {
        affiliations: [{ value: 'CERN' }],
        full_name: 'Tsanakoglu, Haruli',
        inspire_roles: ['supervisor'],
      },
    ]);
    expect(metadata.languages).toEqual(['en']);
    expect(metadata.inspire_categories).toEqual([
      { term: 'Accelerators' },
      { term: 'Experiment-HEP' },
    ]);
    expect(metadata.thesis_info).toEqual({
      date: '2018-11',
      defense_date: '2019-01-01',
      degree_type: 'phd',
      institutions: [{ name: 'University of Geneva' }],
    });
  });

  it('submits new article', async () => {
    await selectDocumentType(page, 'article');

    const interceptor = new ResponseInterceptor(page);
    const formSubmitter = new FormSubmitter(page);
    await formSubmitter.submit({
      pdf_link: 'https://journal.eu/papers/cool.pdf',
      title: 'Cool Article',
      subjects: ['Accelerators', 'Experiment-Nucl'],
      abstract: 'This explains some cool stuff about a thing',
      authors: [
        { full_name: 'Urhan, Harun', affiliation: 'CERN' },
        { full_name: 'Urhan, Ahmet' },
      ],
      experiment: 'CERN-LEP-L3',
      journal_title: 'Cool Journal',
    });

    await formSubmitter.waitForSubmissionSuccess();

    const submitResponse = interceptor.getFirstResponseByUrl(
      routes.LITERATURE_SUBMISSION_API
    );
    const submitResponseJson = await submitResponse.json();
    const workflowResponse = await page.goto(
      `${routes.HOLDINGPEN_API}/${submitResponseJson.workflow_object_id}`
    );

    const { metadata, _workflow, _extra_data } = await workflowResponse.json();

    expect(_workflow.data_type).toEqual('hep');

    expect(_extra_data.formdata.url).toEqual(
      'https://journal.eu/papers/cool.pdf'
    );

    expect(metadata.acquisition_source.email).toEqual('admin@inspirehep.net');
    expect(metadata.acquisition_source.method).toEqual('submitter');
    expect(metadata.acquisition_source.source).toEqual('submitter');
    expect(metadata.acquisition_source.submission_number).toEqual(
      `${submitResponseJson.workflow_object_id}`
    );

    expect(metadata.document_type).toEqual(['article']);
    expect(metadata.abstracts).toEqual([
      {
        source: 'submitter',
        value: 'This explains some cool stuff about a thing',
      },
    ]);
    expect(metadata.titles).toEqual([
      {
        source: 'submitter',
        title: 'Cool Article',
      },
    ]);
    expect(metadata.authors).toEqual([
      { affiliations: [{ value: 'CERN' }], full_name: 'Urhan, Harun' },
      { full_name: 'Urhan, Ahmet' },
    ]);
    expect(metadata.languages).toEqual(['en']);
    expect(metadata.inspire_categories).toEqual([
      { term: 'Accelerators' },
      { term: 'Experiment-Nucl' },
    ]);
    expect(metadata.public_notes).toEqual([
      { value: 'Submitted to Cool Journal' },
    ]);
    expect(metadata.accelerator_experiments).toEqual([
      { legacy_name: 'CERN-LEP-L3' },
    ]);
  });
});
