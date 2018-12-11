import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';

const articleSchema = object().shape({
  documet_type: string().default('article'),
  ...basicInfo,
  ...links,
});

export default articleSchema;
