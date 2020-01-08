/* eslint-disable no-await-in-loop, no-restricted-syntax */
const moment = require('moment');
const routes = require('./routes');
const { selectFromSelectBox, ID_ATTRIBUTE, TYPE_ATTRIBUTE } = require('./dom');

function joinPaths(...paths) {
  return paths.filter(path => path != null).join('.');
}

const SUBMIT_BUTTON_SELECTOR = 'button[type=submit]';

class FormSubmitter {
  constructor(page) {
    this.page = page;
  }

  async getErrorElementForFieldPath(path) {
    const errorSelector = `[${ID_ATTRIBUTE}=${path}-error]`;
    await this.page.waitFor(errorSelector); // wait for incase of animations
    const errorEl = await this.page.$(errorSelector);
    return errorEl;
  }

  async waitForSubmissionSuccess() {
    await this.page.waitFor(
      HOME =>
        document.location.href.match(
          new RegExp(`${HOME}/submissions(/.+)*/success`)
        ),
      {},
      routes.HOME
    );
  }

  async submit(data) {
    await this.fill(data);
    await this.page.waitFor(
      selector => !document.querySelector(selector).disabled,
      {},
      SUBMIT_BUTTON_SELECTOR
    );
    await this.page.click(SUBMIT_BUTTON_SELECTOR);
  }

  async fill(data) {
    await this.fillAnyField(null, data);
    await this.page.click('form');
  }

  async fillAnyField(path, data) {
    const fieldType = await this.getFieldType(path, data);
    switch (fieldType) {
      case 'array':
        await this.fillArrayField(path, data);
        break;
      case 'object':
        await this.fillObjectField(path, data);
        break;
      case 'boolean':
        await this.fillBooleanField(path, data);
        break;
      case 'number':
      case 'string':
        await this.fillNumberOrStringField(path, data);
        break;
      case 'single-select':
        await this.fillSingleSelectField(path, data);
        break;
      case 'multiple-select':
        await this.fillMultiSelectField(path, data);
        break;
      case 'date-picker':
        await this.fillDateField(path, data);
        break;
      case 'date-range-picker':
        await this.fillDateRangeField(path, data);
        break;
      case 'rich-text':
        await this.fillRichTextField(path, data);
        break;
      default:
        throw TypeError(`${fieldType} can not be a form value`);
    }
  }

  async getFieldType(path, value) {
    try {
      const fieldSelector = `[${ID_ATTRIBUTE}="${path}"]`;
      const fieldType = await this.page.$eval(
        fieldSelector,
        (field, typeAttr) => field.getAttribute(typeAttr),
        TYPE_ATTRIBUTE
      );
      if (fieldType) {
        return fieldType;
      }
    } catch (error) {
      /* there is no field fallback to value type */
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    return typeof value;
  }

  async fillArrayField(path, items) {
    for (const [i, itemData] of items.entries()) {
      const itemPath = joinPaths(path, i);

      if (i !== 0) {
        await this.addNewItemToField(path);
        const itemContainerSelector = `[${ID_ATTRIBUTE}="container-${itemPath}"]`;
        await this.page.waitFor(itemContainerSelector);
      }

      await this.fillAnyField(itemPath, itemData);
    }
  }

  async addNewItemToField(path) {
    await this.page.click(`[${ID_ATTRIBUTE}="${path}-add-item"]`);
  }

  async fillObjectField(path, data) {
    const subFieldNames = Object.keys(data);
    for (const subField of subFieldNames) {
      const subPath = joinPaths(path, subField);
      await this.fillAnyField(subPath, data[subField]);
    }
  }

  async fillBooleanField(path, value) {
    const fieldSelector = `[${ID_ATTRIBUTE}="${path}"]`;
    const checked = await this.page.$eval(
      fieldSelector,
      field => field.checked
    );
    if (value !== checked) {
      await this.page.click(fieldSelector);
    }
  }

  async fillNumberOrStringField(path, value) {
    const fieldSelector = `[${ID_ATTRIBUTE}="${path}"]`;
    await this.page.type(fieldSelector, value);
  }

  async fillSingleSelectField(path, value) {
    await selectFromSelectBox(this.page, path, value);
  }

  async fillMultiSelectField(path, values) {
    for (const value of values) {
      await selectFromSelectBox(this.page, path, value);
    }
  }

  async selectDateOnActivePicker(date) {
    const dateSelector = `[title="${moment(date).format('MMMM D, YYYY')}"]`;
    await this.page.waitFor(dateSelector);
    await this.page.click(dateSelector);
  }

  async fillDateField(path, value) {
    const fieldSelector = `[${ID_ATTRIBUTE}="${path}"]`;
    await this.page.click(fieldSelector);
    await this.selectDateOnActivePicker(value);
  }

  async fillDateRangeField(path, [startDate, endDate]) {
    const fieldSelector = `[${ID_ATTRIBUTE}="${path}"]`;
    await this.page.click(fieldSelector);
    await this.selectDateOnActivePicker(startDate);
    await this.selectDateOnActivePicker(endDate);
  }

  async fillRichTextField(path, value) {
    const fieldSelector = `[${ID_ATTRIBUTE}="${path}"] [contenteditable=true]`;
    await this.page.type(fieldSelector, value);
  }
}

module.exports = {
  FormSubmitter,
  SUBMIT_BUTTON_SELECTOR,
};
