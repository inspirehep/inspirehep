import { UiSchema } from '@rjsf/utils';
import literatureUiSchema from './literatureUiSchema';

const thesisUiSchema: UiSchema = {
  ...literatureUiSchema,
  thesis_info: {},
  isbns: {},
};

export default thesisUiSchema;
