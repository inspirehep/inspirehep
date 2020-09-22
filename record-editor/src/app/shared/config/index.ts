import { hep, thesis, book, bookChapter, proceedings, conferencePaper } from './hep';
import { authors } from './authors.config';
import { conferences } from './conferences.config';


export const editorConfigs = {
  hep,
  thesis,
  book,
  'book chapter': bookChapter,
  proceedings,
  'conference paper': conferencePaper,
  authors,
  conferences,
};

export * from './api.config';
