import {
  hep,
  thesis,
  book,
  bookChapter,
  proceedings,
  conferencePaper,
} from './hep';
import { authors } from './authors.config';
import { conferences } from './conferences.config';
import { experiments } from './experiments.config';
import { institutions } from './institutions.config';
import { journals } from './journals.config';

export const editorConfigs = {
  hep,
  thesis,
  book,
  'book chapter': bookChapter,
  proceedings,
  'conference paper': conferencePaper,
  authors,
  conferences,
  experiments,
  institutions,
  journals,
};

export * from './api.config';
