import { UiSchema } from '@rjsf/utils';

import literatureUiSchema from './literatureUiSchema';
import ArrayItemObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';
import TableObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import NestedWithHeaderArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/NestedWithHeaderArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import ObjectPropertyFieldTemplate from '../../components/customTemplates/fieldTemplates/ObjectPropertyFieldTemplate';

const thesisUiSchema: UiSchema = {
  ...literatureUiSchema,
  thesis_info: {
    'ui:title': 'thesis info',
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:order': ['date', 'defense_date', 'degree_type', 'institutions', '*'],
    date: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:widget': 'text',
      'ui:title': 'date',
    },
    defense_date: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:widget': 'text',
      'ui:title': 'defense date',
    },
    degree_type: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'degree type',
      'ui:placeholder': 'Academic degree type',
    },
    institutions: {
      'ui:ArrayFieldTemplate': NestedWithHeaderArrayFieldTemplate,
      'ui:ArrayFieldItemTemplate': DefaultArrayFieldItemTemplate,
      'ui:title': 'institutions',
      items: {
        'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
        'ui:order': ['name', 'record', 'curated_relation'],
        name: {
          'ui:widget': 'institutionAutocomplete',
          'ui:options': { valueKey: 'name' },
        },
        record: { $ref: { 'ui:widget': 'viewRecordWidget' } },
        curated_relation: {
          'ui:options': { label: false },
        },
      },
    },
  },
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
};

export default thesisUiSchema;
