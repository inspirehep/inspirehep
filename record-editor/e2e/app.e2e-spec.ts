import { RecordEditorPage } from './app.po';

describe('record-editor App', function() {
  let page: RecordEditorPage;

  beforeEach(() => {
    page = new RecordEditorPage();
  });

  it('should display the app title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Record Editor');
  });
});
