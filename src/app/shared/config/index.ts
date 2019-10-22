import { hep, thesis, book, bookChapter, proceedings, conferencePaper } from './hep';
import { authors } from './authors.config';

export const editorConfigs = {
  hep,
  thesis,
  book,
  'book chapter': bookChapter,
  proceedings,
  'conference paper': conferencePaper,
  authors,
};

export * from './api.config';
