import { browser, element, by } from 'protractor';

export class RecordEditorPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('re-app h2')).getText();
  }
}
