import { UiSchema } from '@rjsf/utils';

const literatureUiSchema: UiSchema = {
  'ui:submitButtonOptions': { norender: true },
  'ui:order': [
    'curated',
    'core',
    'citeable',
    'refereed',
    'withdrawn',
    'deleted',
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
    'collaborations',
    'accelerator_experiments',
    'authors',
    'corporate_author',
    '*',
  ],
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
