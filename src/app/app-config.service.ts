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
          '/$schema': {
            disabled: true
          },
          '/control_number': {
            disabled: true
          },
          '/self': {
            hidden: true
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
            alwaysShow: ['experiment']
          },
          '/authors/items': {
            order: ['emails', 'full_name', 'affiliations']
          },
          '/authors/items/properties/affiliations/items': {
            alwaysShow: ['value']
          },
          '/arxiv_eprints/items': {
            order: ['value']
          },
          '/collaborations/items': {
            alwaysShow: ['value']
          },
          '/copyright/items': {
            alwaysShow: ['statement', 'url']
          },
          '/dois/items': {
            order: ['value']
          },
          '/external_system_identifiers/items': {
            order: ['value']
          },
          '/_private_notes/items': {
            alwaysShow: ['value']
          },
          '/imprints/items': {
            alwaysShow: ['date']
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
            alwaysShow: ['type', 'value']
          },
          '/publication_info/items': {
            alwaysShow: ['journal_title', 'journal_volume', 'journal_issue', 'artid', 'cnum', 'year', 'confpaper_info']
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
          '/titles/items': {
            alwaysShow: ['title']
          },
          '/title_translations/items': {
            alwaysShow: ['title']
          },
          '/keywords/items/properties/value': {
            priority: 1
          },
          '/public_notes/items': {
            order: ['value']
          },
          '/report_numbers/items': {
            order: ['value']
          },
          '/urls/items': {
            alwaysShow: ['value', 'description']
          }
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
