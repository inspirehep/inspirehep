import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';

import { JsonEditorConfig } from 'ng2-json-editor';

import * as _ from 'lodash';

@Injectable()
export class AppConfigService {

  jsonEditorConfigs: { [recordType: string]: { [subType: string]: JsonEditorConfig } } = {
    hep: {
      default: {
        schemaOptions: {
          '': {
            order: [
              'document_type',
              'publication_type',
              'report_numbers',
              'special_collections',
              'languages',
              'titles',
              'title_translations',
              'dois',
              'arxiv_eprints',
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
              'inspire_categories',
              'keywords',
              'energy_ranges',
              'copyright',
              'license',
              'funding_info',
              '_private_notes',
              'urls',
              'succeeding_entry',
              'new_record',
              'deleted_records',
              'acquisition_source',
              'legacy_creation_date',
              'core',
              'citeable',
              'refereed',
              'withdrawn',
              'deleted'
            ],
            alwaysShow: [
              'core',
              'citeable',
              'refereed',
              'withdrawn',
              'deleted'
            ]
          },
          '/deleted': {
            toggleColor: '#e74c3c'
          },
          '/citeable': {
            toggleColor: '#3498db'
          },
          '/core': {
            toggleColor: '#27ae60'
          },
          '/withdrawn': {
            toggleColor: '#f1c40f'
          },
          '/$schema': {
            hidden: true
          },
          '/control_number': {
            hidden: true
          },
          '/_collections': {
            hidden: true
          },
          '/self': {
            hidden: true
          },
          '/texkeys': {
            disabled: true
          },
          '/abstracts/items/properties/value': {
            priority: 1
          },
          '/abstracts/items/properties/source': {
            autocompletionConfig: {
              url: `${environment.baseUrl}/api/literature/_suggest?abstract_source=`,
              path: 'abstract_source.0.options',
              size: 5
            }
          },
          '/accelerator_experiments/items/properties/experiment': {
            autocompletionConfig: {
              url: `${environment.baseUrl}/api/experiments/_suggest?experiment=`,
              path: 'experiment.0.options',
              size: 5,
              onCompletionSelect: (path, completion, store) => {
                path.splice(-1, 1, 'record', '$ref');
                store.setIn(path, completion.payload['$ref']);
                path.splice(-2, 2, 'curated_relation');
                store.setIn(path, true);
              }
            }
          },
          '/accelerator_experiments/items/properties/record': {
            refFieldConfig: {
              template: '<span>{{(context | async)?.metadata.titles[0].title}}</span>',
              lazy: false,
              headers: [
                { name: 'Accept', value: 'application/json' }
              ]
            }
          },
          '/abstracts/items': {
            alwaysShow: ['value']
          },
          '/accelerator_experiments/items': {
            alwaysShow: ['experiment'],
            order: ['institution', 'accelerator', 'experiment', 'legacy_name']
          },
          '/acquisition_source/properties': {
            disabled: true,
            order: ['method', 'source', 'date', 'email', 'orcid'],
          },
          '/acquisition_source/properties/internal_uid': {
            hidden: true
          },
          '/acquisition_source/properties/submission_number': {
            hidden: true
          },
          '/authors/items': {
            order: ['full_name', 'alternative_names', 'affiliations', 'raw_affiliations', 'emails', 'ids', 'inspire_roles', 'credit_roles']
          },
          '/authors/items/properties/uuid': {
            hidden: true
          },
          '/authors/items/properties/affiliations/items': {
            alwaysShow: ['value']
          },
          '/arxiv_eprints/items': {
            order: ['value']
          },
          '/arxiv_eprints/items/properties/value': {
            disabled: true
          },
          '/collaborations/items': {
            alwaysShow: ['value'],
            order: ['value']
          },
          '/copyright/items': {
            alwaysShow: ['statement', 'url']
          },
          '/dois/items': {
            order: ['value', 'material', 'source']
          },
          '/dois/items/properties/value': {
            disabled: true
          },
          '/external_system_identifiers/items': {
            order: ['value']
          },
          '/_private_notes/items': {
            alwaysShow: ['value'],
            order: ['value']
          },
          '/imprints/items': {
            alwaysShow: ['date'],
            order: ['publisher', 'place', 'date']
          },
          '/isbns/items': {
            order: ['value']
          },
          '/keywords/items': {
            alwaysShow: ['schema', 'value']
          },
          '/license/items': {
            alwaysShow: ['license', 'url']
          },
          '/persistent_identifiers/items': {
            alwaysShow: ['value'],
            order: ['value', 'schema', 'material', 'source']
          },
          '/publication_info/items': {
            alwaysShow: ['journal_title', 'journal_volume', 'journal_issue', 'artid', 'cnum', 'year'],
            order: ['journal_title', 'journal_volume', 'journal_issue', 'year', 'page_start', 'page_end', 'artid']
          },
          '/references': {
            longListNavigatorConfig: {
              findSingle: (value, expression) => {
                return value.getIn(['reference', 'number']) === parseInt(expression, 10);
              },
              findMultiple: (value, expression) => {
                return JSON.stringify(value).search(expression) > -1;
              },
              itemsPerPage: 5,
              maxVisiblePageCount: 5
            }
          },
          '/thesis_info/properties/degree_type': {
            priority: 1
          },
          '/titles/items': {
            alwaysShow: ['title'],
            order: ['title']
          },
          '/title_translations/items': {
            alwaysShow: ['title'],
            order: ['title', 'subtitle', 'language', 'source']
          },
          '/keywords/items/properties/value': {
            priority: 1
          },
          '/license/items/properties/license': {
            priority: 1
          },
          '/public_notes/items': {
            order: ['value']
          },
          '/report_numbers/items': {
            order: ['value']
          },
          '/references/items/properties/reference': {
            priority: 1,
            order: ['number', 'titles', 'authors', 'arxiv_eprints']
          },
          '/urls/items': {
            alwaysShow: ['value', 'description']
          }
        },
        tabsConfig: {
          defaultTabName: 'Main',
          tabs: [
            {
              name: 'References',
              properties: ['references']
            },
            {
              name: 'Authors',
              properties: [
                'collaborations',
                'accelerator_experiments',
                'authors',
                'corporate_author'
              ]
            }
          ]
        },
        enableAdminModeSwitch: true
      },
      thesis: {
        schemaOptions: {
          '': {
            alwaysShow: [
              'thesis_info'
            ]
          }
        }
      }
    }
  };

  apiUrl(pidType: string, pidValue: string): string {
    return `${environment.baseUrl}/api/${pidType}/${pidValue}/db`;
  }

  holdingPenApiUrl(objectId: string): string {
    return `${environment.baseUrl}/api/holdingpen/${objectId}`;
  }

  getConfigForRecord(record: Object): EditorConfig {
    let recordType = this.getRecordType(record);
    let recordTypeConfig = this.jsonEditorConfigs[recordType] || {};
    // Only hep records have sub type at the moment.
    if (recordType === 'hep') {
      let hepType = this.getHepType(record);
      return _.merge(recordTypeConfig['default'], recordTypeConfig[hepType]);
    } else {
      return recordTypeConfig['default'];
    }
  }

  private getHepType(record: Object): string {
    let document_types: Array<string> = record['document_type'];
    return document_types
      .find(primary => this.jsonEditorConfigs['hep'][primary] !== undefined);
  }

  private getRecordType(record: Object): string {
    let schemaUrl: string = record['$schema'];
    let typeWithFileExt = schemaUrl.split('/').pop();
    return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
  }
}
