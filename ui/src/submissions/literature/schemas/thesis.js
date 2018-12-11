import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';

const thesisSchema = object().shape({
  documet_type: string().default('thesis'),
  ...basicInfo,
  ...links,
});

export default thesisSchema;
