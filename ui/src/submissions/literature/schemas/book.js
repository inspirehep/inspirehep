import { object, string, date } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import references from './sections/references';
import comments from './sections/comments';

const bookSchema = object().shape({
  documet_type: string().default('book'),
  ...links,
  ...basicInfo,
  series_title: string(),
  volume: string(),
  publication_date: date().label('Publication Date'),
  publisher: string(),
  publication_place: string(),
  conference_info: string(),
  proceedings_info: string(),
  ...references,
  ...comments,
});

export default bookSchema;
