import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';

const articleSchema = object().shape({
  documet_type: string().default('article'),
  ...links,
  ...basicInfo,
});

export default articleSchema;
