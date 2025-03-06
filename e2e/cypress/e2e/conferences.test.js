import { onlyOn } from '@cypress/skip-test';
import moment from 'moment';

describe('Conference Search', () => {
  it('has search results for all conferences', () => {
    cy.registerRoute();
    cy.visit('/conferences?start_date=all');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.get('[data-testid="search-results"]')
      .children()
      .should('have.length', 7);
  });

  it('has search results for upcoming conferences', () => {
    cy.registerRoute();
    cy.visit('/conferences?start_date=upcoming');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.get('[data-testid="search-results"]')
      .children()
      .should('have.length', 1);
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/conferences?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ConferenceSearch');
    });

    it.skip('matches image snapshot for author update when cataloger is logged in', () => {
      cy.login('cataloger');
      cy.registerRoute();
      cy.visit('/conferences?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ConferenceSearchByCataloger');
      cy.logout();
    });
  });
});

describe('Conference Detail', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/conferences/1217045?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ConferenceDetail');
    });
  });
});

describe('Conference Editor', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  afterEach(() => {
    cy.logout();
  });

  it('edits a conference', () => {
    const RECORD_URL = '/conferences/1217045';
    const RECORD_API = `/api${RECORD_URL}`;
    const API = '/api/**';

    cy.registerRoute(API);

    cy.visit(`/editor/record${RECORD_URL}`);

    cy.waitForRoute(API);

    cy.registerRoute({
      url: RECORD_API,
      method: 'PUT',
    });

    cy.get('[data-path="/titles/0/title"]').type(
      'Updated by Cypress Test{enter}'
    );
    cy.contains('button', 'Save').click();

    cy.waitForRoute(RECORD_API);
    cy.waitForRoute(API);

    cy.get('h2').should('contain.text', 'Updated by Cypress');
  });
});

describe('Conference Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.visit('/submissions/conferences');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('ConferenceSubmission', { skipMobile: true });
    });
  });

  it('submits a new conference', () => {
    const startDateMoment = moment([2050, 1, 28]).add(1, 'day');
    const endDateMoment = moment([2050, 1, 28]).add(7, 'day');
    const formData = {
      name: 'Amazing conference',
      subtitle: 'The best conference ever',
      acronyms: ['AC'],
      series_name: 'Amazing conference series',
      series_number: '24',
      dates: [startDateMoment, endDateMoment],
      addresses: [
        {
          city: 'Geneva',
          country: 'Switzerland',
        },
      ],
      field_of_interest: ['Accelerators'],
      websites: ['https://home.cern'],
      contacts: [
        {
          name: 'Miguel Garcia',
          email: 'thisisnotmyemail@test.com',
        },
      ],
      description:
        'This is an amazing conference about the wonders of physics and accelerators',
      additional_info: 'This is some additional info',
      keywords: ['keyword1', 'keyword2'],
    };
    const expectedMetadata = {
      titles: [
        {
          subtitle: 'The best conference ever',
          title: 'Amazing conference',
        },
      ],
    };

    cy.visit('/submissions/conferences');
    cy.testSubmission({
      expectedMetadata: expectedMetadata.titles[0].title,
      formData,
      collection: 'conferences',
      submissionType: 'record',
    });
  });

  it('warns about already existing conference during selected dates [conferences/1794610]', () => {
    cy.visit('/submissions/conferences');
    cy.registerRoute();
    cy.fillForm({
      name: 'Please come to my conference',
      dates: ['2023-09-25', '2023-09-30'],
      addresses: [
        {
          city: 'Bern',
          country: 'Switzerland',
        },
      ],
      field_of_interest: ['Computing'],
    });
    cy.waitForRoute();
    cy.get('[data-test-id="conferences-exist-alert-number"]').should(
      'contain.text',
      '1'
    );
  });

  afterEach(() => {
    cy.logout();
  });
});
