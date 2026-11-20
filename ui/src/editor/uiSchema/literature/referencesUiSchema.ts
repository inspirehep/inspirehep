import { UiSchema } from '@rjsf/utils';

import TableObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import ObjectPropertyFieldTemplate from '../../components/customTemplates/fieldTemplates/ObjectPropertyFieldTemplate';
import DisplayAsListArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldTemplate';
import DisplayAsListCollapsibleArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListCollapsibleArrayFieldItemTemplate';
import ReferencesToolbarActions from '../../components/customTemplates/ReferencesToolbarActions';
import {
  referenceBrief,
  referenceHref,
  referenceNeedsEdit,
} from '../../utils/referenceBrief';
import NestedArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/NestedArrayFieldTemplate';
import NestedArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/NestedArrayFieldItemTemplate';
import NestedWithHeaderArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/NestedWithHeaderArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import ArrayItemObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';

const referenceProperty = (title: string, extra: UiSchema = {}): UiSchema => ({
  'ui:FieldTemplate': ObjectPropertyFieldTemplate,
  'ui:title': title,
  ...extra,
});

const referenceRecordLink = (
  title: string,
  refUiSchema: UiSchema = { 'ui:widget': 'viewRecordWidget' }
): UiSchema => referenceProperty(title, { $ref: refUiSchema });

const referenceObject = (
  title: string,
  order: string[],
  properties: Record<string, string | UiSchema> = {}
): UiSchema => ({
  'ui:FieldTemplate': ObjectPropertyFieldTemplate,
  'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
  'ui:title': title,
  'ui:options': { showHeader: false },
  'ui:order': order,
  ...Object.fromEntries(
    order.map((name) => {
      const override = properties[name];
      return [
        name,
        typeof override === 'object'
          ? override
          : referenceProperty(override ?? name.replace(/_/g, ' ')),
      ];
    })
  ),
});

const referenceStringList = (title: string): UiSchema => ({
  'ui:ArrayFieldTemplate': NestedArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate': NestedArrayFieldItemTemplate,
  'ui:title': title,
  items: { 'ui:options': { label: false } },
});

const referenceObjectList = (title: string, order: string[]): UiSchema => ({
  'ui:ArrayFieldTemplate': NestedWithHeaderArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate': DefaultArrayFieldItemTemplate,
  'ui:title': title,
  items: {
    'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    'ui:order': order,
    ...Object.fromEntries(
      order.map((name) => [name, { 'ui:options': { label: false } }])
    ),
  },
});

const referencesUiSchema: UiSchema = {
  'ui:ArrayFieldTemplate': DisplayAsListArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate':
    DisplayAsListCollapsibleArrayFieldItemTemplate as UiSchema['ui:ArrayFieldItemTemplate'],
  'ui:title': 'references',
  'ui:options': {
    searchable: true,
    pageSize: 25,
    getItemBrief: referenceBrief,
    getItemHref: referenceHref,
    needsEdit: referenceNeedsEdit,
    toolbarActions: ReferencesToolbarActions,
  },
  items: {
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:options': { label: false, showHeader: false },
    'ui:order': [
      'reference',
      'curated_relation',
      'legacy_curated',
      'raw_refs',
      'record',
    ],
    reference: referenceObject(
      'reference',
      [
        'label',
        'title',
        'authors',
        'arxiv_eprint',
        'book_series',
        'collaborations',
        'document_type',
        'dois',
        'external_system_identifiers',
        'imprint',
        'isbn',
        'misc',
        'persistent_identifiers',
        'publication_info',
        'report_numbers',
        'texkey',
        'urls',
      ],
      {
        title: referenceObject('title', ['source', 'subtitle', 'title']),
        authors: referenceObjectList('authors', ['full_name', 'inspire_role']),
        arxiv_eprint: referenceProperty('arxiv eprint', {
          'ui:placeholder': 'arXiv eprint number',
        }),
        book_series: referenceObject('book series', ['title', 'volume']),
        collaborations: referenceStringList('collaborations'),
        document_type: referenceProperty('document type'),
        dois: referenceStringList('dois'),
        external_system_identifiers: referenceObjectList(
          'external system identifiers',
          ['schema', 'value']
        ),
        imprint: referenceObject('imprint', ['date', 'place', 'publisher']),
        misc: referenceStringList('misc'),
        persistent_identifiers: referenceObjectList('persistent identifiers', [
          'schema',
          'value',
        ]),
        publication_info: referenceObject(
          'publication info',
          [
            'journal_title',
            'journal_volume',
            'journal_issue',
            'year',
            'page_start',
            'page_end',
            'artid',
            'cnum',
            'journal_record',
            'material',
            'parent_isbn',
            'parent_report_number',
            'parent_title',
          ],
          {
            journal_record: referenceProperty('journal record', {
              $ref: { 'ui:widget': 'viewRecordWidget' },
            }),
          }
        ),
        report_numbers: referenceStringList('report numbers'),
        urls: referenceObjectList('urls', ['description', 'value']),
      }
    ),
    curated_relation: referenceProperty('curated relation', {
      'ui:options': { label: false },
    }),
    legacy_curated: referenceProperty('legacy curated', {
      'ui:options': { label: false },
    }),
    raw_refs: referenceObjectList('raw refs', ['schema', 'source', 'value']),
    record: referenceRecordLink('record', {
      'ui:widget': 'viewRecordWidget',
      'ui:options': { label: false },
    }),
  },
};

export default referencesUiSchema;
