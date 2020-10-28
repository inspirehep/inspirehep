import { onlyOn } from '@cypress/skip-test';
import moment from 'moment';

describe('Job Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.clock(1688594400000);
      cy.registerRoute();
      cy.visit('/jobs');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('JobSearch');
    });
  });
});

describe('Job Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.clock(1688594400000);
      cy.registerRoute();
      cy.visit('/jobs/1812440');
      cy.waitForRoute();
      cy.matchSnapshots('JobDetail');
    });
  });
});

describe('Job Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/jobs');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('JobSubmission', { skipMobile: true });
    });

    it('matches image snapshot for Job update', () => {
      cy.registerRoute();
      cy.visit('/submissions/jobs/1812440');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('JobUpdateSubmission', { skipMobile: true });
    });
  });

  it('submits and updates new job', () => {
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

    const expectedMetadata = {
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
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
        .format('YYYY-MM-DD'),
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

    cy.visit('/submissions/jobs');
    cy
      .testSubmission({
        collection: 'jobs',
        formData,
        expectedMetadata,
      })
      .then(newRecord => {
        const recordId = newRecord.metadata.control_number;
        cy.visit(`/submissions/jobs/${recordId}`);
        cy.testUpdateSubmission({
          collection: 'jobs',
          recordId,
          formData: {
            title: '-Updated',
            status: 'closed',
          },
          expectedMetadata: {
            ...expectedMetadata,
            position: expectedMetadata.position + '-Updated',
            status: 'closed',
          },
        });
      });
  });

  afterEach(() => {
    cy.logout();
  });
});
