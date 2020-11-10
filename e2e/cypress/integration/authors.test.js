import { onlyOn } from '@cypress/skip-test';

describe('Author Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors/1274753?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorDetail');
    });
  });
});

describe('Author Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorSearch');
    });
  });
});

describe('Author Submission', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.login('cataloger');
      cy.visit('/submissions/authors');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('AuthorSubmission', { skipMobile: true });
    });

    it('matches image snapshot for author update when cataloger is logged in', () => {
      cy.login('cataloger');
      cy.registerRoute();
      cy.visit('/submissions/authors/1274753');
      cy.waitForRoute();
      cy.get('form').should('be.visible');
      cy.matchSnapshots('AuthorUpdateSubmission', { skipMobile: true });
    });

    it('matches image snapshot for user own author profile update', () => {
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
    };
    const expectedMetadata = {
      name: {
        preferred_name: 'Diego Martínez',
        value: 'Martínez Santos, Diego',
        name_variants: ['Santos, Diego Martinez'],
      },
      acquisition_source: {
        email: 'cataloger@inspirehep.net',
        method: 'submitter',
      },
      arxiv_categories: ['hep-ex', 'hep-ph'],
      email_addresses: [{ value: 'private@martinez.ch', hidden: true }],
      status: 'retired',
      positions: [
        {
          curated_relation: false,
          current: true,
          institution: 'CERN',
          start_date: '2015',
        },
      ],
      advisors: [
        {
          curated_relation: false,
          name: 'Urhan, Harun',
        },
      ],
    };
    const expectedWorkflow = {
      _workflow: { data_type: 'authors' },
    };
    cy.visit('/submissions/authors');
    cy
      .testSubmission({
        collection: 'authors',
        formData,
        expectedMetadata,
      })
      .then(newWorkflow => {
        cy.wrap(newWorkflow).should('like', expectedWorkflow);
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
    cy
      .getFieldError('orcid')
      .within(() => {
        return cy.get('a');
      })
      .should('have.attr', 'href', '/submissions/authors/1078577');
  });

  it('updates its own author profile', () => {
    cy.login('johnellis');
    const recordId = 1010819;
    cy.visit(`/submissions/authors/${recordId}`);
    cy.testUpdateSubmission({
      collection: 'authors',
      recordId,
      formData: {
        display_name: ': Updated',
      },
      expectedMetadata: {
        name: { preferred_name: 'John Richard Ellis: Updated' },
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
