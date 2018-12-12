import { object, string } from 'yup';

import basicInfo from './sections/basicInfo';
import links from './sections/links';
import thesisInfo from './sections/thesisInfo';

const thesisSchema = object().shape({
  documet_type: string().default('thesis'),
  ...links,
  ...basicInfo,
  ...thesisInfo,
});

export default thesisSchema;
