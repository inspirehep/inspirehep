import { onlyOn, skipOn } from '@cypress/skip-test';
import moment from 'moment';

describe('Seminar Search', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('SeminarSearch');
    });
  });
});

describe('Seminar Detail', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars/1799778');
      cy.waitForRoute();
      cy.matchSnapshots('SeminarDetail');
    });
  });
});

describe('Seminar Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.visit('/submissions/seminars');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('SeminarSubmission', { skipMobile: true });
    });

    it.skip('matches image snapshot for Seminar update', () => {
      cy.registerRoute();
      cy.visit('/submissions/seminars/1799778');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('SeminarUpdateSubmission', { skipMobile: true });
    });
  });

  skipOn('electron', () => {
    it('submits a new seminar', () => {
      const startDateMoment = moment('2020-05-06 08:30');
      const endDateMoment = moment('2020-05-06 14:30');
      const formData = {
        name: 'The Cool Seminar',
        timezone: 'Europe/Zurich',
        dates: [startDateMoment, endDateMoment],
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
  
      cy.visit('/submissions/seminars');
      cy.testSubmission({
        expectedMetadata: 'The Cool Seminar',
        formData,
        collection: 'seminars',
        submissionType: 'record',
      });
    });
  
    it('updates a seminar', () => {
      const expectedMetadata = {
        title: {
          title: 'Primordial Black Holes, Gravitational Waves & Werewolves',
        },
      };
  
      cy.visit('/submissions/seminars/1811750');
      cy.testUpdateSubmission({
        collection: 'seminars',
        recordId: 1811750,
        formData: {
          name: ': Updated',
        },
        expectedMetadata: {
          title: { title: expectedMetadata.title.title + ': Updated' },
        },
      });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
