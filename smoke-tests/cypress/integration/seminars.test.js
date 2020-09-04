import { onlyOn } from '@cypress/skip-test';

describe('Seminar Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars/1799778');
      cy.waitForRoute();
      cy.matchSnapshots('SeminarDetail');
    });
  });
});

describe('Seminar Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('SeminarSearch');
    });
  });
});

describe('Seminar Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/seminars');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('SeminarSubmission', { skipMobile: true });
    });

    it('matches image snapshot for Seminar update', () => {
      cy.registerRoute();
      cy.visit('/submissions/seminars/1799778');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('SeminarUpdateSubmission', { skipMobile: true });
    });
  });

  it('submits and updates new seminar', () => {
    const formData = {
      name: 'The Cool Seminar',
      timezone: 'Europe/Zurich',
      dates: ['2020-05-06 08:30 AM', '2020-05-06 02:30 PM'],
      abstract: 'This is cool',
      material_urls: [
        {
          description: 'slides',
          value: 'https://example.com/slides/',
        },
        {
          value: 'https://example.com/pdf',
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
      captioned: true,
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
      literature_records: ['1787272'],
    };

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
      material_urls: [
        {
          description: 'slides',
          value: 'https://example.com/slides/',
        },
        {
          value: 'https://example.com/pdf',
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
      captioned: true,
      end_datetime: '2020-05-06T12:30:00.000000',
      start_datetime: '2020-05-06T06:30:00.000000',
      timezone: 'Europe/Zurich',
      literature_records: [
        { record: { $ref: 'http://localhost:8000/api/literature/1787272' } },
      ],
    };

    cy.visit('/submissions/seminars');
    cy
      .testSubmission({
        collection: 'seminars',
        formData,
        expectedMetadata,
      })
      .then(newRecord => {
        const recordId = newRecord.metadata.control_number;
        cy.visit(`/submissions/seminars/${recordId}`);
        cy.testUpdateSubmission({
          collection: 'seminars',
          recordId,
          formData: {
            name: ': Updated',
          },
          expectedMetadata: {
            ...expectedMetadata,
            title: { title: 'The Cool Seminar: Updated' },
          },
        });
      });
  });

  afterEach(() => {
    cy.logout();
  });
});
