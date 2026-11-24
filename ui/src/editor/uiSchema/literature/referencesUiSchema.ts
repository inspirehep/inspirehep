import { UiSchema } from '@rjsf/utils';

import TableObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import DisplayAsListArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldTemplate';
import DisplayAsListCollapsibleArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListCollapsibleArrayFieldItemTemplate';
import ReferencesToolbarActions from '../../components/customTemplates/ReferencesToolbarActions';
import {
  referenceBrief,
  referenceHref,
  referenceNeedsEdit,
} from '../../utils/referenceBrief';
import {
  property,
  recordLink,
  stringList,
  objectList,
  tableObject,
} from '../helpers';

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
    reference: tableObject(
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
        title: tableObject('title', ['source', 'subtitle', 'title']),
        authors: objectList('authors', ['full_name', 'inspire_role']),
        arxiv_eprint: property('arxiv eprint', {
          'ui:placeholder': 'arXiv eprint number',
        }),
        book_series: tableObject('book series', ['title', 'volume']),
        collaborations: stringList('collaborations'),
        document_type: property('document type'),
        dois: stringList('dois'),
        external_system_identifiers: objectList('external system identifiers', [
          'schema',
          'value',
        ]),
        imprint: tableObject('imprint', ['date', 'place', 'publisher']),
        misc: stringList('misc'),
        persistent_identifiers: objectList('persistent identifiers', [
          'schema',
          'value',
        ]),
        publication_info: tableObject(
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
            journal_record: property('journal record', {
              $ref: { 'ui:widget': 'viewRecordWidget' },
            }),
          }
        ),
        report_numbers: stringList('report numbers'),
        urls: objectList('urls', ['description', 'value']),
      }
    ),
    curated_relation: property('curated relation', {
      'ui:options': { label: false },
    }),
    legacy_curated: property('legacy curated', {
      'ui:options': { label: false },
    }),
    raw_refs: objectList('raw refs', ['schema', 'source', 'value']),
    record: recordLink('record', {
      'ui:widget': 'recordRef',
      'ui:options': { label: false },
    }),
  },
};

export default referencesUiSchema;
