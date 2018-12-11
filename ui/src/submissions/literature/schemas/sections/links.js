import { string } from 'yup';

export default {
  pdf_link: string().url(),
  additional_link: string().url(),
};
