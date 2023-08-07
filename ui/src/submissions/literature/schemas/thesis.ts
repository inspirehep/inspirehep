import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import thesisInfo from './sections/thesisInfo';
import references from './sections/references';
import comments from './sections/comments';

const thesisSchema = object().shape({
  document_type: string().default('thesis'),
  ...links,
  ...basicInfo,
  ...thesisInfo,
  ...references,
  ...comments,
});

export default thesisSchema;
