// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import references from './sections/references';
import comments from './sections/comments';
import date from '../../common/schemas/date';

const bookSchema = object().shape({
  document_type: string().default('book'),
  ...links,
  ...basicInfo,
  series_title: string(),
  volume: string(),
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  publication_date: date(),
  publisher: string(),
  publication_place: string(),
  conference_info: string(),
  proceedings_info: string(),
  ...references,
  ...comments,
});

export default bookSchema;
