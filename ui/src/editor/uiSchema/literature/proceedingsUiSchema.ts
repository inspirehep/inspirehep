import { UiSchema } from '@rjsf/utils';
import literatureUiSchema from './literatureUiSchema';

const proceedingsUiSchema: UiSchema = {
  ...literatureUiSchema,
  isbns: {},
  book_series: {},
};

export default proceedingsUiSchema;
