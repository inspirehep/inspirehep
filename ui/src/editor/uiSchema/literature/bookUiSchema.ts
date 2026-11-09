import { UiSchema } from '@rjsf/utils';
import literatureUiSchema from './literatureUiSchema';

const bookUiSchema: UiSchema = {
  ...literatureUiSchema,
  isbns: {},
  book_series: {},
  editions: {},
};

export default bookUiSchema;
