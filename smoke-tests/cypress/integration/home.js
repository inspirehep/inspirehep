describe('home page', function() {
  it('does an empty search on literature collection', function() {
    cy.viewport(Cypress.env('viewport_width'), Cypress.env('viewport_height'));
    cy.visit(Cypress.env('inspirehep_url'));
    cy
      .get(
        '.ant-row > .ant-col > .ant-input-search > .ant-input-wrapper > .ant-input'
      )
      .type(' ');
    cy
      .get(
        '.ant-col > .ant-input-search > .ant-input-wrapper > .ant-input-group-addon > .ant-btn'
      )
      .click();
  });
});
