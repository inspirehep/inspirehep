import { hep, thesis, book, bookChapter, proceedings, conferencePaper } from './hep';

export const editorConfigs = {
  hep,
  thesis,
  book,
  'book chapter': bookChapter,
  proceedings,
  'conference paper': conferencePaper
};

export * from './api.config';
