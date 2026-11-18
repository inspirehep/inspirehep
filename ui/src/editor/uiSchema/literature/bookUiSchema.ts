import { UiSchema } from '@rjsf/utils';

import literatureUiSchema from './literatureUiSchema';
import ArrayItemObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';

const bookUiSchema: UiSchema = {
  ...literatureUiSchema,
  isbns: {
    'ui:title': 'isbns',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'medium'],
      medium: {
        'ui:placeholder': 'Physical medium to which this ISBN refers',
      },
    },
  },
  book_series: {
    'ui:title': 'book series',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['title', 'volume'],
      title: { 'ui:placeholder': 'Title of the book series' },
      volume: {
        'ui:placeholder': 'Volume of the book in the series',
      },
    },
  },
  editions: {
    'ui:title': 'editions',
    items: {
      'ui:options': { label: false },
    },
  },
};

export default bookUiSchema;
