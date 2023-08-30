import { onlyOn } from '@cypress/skip-test';

describe('Author Detail', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors/1274753?ui-citation-summary=true');
      cy.waitForLoading();
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorDetail');
    });
  });
});

describe('Author Search', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorSearch');
    });
  });
  it('link to update own profile leads to submissions', () => {
    cy.login('johnellis');
    const recordId = 1010819;
    const expectedUrl = `/submissions/authors/${recordId}`;
    cy.registerRoute();
    cy.visit(`/authors?q=control_number:${recordId}`);
    cy.waitForRoute();
    cy.contains('a', 'edit').should('have.attr', 'href', expectedUrl);
  });
});

describe('Author Submission', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.login('cataloger');
      cy.visit('/submissions/authors');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('AuthorSubmission', { skipMobile: true });
    });

    it.skip('matches image snapshot for author update when cataloger is logged in', () => {
      cy.login('cataloger');
      cy.registerRoute();
      cy.visit('/submissions/authors/1274753');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('AuthorUpdateSubmission', { skipMobile: true });
    });

    it.skip('matches image snapshot for user own author profile update', () => {
      cy.login('johnellis');
      cy.registerRoute();
      cy.visit('/submissions/authors/1010819');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('AuthorUpdateSubmissionByOwner', { skipMobile: true });
    });
  });

  it('submits a new author', () => {
    cy.login('cataloger');

    const formData = {
      given_name: 'Diego',
      family_name: 'Martínez Santos',
      display_name: 'Diego Martínez',
      alternate_name: 'Santos, Diego Martinez',
      status: 'retired',
      arxiv_categories: ['hep-ex', 'hep-ph'],
      emails: [
        { value: 'diego@martinez.ch', current: true },
        { value: 'private@martinez.ch', hidden: true },
      ],
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
    };

    cy.visit('/submissions/authors');
    cy.testSubmission({
      formData,
      collection: 'authors',
      submissionType: 'workflow',
    });
  });

  it('does not submit a new author with existing orcid [authors/1078577]', () => {
    cy.login('cataloger');
    cy.visit('/submissions/authors');
    cy.registerRoute();
    cy.fillForm({
      given_name: 'Matthias',
      family_name: 'Wolf',
      display_name: 'Matthias Wolf',
      orcid: '0000-0002-6997-6330',
    });
    cy.getField('orcid').blur();
    cy.waitForRoute();
    cy.getFieldError('orcid')
      .find('a')
      .should('have.attr', 'href', '/submissions/authors/1078577');
  });

  it('updates its own author profile', () => {
    const recordId = 1010819;
    const expectedMetadata = {
      name: {
        value: 'John Richard Ellis',
      },
    };

    cy.login('johnellis');
    cy.visit(`/submissions/authors/${recordId}`);
    cy.testUpdateSubmission({
      collection: 'authors',
      recordId,
      formData: {
        display_name: ': Updated',
      },
      expectedMetadata: {
        name: {
          value: 'Ellis, John Richard',
          name_variants: [ 'Ellis, Jonathan Richard' ],
          preferred_name: expectedMetadata.name.value + ': Updated',
        },
      },
    });
  });

  it('does not show update form if user is not the owner of the author record', () => {
    cy.login('johnellis');
    cy.registerRoute();
    cy.visit('/submissions/authors/1274753');
    cy.waitForRoute();
    cy.contains('You are not allowed to edit').should('be.visible');
  });

  afterEach(() => {
    cy.logout();
  });
});
