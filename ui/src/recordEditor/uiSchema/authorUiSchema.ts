import { UiSchema } from '@rjsf/utils';

import NestedArrayFieldTemplate from '../author/components/customTemplates/arrayFieldTemplates/NestedArrayFieldTemplate';
import NestedWithHeaderArrayFieldTemplate from '../author/components/customTemplates/arrayFieldTemplates/NestedWithHeaderArrayFieldTemplate';
import ArrayItemObjectFieldTemplate from '../author/components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';
import ObjectPropertyFieldTemplate from '../author/components/customTemplates/fieldTemplates/ObjectPropertyFieldTemplate';
import TableObjectFieldTemplate from '../author/components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import StandaloneFieldTemplate from '../author/components/customTemplates/fieldTemplates/StandaloneFieldTemplate';
import DisplayAsListArrayFieldTemplate from '../author/components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldTemplate';

const authorUiSchema: UiSchema = {
  'ui:order': [
    'ids',
    'name',
    'positions',
    '_private_notes',
    'email_addresses',
    'status',
    'project_membership',
    'birth_date',
    'death_date',
    'legacy_creation_date',
    'legacy_version',
    '*',
  ],
  ids: {
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['schema', 'value'],
      schema: {
        'ui:options': { label: false },
      },
      value: {
        'ui:options': { label: false },
      },
    },
  },
  name: {
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:title': 'name',
    'ui:order': [
      'preferred_name',
      'value',
      'title',
      'numeration',
      'name_variants',
      'native_names',
      '*',
    ],
    preferred_name: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'preferred name',
    },
    value: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'value',
    },
    title: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'title',
    },
    numeration: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'numeration',
    },
    name_variants: {
      'ui:ArrayFieldTemplate': NestedArrayFieldTemplate,
      'ui:title': 'name variants',
      items: {
        'ui:options': { label: false },
      },
    },
    native_names: {
      'ui:ArrayFieldTemplate': NestedArrayFieldTemplate,
      'ui:title': 'native names',
      items: {
        'ui:options': { label: false },
      },
    },
    previous_names: {
      'ui:ArrayFieldTemplate': NestedArrayFieldTemplate,
      'ui:title': 'previous names',
      items: {
        'ui:options': { label: false },
      },
    },
  },
  advisors: {
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:ArrayFieldTemplate': DisplayAsListArrayFieldTemplate,
    'ui:title': 'advisors',
    items: {
      'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
      'ui:options': { label: false },
      'ui:order': [
        'ids',
        'name',
        'degree_type',
        'curated_relation',
        'hidden',
        'record',
      ],
      ids: {
        'ui:ArrayFieldTemplate': NestedWithHeaderArrayFieldTemplate,
        'ui:title': 'ids',
        items: {
          'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
          'ui:order': ['schema', 'value'],
          schema: {
            'ui:options': { label: false },
          },
          value: {
            'ui:options': { label: false },
          },
        },
      },
      hidden: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:options': { label: false },
      },
      curated_relation: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:options': { label: false },
        'ui:title': 'curated relation',
      },
      record: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:title': 'record',
        $ref: { 'ui:widget': 'viewRecordWidget' },
      },
      degree_type: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:title': 'degree type',
      },
      name: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      },
    },
  },
  awards: {
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:ArrayFieldTemplate': DisplayAsListArrayFieldTemplate,
    'ui:title': 'awards',
    items: {
      'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
      'ui:options': { label: false },
      'ui:order': ['name', 'url', 'year'],
      name: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:title': 'name',
        'ui:placeholder': 'Name of the award',
      },
      url: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
        'ui:title': 'url',
        'ui:options': { showHeader: false },
        'ui:order': ['description', 'value'],
        description: {
          'ui:FieldTemplate': ObjectPropertyFieldTemplate,
          'ui:title': 'description',
        },
        value: {
          'ui:FieldTemplate': ObjectPropertyFieldTemplate,
          'ui:title': 'value',
        },
      },
      year: {
        'ui:title': 'year',
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:placeholder': 'Year of the award',
      },
    },
  },
  positions: {
    'ui:options': { clearable: false },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'current',
        'institution',
        'start_date',
        'end_date',
        'rank',
        'record',
        'hidden',
        'curated_relation',
      ],
      current: {
        'ui:options': { label: false },
      },
      institution: { 'ui:widget': 'institutionAutocomplete' },
      hidden: {
        'ui:options': { label: false },
      },
      curated_relation: {
        'ui:options': { label: false },
      },
      start_date: { 'ui:widget': 'text' },
      end_date: { 'ui:widget': 'text' },
      record: { $ref: { 'ui:widget': 'viewRecordWidget' } },
    },
  },
  _private_notes: {
    'ui:title': 'private notes',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    },
  },
  email_addresses: {
    'ui:options': { clearable: false },
    'ui:title': 'email adresses',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      current: {
        'ui:options': { label: false },
      },
      hidden: {
        'ui:options': { label: false },
      },
    },
  },
  status: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
  },
  project_membership: {
    'ui:title': 'project membership',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'current',
        'name',
        'start_date',
        'end_date',
        'record',
        'hidden',
        'curated_relation',
      ],
      current: {
        'ui:options': { label: false },
      },
      name: { 'ui:widget': 'projectNameAutocomplete' },
      hidden: {
        'ui:options': { label: false },
      },
      curated_relation: {
        'ui:options': { label: false },
      },
      start_date: { 'ui:widget': 'text' },
      end_date: { 'ui:widget': 'text' },
      record: { $ref: { 'ui:widget': 'viewRecordWidget' } },
    },
  },
  inspire_categories: {
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    },
  },
  legacy_version: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'legacy version',
  },
  urls: {
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    },
  },
  arxiv_categories: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'arxiv categories',
    'ui:widget': 'enumMultiSelect',
  },
  _bucket: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:options': { readonly: true },
  },
  public_notes: {
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    },
  },
  deleted_records: {
    'ui:options': { showHeader: false },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      $ref: { 'ui:widget': 'viewRecordWidget' },
    },
  },
  self: {
    'ui:title': 'self',
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:options': { readonly: true },
  },
  acquisition_source: {
    'ui:title': 'acquisition source',
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    datetime: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:widget': 'text',
      'ui:title': 'datetime',
      'ui:placeholder': 'Date on which the metadata was obtained',
    },
    email: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'email',
      'ui:placeholder': "Email address associated to the submitter's account",
    },
    internal_uid: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'internal uid',
      'ui:placeholder': 'Inspire user ID of the submitter',
    },
    method: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'method',
      'ui:placeholder': 'How the medata was obtained',
    },
    orcid: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'orcid',
      'ui:placeholder': 'ORCID of the submitter',
    },
    source: { 'ui:FieldTemplate': ObjectPropertyFieldTemplate },
    submission_number: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'submission number',
      'ui:placeholder': 'Holding pen record ID of the submission',
    },
  },
  stub: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:options': { label: false },
  },
  birth_date: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'text',
  },
  death_date: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'text',
  },
  deleted: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'deleted',
    'ui:options': { label: false },
  },
  _collections: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'enumMultiSelect',
    'ui:title': 'collections',
  },
  legacy_creation_date: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'text',
    'ui:title': 'legacy creation date',
  },
  new_record: {
    $ref: { 'ui:widget': 'hidden' },
  },
  control_number: {
    'ui:widget': 'hidden',
  },
  $schema: {
    'ui:widget': 'hidden',
  },
};

export default authorUiSchema;
