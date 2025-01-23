import { string, object } from 'yup';

export const DEFAULT_FORM_DATA = {
  short_title: '',
  journal_title: '',
};

export const journalSchema = object().shape({
  short_title: string().required().label('Short title'),
  journal_title: string().required().label('Journal title'),
});
