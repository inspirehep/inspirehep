import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import year from '../../common/schemas/year';
import references from './sections/references';
import comments from './sections/comments';

const articleSchema = object().shape({
  document_type: string().default('article'),
  ...links,
  ...basicInfo,
  journal_title: string(),
  volume: string(),
  issue: string(),
  year: year(),
  page_range: string(),
  conference_info: string(),
  proceedings_info: string(),
  ...references,
  ...comments,
});

export default articleSchema;
