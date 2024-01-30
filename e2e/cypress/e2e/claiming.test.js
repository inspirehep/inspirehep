describe('Author collection', () => {
  it('displays disabled claim button with appropriate tooltip when user is not logged in', () => {
    cy.visit('/authors/1274753');
    cy.waitForLoading();

    cy.get('[data-test-id="btn-claiming-login"]').should('be.visible');
  });

  it("displays disabled claim button with appropriate tooltip when user doesn't have author profile", () => {
    cy.login();
    cy.visit('/authors/1274753');
    cy.waitForLoading();

    cy.get('[data-test-id="btn-claiming-profile"]').should('be.visible');
  });

  context('Author view', () => {
    beforeEach(() => {
      cy.login('johnellis');
    });

    describe("Claiming from author's own profile", () => {
      it('assigns paper to user profile successfully', () => {
        cy.intercept('POST', '/api/assign/literature/assign', {
          statusCode: 200,
          body: {
            message: 'Success',
          },
        }).as('getAssignSuccess');

        cy.visit('/authors/1010819');
        cy.waitForLoading();

        cy.get('[data-test-id="literature-result-item"]')
          .first()
          .find('[data-test-id="btn-claim"]')
          .trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignSuccess');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          '1 selected paper will be claimed to your profile.'
        );
      });

      it('removes paper from user profile successfully', () => {
        cy.intercept('POST', '/api/assign/literature/unassign', {
          statusCode: 200,
          body: {
            stub_author_id: 1787301,
          },
        }).as('getUnassignSuccess');

        cy.visit('/authors/1010819');
        cy.waitForLoading();

        cy.get('[data-test-id="literature-result-item"]')
          .first()
          .find('[data-test-id="btn-claim"]')
          .trigger('mouseover');
        cy.get('[data-test-id="unassign"]').click();

        cy.wait('@getUnassignSuccess');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          '1 selected paper will be removed from your profile.'
        );
      });

      it('shows error message when failed to remove paper', () => {
        cy.intercept('POST', '/api/assign/literature/assign', {
          statusCode: 500,
        }).as('getAssignFailure');

        cy.visit('/authors/1010819');
        cy.waitForLoading();

        cy.get('[data-test-id="literature-result-item"]')
          .first()
          .find('[data-test-id="btn-claim"]')
          .trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignFailure');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          'Claim Error!'
        );
        cy.get('.ant-notification-notice-description').should(
          'have.text',
          'Something went wrong.'
        );
      });
    });

    describe('Claiming from different profile', () => {
      it('creates claiming ticket successfully', () => {
        cy.intercept(
          'POST',
          '/api/assign/literature/assign-different-profile',
          {
            statusCode: 200,
            body: {
              created_rt_ticket: true,
            },
          }
        ).as('getAssignSuccess');

        cy.visit('/authors/1274753');
        cy.waitForLoading();

        cy.get('[data-test-id="literature-result-item"]')
          .first()
          .find('[data-test-id="btn-claim"]')
          .trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignSuccess');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          'Some claims will be reviewed by our staff for approval.'
        );
      });

      it('shows error message when failed to move paper', () => {
        cy.intercept(
          'POST',
          '/api/assign/literature/assign-different-profile',
          { statusCode: 500 }
        ).as('getAssignFailure');

        cy.visit('/authors/1274753');
        cy.waitForLoading();

        cy.get('[data-test-id="literature-result-item"]')
          .first()
          .find('[data-test-id="btn-claim"]')
          .trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignFailure');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          'Claim Error!'
        );
        cy.get('.ant-notification-notice-description').should(
          'have.text',
          'Something went wrong.'
        );
      });

      it('assigns multiple papers', () => {
        cy.intercept(
          'POST',
          '/api/assign/literature/assign-different-profile',
          {
            statusCode: 200,
            body: {
              created_rt_ticket: true,
            },
          }
        ).as('getAssignSuccess');

        cy.visit('/authors/1274753');
        cy.waitForLoading();

        cy.get('[data-test-id="select-all-publications"]').check();
        cy.get('[data-test-id="claim-multiple"]').trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignSuccess');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          'Some claims will be reviewed by our staff for approval.'
        );
      });

      it('shows error message when failed to move paper', () => {
        cy.intercept(
          'POST',
          '/api/assign/literature/assign-different-profile',
          {
            statusCode: 500,
          }
        ).as('getAssignFailure');

        cy.visit('/authors/1274753');
        cy.waitForLoading();

        cy.get('[data-test-id="select-all-publications"]').check();
        cy.get('[data-test-id="claim-multiple"]').trigger('mouseover');
        cy.get('[data-test-id="assign-self"]').click();

        cy.wait('@getAssignFailure');

        cy.get('.ant-notification-notice-message').should(
          'have.text',
          'Claim Error!'
        );
        cy.get('.ant-notification-notice-description').should(
          'have.text',
          'Something went wrong.'
        );
      });
    });
  });

  context('Curator view', () => {
    beforeEach(() => {
      cy.login('cataloger');
    });

    it('moves paper to user profile successfully', () => {
      cy.intercept('POST', '/api/assign/literature/assign', {
        statusCode: 200,
        body: {
          message: 'Success',
        },
      }).as('getAssignSuccess');

      cy.visit('/authors/1274753');
      cy.waitForLoading();

      cy.get('[data-test-id="literature-result-item"]')
        .first()
        .find('[data-test-id="btn-claim"]')
        .trigger('mouseover');
      cy.get('[data-test-id="assign-self"]').click();

      cy.wait('@getAssignSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Processing request...'
      );
      cy.get('.ant-notification-notice-description').should((description) => {
        expect(description.text()).to.contain(
          'will be moved from 1274753 to 1274753.'
        );
      });
    });

    it('removes paper from user profile successfully', () => {
      cy.intercept('POST', '/api/assign/literature/unassign', {
        statusCode: 200,
      }).as('getUnassignSuccess');

      cy.visit('/authors/1274753');
      cy.waitForLoading();

      cy.get('[data-test-id="literature-result-item"]')
        .first()
        .find('[data-test-id="btn-claim"]')
        .trigger('mouseover');
      cy.get('[data-test-id="unassign"]').click();

      cy.wait('@getUnassignSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Processing request...'
      );
      cy.get('[data-test-id="claim-notification-description"').should(
        (description) => {
          expect(description.text()).to.contain('will be moved from 1274753');
        }
      );
    });

    it("assings paper to other author's profile successfully", () => {
      cy.intercept('POST', '/api/assign/literature/assign', {
        statusCode: 200,
      }).as('getAssignSuccess');

      cy.visit('/authors/1274753');
      cy.waitForLoading();

      cy.get('[data-test-id="literature-result-item"]')
        .first()
        .find('[data-test-id="btn-claim"]')
        .trigger('mouseover');
      cy.get('[data-test-id="assign-another"]').click();

      cy.get('input[class="ant-input"]').type('Hotzel');
      cy.get(
        'button[class="ant-btn ant-btn-primary ant-input-search-button"'
      ).click();

      cy.get('input[value="1274753"]').first().click();
      cy.get('[data-test-id="assign-button"').click();

      cy.wait('@getAssignSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Processing request...'
      );
      cy.get('[data-test-id="claim-notification-description"').should(
        (description) => {
          expect(description.text()).to.contain('will be moved from 1274753');
        }
      );
    });

    it('assings paper to new author successfully', () => {
      cy.intercept('POST', '/api/assign/literature/unassign', {
        statusCode: 200,
      }).as('getAssignNewSuccess');

      cy.visit('/authors/1274753');
      cy.waitForLoading();

      cy.get('[data-test-id="literature-result-item"]')
        .first()
        .find('[data-test-id="btn-claim"]')
        .trigger('mouseover');
      cy.get('[data-test-id="assign-another"]').click();

      cy.get('input[value="new"]').click();
      cy.get('[data-test-id="assign-button"').click();

      cy.wait('@getAssignNewSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Processing request...'
      );
      cy.get('[data-test-id="claim-notification-description"').should(
        (description) => {
          expect(description.text()).to.contain('will be moved from 1274753');
        }
      );
    });

    it('shows error message when failed to move paper', () => {
      cy.intercept('POST', '/api/assign/literature/assign', {
        statusCode: 500,
      }).as('getAssignFailure');

      cy.visit('/authors/1274753');
      cy.waitForLoading();

      cy.get('[data-test-id="literature-result-item"]')
        .first()
        .find('[data-test-id="btn-claim"]')
        .trigger('mouseover');
      cy.get('[data-test-id="assign-self"]').click();

      cy.wait('@getAssignFailure');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Claim Error!'
      );
      cy.get('.ant-notification-notice-description').should(
        'have.text',
        'Something went wrong.'
      );
    });
  });
});

describe('Literature collection', () => {
  it('displays disabled claim button with appropriate tooltip when user is not logged in', () => {
    cy.visit('/literature/1688995');
    cy.waitForLoading();

    cy.get('[data-test-id="btn-claiming-login"]').should('be.visible');
  });

  it("displays disabled claim button with appropriate tooltip when user doesn't have author profile", () => {
    cy.login();
    cy.visit('/literature/1688995');
    cy.waitForLoading();

    cy.get('[data-test-id="btn-claiming-profile"]').should('be.visible');
  });

  it("displays disabled claim button with appropriate tooltip when paper doesn't have authors", () => {
    cy.login('johnellis');
    cy.visit('/literature/44707');
    cy.waitForLoading();

    cy.get('[data-test-id="btn-claiming-authors"]').should('be.visible');
  });

  context('Claiming enabled', () => {
    beforeEach(() => {
      cy.login('johnellis');
    });

    it('moves paper to user profile automatically successfully', () => {
      cy.intercept(
        'GET',
        '/api/assign/check-names-compatibility?literature_recid=1688995',
        {
          statusCode: 200,
          body: {
            matched_author_recid: 1010819,
          },
        }
      ).as('getCheckNameSuccess');

      cy.intercept('POST', '/api/assign/literature/assign', {
        statusCode: 200,
        body: {
          message: 'Success',
        },
      }).as('getAssignSuccess');

      cy.visit('/literature/1688995');
      cy.waitForLoading();

      cy.get('[data-test-id="btn-claiming-literature"]').trigger('mouseover');
      cy.get('[data-test-id="assign-literature-item"]').click();

      cy.wait('@getCheckNameSuccess');
      cy.wait('@getAssignSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Assignment Successful!'
      );
      cy.get('.ant-notification-notice-description').should(
        'have.text',
        '1 paper added to your profile'
      );
    });

    it('shows error message when failed to move paper automatically', () => {
      cy.intercept('POST', '/api/assign/literature/assign', {
        statusCode: 500,
      }).as('getAssignError');

      cy.visit('/literature/1688995');
      cy.waitForLoading();

      cy.get('[data-test-id="btn-claiming-literature"]').trigger('mouseover');
      cy.get('[data-test-id="assign-literature-item"]').click();

      cy.wait('@getAssignError');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Assignment Error!'
      );
      cy.get('.ant-notification-notice-description').should(
        'have.text',
        'Something went wrong.'
      );
    });

    it('moves paper from selected author to user profile successfully', () => {
      cy.intercept('POST', '/api/assign/literature/assign-different-profile', {
        statusCode: 200,
        body: {
          created_rt_ticket: true,
        },
      }).as('getAssignSuccess');

      cy.visit('/literature/1331798');
      cy.waitForLoading();

      cy.get('[data-test-id="btn-claiming-literature"]').trigger('mouseover');
      cy.get('[data-test-id="assign-literature-item"]').click();
      cy.get('[data-test-id="literature-drawer-radio-1274753"').click();
      cy.get('[data-test-id="assign-literature-item-button"').click();

      cy.wait('@getAssignSuccess');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Some claims will be reviewed by our staff for approval.'
      );
    });

    it('displays empty author drawer if fetching all authors failed', () => {
      cy.intercept('GET', '/api/literature/1331798?field=authors', {
        statusCode: 500,
      }).as('getAuthorsError');

      cy.visit('/literature/1331798');
      cy.waitForLoading();

      cy.get('[data-test-id="btn-claiming-literature"]').trigger('mouseover');
      cy.get('[data-test-id="assign-literature-item"]').click();

      cy.wait('@getAuthorsError');

      cy.get('.ant-empty-image').should('be.visible');
    });

    it('shows error message when failed to move paper from selected author to user profile', () => {
      cy.intercept('POST', '/api/assign/literature/assign-different-profile', {
        statusCode: 500,
      }).as('getAssignError');

      cy.visit('/literature/1787272');
      cy.waitForLoading();

      cy.get('[data-test-id="btn-claiming-literature"]').trigger('mouseover');
      cy.get('[data-test-id="assign-literature-item"]').click();
      cy.get('[data-test-id="literature-drawer-radio-996285"').click();
      cy.get('[data-test-id="assign-literature-item-button"').click();

      cy.wait('@getAssignError');

      cy.get('.ant-notification-notice-message').should(
        'have.text',
        'Assignment Error!'
      );
      cy.get('.ant-notification-notice-description').should(
        'have.text',
        'This paper cannot be claimed automatically. Please contact us'
      );
    });
  });
});
