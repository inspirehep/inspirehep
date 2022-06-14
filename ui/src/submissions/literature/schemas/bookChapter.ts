// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import references from './sections/references';
import comments from './sections/comments';

const bookChapterSchema = object().shape({
  document_type: string().default('book chapter'),
  ...links,
  ...basicInfo,
  book_title: string(),
  start_page: string(),
  end_page: string(),
  ...references,
  ...comments,
});

export default bookChapterSchema;
