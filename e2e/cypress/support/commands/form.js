import moment from 'moment';

Cypress.Commands.add('selectLiteratureDocType', (docType) => {
  cy.get('[data-test-id=skip-import-button]')
    .click()
    .get('[data-test-id=document-type-select]')
    .click()
    .get(
      `.ant-select-dropdown [data-test-id=document-type-select-option-${docType}]`
    )
    .click()
    .should('be.hidden'); // wait for dropdown menu to be closed before proceeding further.
});

Cypress.Commands.add(
  'testSubmission',
  ({ expectedMetadata, formData, collection }) => {
    const route = `/submissions/${collection}`;
    const apiRoute = `/api${route}`;

    cy.registerRoute({
      url: apiRoute,
      method: 'POST',
    });
    cy.submitForm(formData);
    return cy
      .waitForRoute(apiRoute)
      .then((xhr) => {
        const recordId = xhr.response.body.pid_value;

        if (recordId) {
          cy.wrap(xhr).its('status').should('equal', 201);
          return cy.requestRecord({ collection, recordId });
        } else {
          // workflow based submissions
          cy.wrap(xhr).its('status').should('equal', 200);
          const workflowId = xhr.response.body.workflow_object_id;
          return cy.requestWorkflow({ workflowId });
        }
      })
      .then((recordOrWorkflow) => {
        expect(recordOrWorkflow.metadata).like(expectedMetadata);
        return recordOrWorkflow;
      });
  }
);

Cypress.Commands.add(
  'testUpdateSubmission',
  ({ expectedMetadata, formData, collection, recordId }) => {
    const route = `/submissions/${collection}/${recordId}`;
    const apiRoute = `/api${route}`;

    cy.get('form').should('be.visible');

    cy.registerRoute({
      url: apiRoute,
      method: 'PUT',
    });
    cy.submitForm(formData);

    cy.waitForRoute(apiRoute).its('status').should('equal', 200);

    cy.requestRecord({ collection, recordId })
      .its('metadata')
      .should('like', expectedMetadata);
  }
);

Cypress.Commands.add('submitForm', (data) => {
  cy.fillForm(data);
  cy.get('button[type=submit]').click();
});

Cypress.Commands.add('fillForm', (data) => {
  // disable sticky elements, such as header which sometimes cover form fields
  // and prevents them from being filled
  cy.get('[data-test-id="sticky"]').invoke('css', 'position', 'absolute');
  cy.fillObjectField(null, data);
});

function joinPaths(...paths) {
  return paths.filter((path) => path != null).join('.');
}

Cypress.Commands.add('fillField', (path, value) => {
  cy.getFieldType(path, value).then((fieldType) => {
    switch (fieldType) {
      case 'array':
        return cy.fillArrayField(path, value);
      case 'object':
        return cy.fillObjectField(path, value);
      case 'boolean':
        return cy.fillBooleanField(path, value);
      case 'number':
      case 'string':
        return cy.fillNumberOrTextField(path, value);
      case 'suggester':
        return cy.fillSuggesterField(path, value);
      case 'single-select':
      case 'multiple-select':
        return cy.fillSelectField(path, value);
      case 'date-picker':
        return cy.fillDateField(path, value);
      case 'date-range-picker':
        return cy.fillDateRangeField(path, value);
      case 'rich-text':
        return cy.fillRichTextField(path, value);
      default:
        throw TypeError(`${fieldType} can not be a form value`);
    }
  });
});

Cypress.Commands.add('fillObjectField', (path, object) => {
  const subFieldEntries = Object.entries(object);
  for (const [subField, value] of subFieldEntries) {
    const subPath = joinPaths(path, subField);
    cy.fillField(subPath, value);
  }
});

Cypress.Commands.add('fillArrayField', (path, array) => {
  for (const [i, item] of array.entries()) {
    const itemPath = joinPaths(path, i);
    if (i !== 0) {
      // click (+) to add an empty item first
      cy.get(`[data-test-id="${path}-add-item"]`)
        .click()
        .get(`[data-test-id="container-${itemPath}"]`)
        .should('be.visible');
    }
    cy.fillField(itemPath, item);
  }
});

Cypress.Commands.add('fillDateRangeField', (path, [startDate, endDate]) => {
  const rangeInputsSelector = `[data-test-id="${path}"] input`;

  cy.getField(path).then(($dateRangeSelect) => {
    const dateFormat =
      $dateRangeSelect.attr('data-test-format') || 'YYYY-MM-DD';
    const startDateValue = moment(startDate).format(dateFormat);
    const endDateValue = moment(endDate).format(dateFormat);

    cy.get(rangeInputsSelector)
      .first()
      .type(`${startDateValue}{enter}`, { force: true });
    cy.get(rangeInputsSelector)
      .last()
      .type(`${endDateValue}{enter}`, { force: true });
  });
});

Cypress.Commands.add('fillDateField', (path, value) => {
  cy.getField(path).then(($dateSelect) => {
    const dateFormat = $dateSelect.attr('data-test-format') || 'YYYY-MM-DD';
    const dateValue = moment(value).format(dateFormat);
    cy.wrap($dateSelect).type(`${dateValue}{enter}`, { force: true });
  });
});

Cypress.Commands.add('fillNumberOrTextField', (path, value) => {
  cy.getField(path).type(value, { force: true });
});

Cypress.Commands.add('fillSuggesterField', (path, value) => {
  cy.getField(path).within(() => {
    cy.get('input').type(value, { force: true });
  });
});

Cypress.Commands.add('fillSelectField', (path, values) => {
  cy.selectFromSelectBox(path, values);
});

Cypress.Commands.add('fillRichTextField', (path, value) => {
  cy.getField(path).within(() => {
    cy.get('.ql-editor[contenteditable=true]').type(value, { force: true });
  });
});

Cypress.Commands.add('fillBooleanField', (path, value) => {
  cy.getField(path).then(($checkbox) => {
    if ($checkbox.checked !== value) {
      $checkbox.click();
    }
  });
  // TODO: use `.check(), uncheck()`
});

Cypress.Commands.add('getField', (fieldPath) => {
  return cy.get(`[data-test-id="${fieldPath}"]`);
});

Cypress.Commands.add('getFieldType', (fieldPath, value) => {
  return cy.get('body').then(($body) => {
    const $field = $body.find(`[data-test-id="${fieldPath}"]`);
    let fieldType = $field.attr('data-test-type');
    if (!fieldType) {
      // fallback to value type
      fieldType = Array.isArray(value) ? 'array' : typeof value;
    }
    return fieldType;
  });
});

Cypress.Commands.add('getFieldError', (fieldPath) => {
  const errorSelector = `[data-test-id="${fieldPath}-error"]`;
  return cy.get(errorSelector);
});
