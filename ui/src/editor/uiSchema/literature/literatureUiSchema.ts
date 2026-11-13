import { UiSchema } from '@rjsf/utils';

import TabsObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TabsObjectFieldTemplate';
import StandaloneFieldTemplate from '../../components/customTemplates/fieldTemplates/StandaloneFieldTemplate';
import TableObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import ObjectPropertyFieldTemplate from '../../components/customTemplates/fieldTemplates/ObjectPropertyFieldTemplate';
import DisplayAsListArrayFieldTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldTemplate';
import DisplayAsListArrayFieldItemTemplate from '../../components/customTemplates/arrayFieldTemplates/DisplayAsListArrayFieldItemTemplate';
import ArrayItemObjectFieldTemplate from '../../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';
import { ISO_LANGUAGE_MAP } from '../../constants/isoLanguageMap';

const literatureUiSchema: UiSchema = {
  'ui:submitButtonOptions': { norender: true },
  'ui:ObjectFieldTemplate': TabsObjectFieldTemplate,
  'ui:options': {
    inlineProperties: [
      'curated',
      'core',
      'citeable',
      'refereed',
      'withdrawn',
      'deleted',
      'rpp',
    ],
    tabs: [
      { name: 'References', properties: ['references'] },
      {
        name: 'Authors',
        properties: [
          'collaborations',
          'accelerator_experiments',
          'authors',
          'corporate_author',
        ],
      },
    ],
  },
  'ui:order': [
    'curated',
    'core',
    'citeable',
    'refereed',
    'withdrawn',
    'deleted',
    'rpp',
    'document_type',
    'publication_type',
    '_collections',
    'languages',
    'titles',
    'title_translations',
    'dois',
    'report_numbers',
    'arxiv_eprints',
    'inspire_categories',
    'public_notes',
    'number_of_pages',
    'abstracts',
    'publication_info',
    'persistent_identifiers',
    'external_system_identifiers',
    'texkeys',
    'isbns',
    'book_series',
    'thesis_info',
    'preprint_date',
    'imprints',
    'keywords',
    'energy_ranges',
    'copyright',
    'license',
    'funding_info',
    '_private_notes',
    'urls',
    'new_record',
    'deleted_records',
    'acquisition_source',
    'legacy_creation_date',
    '_export_to',
    'legacy_version',
    'data',
    'related_records',
    'record_affiliations',
    'figures',
    'documents',
    '_desy_bookkeeping',
    'collaborations',
    'accelerator_experiments',
    'authors',
    'corporate_author',
    '*',
  ],
  curated: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#3498DB' },
  },
  core: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#27AE60' },
  },
  citeable: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#8E44AD' },
  },
  refereed: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#34495E' },
  },
  withdrawn: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#F1C40F' },
  },
  deleted: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#E74C3C' },
  },
  rpp: {
    'ui:widget': 'toggle',
    'ui:options': { color: '#7F8C8D' },
  },
  document_type: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'enumMultiSelect',
    'ui:title': 'document type',
  },
  _collections: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'enumMultiSelect',
    'ui:title': 'collections',
  },
  publication_type: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'publication type',
  },
  languages: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'languages',
    'ui:widget': 'enumMultiSelect',
    'ui:options': { enumNames: ISO_LANGUAGE_MAP },
  },
  titles: {
    'ui:title': 'titles',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['title', 'source', 'subtitle'],
      title: { 'ui:widget': 'latexTextarea' },
    },
  },
  title_translations: {
    'ui:title': 'title translations',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['title', 'subtitle', 'language', 'source'],
      language: {
        'ui:options': { enumNames: ISO_LANGUAGE_MAP },
        'ui:placeholder': 'ISO 639-1 alpha 2 language code',
      },
    },
  },
  dois: {
    'ui:title': 'dois',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'material', 'source'],
      material: { 'ui:placeholder': 'Material to which the field refers' },
      value: { 'ui:placeholder': 'DOI' },
    },
  },
  report_numbers: {
    'ui:title': 'report numbers',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'source', 'hidden'],
      hidden: {
        'ui:options': { label: false },
      },
    },
  },
  arxiv_eprints: {
    'ui:title': 'arxiv eprints',
    'ui:options': { readonly: true },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'categories'],
      categories: {
        'ui:widget': 'enumMultiSelect',
        'ui:options': { label: false },
      },
    },
  },
  inspire_categories: {
    'ui:title': 'inspire categories',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['term', 'source'],
    },
  },
  public_notes: {
    'ui:title': 'public notes',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'source'],
    },
  },
  number_of_pages: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'number of pages',
    'ui:placeholder': 'Number of pages of the document',
  },
  abstracts: {
    'ui:title': 'abstracts',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'source'],
      value: { 'ui:widget': 'latexTextarea' },
      source: { 'ui:widget': 'abstractSourceAutocomplete' },
    },
  },
  publication_info: {
    'ui:title': 'publication info',
    'ui:options': { scrollable: true },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'journal_title',
        'journal_volume',
        'journal_issue',
        'year',
        'page_start',
        'page_end',
        'artid',
        'cnum',
        'conf_acronym',
        'conference_record',
        'journal_record',
        'parent_record',
        'parent_isbn',
        'parent_report_number',
        'pubinfo_freetext',
        'material',
        'curated_relation',
        'hidden',
      ],
      artid: { 'ui:placeholder': 'Article ID' },
      cnum: { 'ui:placeholder': 'CNUM identifier of the conference' },
      conf_acronym: { 'ui:placeholder': 'Conference acronym' },
      page_end: { 'ui:placeholder': 'Last page of document' },
      page_start: { 'ui:placeholder': 'First page of document' },
      year: { 'ui:placeholder': 'Publication year' },
      material: { 'ui:placeholder': 'Material to which the field refers' },
      journal_title: { 'ui:widget': 'journalTitleAutocomplete' },
      conference_record: {
        $ref: {
          'ui:widget': 'recordRef',
          'ui:placeholder': 'Record of the conference',
        },
      },
      journal_record: { $ref: { 'ui:widget': 'viewRecordWidget' } },
      parent_record: {
        $ref: {
          'ui:widget': 'recordRef',
          'ui:placeholder': 'Reference to literature record',
        },
      },
      curated_relation: {
        'ui:options': { label: false },
      },
      hidden: {
        'ui:options': { label: false },
      },
    },
  },
  persistent_identifiers: {
    'ui:title': 'persistent identifiers',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'schema', 'material', 'source'],
      material: { 'ui:placeholder': 'Material to which the field refers' },
      schema: { 'ui:placeholder': 'Type of identifier' },
      value: { 'ui:placeholder': 'Persistent identifier' },
    },
  },
  external_system_identifiers: {
    'ui:title': 'external system identifiers',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'schema'],
      value: { 'ui:placeholder': 'External identifier' },
    },
  },
  texkeys: {
    'ui:title': 'texkeys',
    'ui:options': { readonly: true },
    items: {
      'ui:options': { label: false },
    },
  },
  preprint_date: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'preprint date',
    'ui:widget': 'text',
    'ui:placeholder': 'Preprint release date',
  },
  imprints: {
    'ui:title': 'imprints',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['publisher', 'place', 'date'],
      place: { 'ui:placeholder': 'Place of publication' },
      date: {
        'ui:widget': 'text',
        'ui:placeholder': 'Date of publication',
      },
    },
  },
  keywords: {
    'ui:title': 'keywords',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'schema', 'source'],
      schema: { 'ui:placeholder': 'Keyword vocabulary' },
      value: { 'ui:placeholder': 'A keyword' },
    },
  },
  energy_ranges: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'energy ranges',
    'ui:widget': 'enumMultiSelect',
  },
  copyright: {
    'ui:title': 'copyright',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['statement', 'holder', 'material', 'year', 'url'],
      holder: { 'ui:placeholder': 'Copyright holder' },
      material: { 'ui:placeholder': 'Material to which the field refers' },
      statement: { 'ui:placeholder': 'Copyright notice' },
      url: { 'ui:placeholder': 'Copyright notice URL' },
    },
  },
  license: {
    'ui:title': 'license',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['material', 'license', 'url', 'imposing'],
      imposing: {
        'ui:placeholder': 'Organization/person imposing the license',
      },
      license: { 'ui:placeholder': 'License statement' },
      material: { 'ui:placeholder': 'Material to which the field refers' },
      url: { 'ui:placeholder': 'URL of the license' },
    },
  },
  funding_info: {
    'ui:title': 'funding info',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['agency', 'grant_number', 'project_number'],
      agency: { 'ui:placeholder': 'Funding agency' },
      grant_number: { 'ui:placeholder': 'Grant number' },
      project_number: { 'ui:placeholder': 'Project number' },
    },
  },
  _private_notes: {
    'ui:title': 'private notes',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'source'],
    },
  },
  urls: {
    'ui:title': 'urls',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['value', 'description'],
    },
  },
  new_record: {
    'ui:title': 'new record',
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    $ref: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:options': { readonly: true },
    },
  },
  deleted_records: {
    'ui:title': 'deleted records',
    'ui:options': { showHeader: false },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      $ref: {
        'ui:widget': 'recordRef',
        'ui:options': { label: false },
        'ui:placeholder': 'Reference to deleted record',
      },
    },
  },
  acquisition_source: {
    'ui:title': 'acquisition source',
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:options': { readonly: true },
    'ui:order': ['method', 'source', 'datetime', 'email', 'orcid', '*'],
    datetime: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:widget': 'text',
      'ui:title': 'datetime',
    },
    email: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'email',
    },
    method: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'method',
    },
    orcid: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'orcid',
    },
    source: { 'ui:FieldTemplate': ObjectPropertyFieldTemplate },
    internal_uid: { 'ui:widget': 'hidden' },
    submission_number: { 'ui:widget': 'hidden' },
  },
  legacy_creation_date: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:widget': 'text',
    'ui:title': 'legacy creation date',
    'ui:options': { readonly: true },
  },
  legacy_version: {
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:title': 'legacy version',
    'ui:options': { readonly: true },
  },
  _export_to: {
    'ui:title': 'export to',
    'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
    'ui:order': ['CDS', 'HAL'],
    CDS: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'CDS',
      'ui:options': { withLabel: false },
    },
    HAL: {
      'ui:FieldTemplate': ObjectPropertyFieldTemplate,
      'ui:title': 'HAL',
      'ui:options': { withLabel: false },
    },
  },
  data: {
    'ui:ArrayFieldTemplate': DisplayAsListArrayFieldTemplate,
    'ui:ArrayFieldItemTemplate': DisplayAsListArrayFieldItemTemplate,
    'ui:title': 'data',
    items: {
      'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
      'ui:options': { label: false },
      'ui:order': ['curated_relation', 'doi', 'record'],
      curated_relation: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:title': 'curated relation',
        'ui:options': { label: false },
      },
      doi: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
        'ui:title': 'doi',
        'ui:options': { showHeader: false },
        'ui:order': ['source', 'value'],
        source: {
          'ui:FieldTemplate': ObjectPropertyFieldTemplate,
          'ui:title': 'source',
        },
        value: {
          'ui:FieldTemplate': ObjectPropertyFieldTemplate,
          'ui:title': 'value',
        },
      },
      record: {
        'ui:FieldTemplate': ObjectPropertyFieldTemplate,
        'ui:title': 'record',
        $ref: {
          'ui:widget': 'viewRecordWidget',
          'ui:options': { label: false },
        },
      },
    },
  },
  related_records: {
    'ui:title': 'related records',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'record',
        'curated_relation',
        'relation',
        'relation_freetext',
      ],
      relation: {
        'ui:placeholder': 'Relation of the linked record to this one',
      },
      record: {
        $ref: {
          'ui:widget': 'recordRef',
          'ui:placeholder': 'URL of related record',
        },
      },
      curated_relation: {
        'ui:options': { label: false },
      },
    },
  },
  record_affiliations: {
    'ui:title': 'record affiliations',
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
  figures: {
    'ui:title': 'figures',
    'ui:options': { scrollable: true },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'caption',
        'filename',
        'key',
        'label',
        'material',
        'original_url',
        'source',
        'url',
      ],
      filename: { 'ui:placeholder': 'Filename' },
      material: { 'ui:placeholder': 'Material to which the field refers' },
      original_url: { 'ui:placeholder': 'Original URL of the document' },
    },
  },
  documents: {
    'ui:title': 'documents',
    'ui:options': { scrollable: true, uploadable: true },
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': [
        'description',
        'filename',
        'fulltext',
        'hidden',
        'key',
        'material',
        'original_url',
        'source',
        'url',
      ],
      filename: { 'ui:placeholder': 'Filename' },
      material: { 'ui:placeholder': 'Material to which the field refers' },
      original_url: { 'ui:placeholder': 'Original URL of the document' },
      fulltext: {
        'ui:options': { label: false },
      },
      hidden: {
        'ui:options': { label: false },
      },
    },
  },
  _desy_bookkeeping: {
    'ui:title': 'desy bookkeeping',
    items: {
      'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
      'ui:order': ['date', 'expert', 'identifier', 'status'],
    },
  },
  self: {
    'ui:title': 'self',
    'ui:FieldTemplate': StandaloneFieldTemplate,
    'ui:options': { readonly: true },
  },
  thesis_info: {
    'ui:widget': 'hidden',
  },
  isbns: {
    'ui:widget': 'hidden',
  },
  book_series: {
    'ui:widget': 'hidden',
  },
  editions: {
    'ui:widget': 'hidden',
  },
  _files: {
    'ui:options': { readonly: true },
    'ui:widget': 'hidden',
  },
  _bucket: {
    'ui:options': { readonly: true },
    'ui:widget': 'hidden',
  },
  control_number: {
    'ui:widget': 'hidden',
  },
  $schema: {
    'ui:widget': 'hidden',
  },
};

export default literatureUiSchema;
