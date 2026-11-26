import { UiSchema } from '@rjsf/utils';

import TableObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import DisplayAsListArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldTemplate';
import DisplayAsListCollapsibleArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListCollapsibleArrayFieldItemTemplate';
import AuthorsToolbarActions from '../../components/customTemplates/AuthorsToolbarActions';
import {
  authorBrief,
  authorHref,
  authorSuffix,
  authorNeedsEdit,
} from '../../utils/authorBrief';
import NestedWithHeaderArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/NestedWithHeaderArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import ArrayItemObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';
import { property, recordLink, stringList, objectList } from '../helpers';

const authorsUiSchema: UiSchema = {
  'ui:ArrayFieldTemplate': DisplayAsListArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate':
    DisplayAsListCollapsibleArrayFieldItemTemplate as UiSchema['ui:ArrayFieldItemTemplate'],
  'ui:title': 'authors',
  'ui:options': {
    searchable: true,
    pageSize: 25,
    getItemBrief: authorBrief,
    getItemHref: authorHref,
    getItemSuffix: authorSuffix,
    needsEdit: authorNeedsEdit,
    toolbarActions: AuthorsToolbarActions,
  },
  items: {
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:options': { label: false, showHeader: false },
    'ui:order': [
      'full_name',
      'alternative_names',
      'affiliations',
      'raw_affiliations',
      'emails',
      'ids',
      'inspire_roles',
      'credit_roles',
      'affiliations_identifiers',
      'curated_relation',
      'record',
      '*',
    ],
    uuid: {
      'ui:widget': 'hidden',
    },
    signature_block: {
      'ui:widget': 'hidden',
    },
    full_name: property('full name'),
    alternative_names: stringList('alternative names'),
    affiliations: {
      'ui:ArrayFieldTemplate': NestedWithHeaderArrayFieldTemplate,
      'ui:ArrayFieldItemTemplate': DefaultArrayFieldItemTemplate,
      items: {
        'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
        'ui:order': ['value', 'record', 'curated_relation'],
        value: {
          'ui:widget': 'institutionAutocomplete',
          'ui:options': { valueKey: 'value' },
          'ui:placeholder': 'ICN of affiliation',
        },
        record: { $ref: { 'ui:widget': 'viewRecordWidget' } },
        curated_relation: {
          'ui:options': { label: false },
        },
      },
    },
    raw_affiliations: objectList('raw affiliations', ['source', 'value']),
    emails: stringList('emails'),
    ids: objectList('ids', ['value', 'schema']),
    inspire_roles: property('inspire roles', {
      'ui:widget': 'enumMultiSelect',
    }),
    credit_roles: property('credit roles', {
      'ui:widget': 'enumMultiSelect',
    }),
    affiliations_identifiers: objectList('affiliations identifiers', [
      'schema',
      'value',
    ]),
    curated_relation: property('curated relation', {
      'ui:options': { label: false },
    }),
    record: recordLink('record', {
      'ui:widget': 'recordRef',
      'ui:options': { label: false },
    }),
  },
};

export default authorsUiSchema;
