import moment from 'moment';

describe('Job Search', () => {
  it('matches snapshot', () => {
    cy.clock(1688594400000);
    cy.registerRoute();
    cy.visit('/jobs');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.matchSnapshot();
  });
});

describe('Job Detail', () => {
  it('matches snapshot', () => {
    cy.clock(1688594400000);
    cy.registerRoute();
    cy.visit('/jobs/1812440');
    cy.waitForRoute();
    cy.matchSnapshot();
  });
});

describe('Job Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  it('matches snapshot', () => {
    cy.visit('/submissions/jobs');
    cy.get('form').should('be.visible');
    cy.matchSnapshot();
  });

  it('matches snapshot for Job update', () => {
    cy.registerRoute();
    cy.visit('/submissions/jobs/1812440');
    cy.waitForRoute();
    cy.get('form').should('be.visible');
    cy.matchSnapshot();
  });

  it('submits and new job', () => {
    const formData = {
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
    };

    cy.visit('/submissions/jobs');
    cy.testSubmission({
      formData,
      collection: 'jobs',
      submissionType: 'workflow',
    });
  });

  it('updates new job', () => {
    const expectedMetadata = {
      position: 'Cherenkov Telescope Array',
    };

    cy.visit('/submissions/jobs/1813119');
    cy.testUpdateSubmission({
      collection: 'jobs',
      recordId: 1813119,
      formData: {
        title: ': Updated',
      },
      expectedMetadata: {
        position: expectedMetadata.position + ': Updated',
      },
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
