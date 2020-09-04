import { onlyOn } from '@cypress/skip-test';

describe('Literature Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('LiteratureSearch');
    });
  });
});

describe('Literature Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature/1235543');
      cy.waitForRoute();
      cy.matchSnapshots('LiteratureDetail');
    });
  });
});

describe('Literature Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot for article form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('article');
      cy.matchSnapshots('ArticleSubmission', { skipMobile: true });
    });

    it('matches image snapshot for thesis form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('thesis');
      cy.matchSnapshots('ThesisSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('book');
      cy.matchSnapshots('BookSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book chapter form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('bookChapter');
      cy.matchSnapshots('BookChapterSubmission', { skipMobile: true });
    });
  });

  it('submits a new article', () => {
    const formData = {
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
      volume: 'Vol.1',
      issue: '20',
      year: '2014',
    };
    const expectedMetadata = {
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
        method: 'submitter',
        source: 'submitter',
      },
      document_type: ['article'],
      abstracts: [
        {
          source: 'submitter',
          value: 'This explains some cool stuff about a thing',
        },
      ],
      titles: [
        {
          source: 'submitter',
          title: 'Cool Article',
        },
      ],
      authors: [
        { affiliations: [{ value: 'CERN' }], full_name: 'Urhan, Harun' },
        { full_name: 'Urhan, Ahmet' },
      ],
      inspire_categories: [
        { term: 'Accelerators' },
        { term: 'Experiment-Nucl' },
      ],
      publication_info: [
        {
          journal_title: 'Cool Journal',
          journal_volume: 'Vol.1',
          journal_issue: '20',
          year: 2014,
        },
      ],
      accelerator_experiments: [{ legacy_name: 'CERN-LEP-L3' }],
    };
    const expectedWorkflow = {
      _workflow: { data_type: 'hep' },
      _extra_data: {
        formdata: {
          url: formData.pdf_link,
        },
      },
    };
    cy.visit('/submissions/literature');
    cy.selectLiteratureDocType('article');
    cy
      .testSubmission({
        collection: 'literature',
        formData,
        expectedMetadata,
      })
      .then(newWorkflow => {
        cy.wrap(newWorkflow).should('like', expectedWorkflow);
      });
  });

  it('submits a new thesis', () => {
    const formData = {
      pdf_link: 'https://uni.eu/docs/thesis.pdf',
      title: 'Cool Research',
      subjects: ['Accelerators', 'Experiment-HEP'],
      abstract: 'This contains some cool stuff about a super big thing',
      authors: [{ full_name: 'Urhan, Harun', affiliation: 'CERN' }],
      degree_type: 'phd',
      submission_date: '2018-11',
      defense_date: '2019-01-01',
      institution: 'University of Geneva',
      supervisors: [{ full_name: 'Tsanakoglu, Ioannis', affiliation: 'CERN' }],
    };
    const expectedMetadata = {
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
        method: 'submitter',
        source: 'submitter',
      },
      document_type: ['thesis'],
      abstracts: [
        {
          source: 'submitter',
          value: 'This contains some cool stuff about a super big thing',
        },
      ],
      titles: [
        {
          source: 'submitter',
          title: 'Cool Research',
        },
      ],
      authors: [
        { affiliations: [{ value: 'CERN' }], full_name: 'Urhan, Harun' },
        {
          affiliations: [{ value: 'CERN' }],
          full_name: 'Tsanakoglu, Ioannis',
          inspire_roles: ['supervisor'],
        },
      ],
      inspire_categories: [
        { term: 'Accelerators' },
        { term: 'Experiment-HEP' },
      ],
      thesis_info: {
        date: '2018-11',
        defense_date: '2019-01-01',
        degree_type: 'phd',
        institutions: [{ name: 'University of Geneva' }],
      },
    };
    const expectedWorkflow = {
      _workflow: { data_type: 'hep' },
      _extra_data: {
        formdata: {
          url: formData.pdf_link,
        },
      },
    };
    cy.visit('/submissions/literature');
    cy.selectLiteratureDocType('thesis');
    cy
      .testSubmission({
        collection: 'literature',
        formData,
        expectedMetadata,
      })
      .then(newWorkflow => {
        cy.wrap(newWorkflow).should('like', expectedWorkflow);
      });
  });

  it('submits a new book', () => {
    const formData = {
      title: 'Nostalgic Rhythms',
      subjects: ['Accelerators'],
      authors: [{ full_name: 'Paparrigopoulos, Panos' }],
      publisher: 'CERN Library',
      publication_date: '2018-06',
      publication_place: 'Geneva, Switzerland',
    };
    const expectedMetadata = {
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
        method: 'submitter',
        source: 'submitter',
      },
      document_type: ['book'],
      titles: [
        {
          source: 'submitter',
          title: 'Nostalgic Rhythms',
        },
      ],
      authors: [{ full_name: 'Paparrigopoulos, Panos' }],
      inspire_categories: [{ term: 'Accelerators' }],
      imprints: [
        {
          date: '2018-06',
          publisher: 'CERN Library',
          place: 'Geneva, Switzerland',
        },
      ],
    };
    const expectedWorkflow = {
      _workflow: { data_type: 'hep' },
    };
    cy.visit('/submissions/literature');
    cy.selectLiteratureDocType('book');
    cy
      .testSubmission({
        collection: 'literature',
        formData,
        expectedMetadata,
      })
      .then(newWorkflow => {
        cy.wrap(newWorkflow).should('like', expectedWorkflow);
      });
  });

  it('submits a new book chapter', () => {
    const formData = {
      title: 'Cool Dev Livre: Chapitre 2',
      subjects: ['Computing'],
      language: 'fr',
      authors: [{ full_name: 'Urhan, Harun' }],
      start_page: '200',
      end_page: '300',
    };
    const expectedMetadata = {
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
        method: 'submitter',
        source: 'submitter',
      },
      document_type: ['book chapter'],
      languages: ['fr'],
      titles: [
        {
          source: 'submitter',
          title: 'Cool Dev Livre: Chapitre 2',
        },
      ],
      authors: [{ full_name: 'Urhan, Harun' }],
      inspire_categories: [{ term: 'Computing' }],
      publication_info: [{ page_start: '200', page_end: '300' }],
    };
    const expectedWorkflow = {
      _workflow: { data_type: 'hep' },
    };
    cy.visit('/submissions/literature');
    cy.selectLiteratureDocType('bookChapter');
    cy
      .testSubmission({
        collection: 'literature',
        formData,
        expectedMetadata,
      })
      .then(newWorkflow => {
        cy.wrap(newWorkflow).should('like', expectedWorkflow);
      });
  });

  afterEach(() => {
    cy.logout();
  });
});
