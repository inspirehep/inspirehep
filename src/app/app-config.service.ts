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
          '$schema': {
            hidden: true
          },
          'control_number': {
            disabled: true
          },
          'abstracts.items.properties.value': {
            priority: 1
          },
          'abstracts.items.properties.source': {
            autocompletionConfig: {
              url: `${environment.baseUrl}/api/literature/_suggest?abstract_source=`,
              path: 'abstract_source.0.options',
              size: 5
            }
          },
          'accelerator_experiments.items.properties.experiment': {
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
          'accelerator_experiments.items.properties.record': {
            refFieldConfig: {
              template: '<span>{{(context | async)?.metadata.titles[0].title}}</span>',
              lazy: false,
              headers: [
                { name: 'Accept', value: 'application/json' }
              ]
            }
          },
          'arxiv_eprints.items.properties.value': {
            priority: 1
          },
          'authors.items.properties.affiliations.items.properties.curated_relation': {
            hidden: true
          },
          'authors.items.properties.affiliations.items.properties.record': {
            hidden: true
          },
          'authors.items.properties.affiliations.items.properties.value': {
            priority: 1
          },
          'authors.items.properties.full_name': {
            priority: 1
          },
          'authors.items.properties.affiliations': {
            priority: 2
          },
          'authors.items.properties.curated_relation': {
            hidden: true
          },
          'authors.items.properties.uuid': {
            hidden: true
          },
          'authors.items.properties.record': {
            hidden: true
          },
          'collaboration.items.properties.record': {
            hidden: true
          },
          'dois.items.properties.value': {
            priority: 1
          },
          'external_system_numbers.items.properties.value': {
            priority: 1
          },
          'hidden_notes.items.properties.value': {
            priority: 1
          },
          'isbns.items.properties.value': {
            priority: 1
          },
          'keywords.items.properties.keyword': {
            priority: 1
          },
          'persistent_identifiers.items.properties.value': {
            priority: 1
          },
          'public_notes.items.properties.value': {
            priority: 1
          },
          'publication_info.items.properties.conference_record': {
            hidden: true
          },
          'publication_info.items.properties.curated_relation': {
            hidden: true
          },
          'publication_info.items.properties.parent_record': {
            hidden: true
          },
          'publication_info.items.properties.journal_record': {
            hidden: true
          },
          'publication_info.items.properties.journal_title': {
            priority: 1
          },
          'publication_info.items.properties.journal_volume': {
            priority: 2
          },
          'publication_info.items.properties.page_start': {
            priority: 3
          },
          'publication_info.items.properties.page_end': {
            priority: 4
          },
          'publication_info.items.properties.year': {
            priority: 5
          },
          'report_numbers.items.properties.value': {
            priority: 1
          },
          'self': {
            hidden: true
          },
          'titles.items.properties.title': {
            priority: 1
          },
          'urls.items.properties.value': {
            priority: 1
          }
        },
        enableAdminModeSwitch: true
      },
      article: {
        schemaOptions: {
          'abstracts': {
            alwaysShow: true
          },
          'abstracts.items.properties.value': {
            alwaysShow: true
          },
          'accelerator_experiments': {
            alwaysShow: true
          },
          'accelerator_experiments.items.properties.experiment': {
            alwaysShow: true
          },
          'authors': {
            alwaysShow: true
          },
          'authors.items.properties.affiliations': {
            alwaysShow: true
          },
          'authors.items.properties.affiliations.items.properties.value': {
            alwaysShow: true
          },
          'authors.items.properties.emails': {
            alwaysShow: true
          },
          'authors.items.properties.full_name': {
            alwaysShow: true
          },
          'collaboration': {
            alwaysShow: true
          },
          'collaboration.items.properties.value': {
            alwaysShow: true
          },
          'copyright': {
            alwaysShow: true
          },
          'copyright.items.properties.statement': {
            alwaysShow: true
          },
          'copyright.items.properties.url': {
            alwaysShow: true
          },
          'hidden_notes': {
            alwaysShow: true
          },
          'hidden_notes.items.properties.value': {
            alwaysShow: true
          },
          'imprints': {
            alwaysShow: true
          },
          'imprints.items.properties.date': {
            alwaysShow: true
          },
          'keywords': {
            alwaysShow: true
          },
          'keywords.items.properties.keyword': {
            alwaysShow: true
          },
          'keywords.items.properties.classification_scheme': {
            alwaysShow: true
          },
          'languages': {
            alwaysShow: true
          },
          'license': {
            alwaysShow: true
          },
          'licence.items.properties.license': {
            alwaysShow: true
          },
          'license.items.properties.url': {
            alwaysShow: true
          },
          'page_nr': {
            alwaysShow: true
          },
          'persistent_identifiers': {
            alwaysShow: true
          },
          'persistent_identifiers.items.properties.type': {
            alwaysShow: true
          },
          'persistent_identifiers.items.properties.value': {
            alwaysShow: true
          },
          'public_notes': {
            alwaysShow: true
          },
          'publication_info': {
            alwaysShow: true
          },
          'publication_info.items.properties.': {
            alwaysShow: true
          },
          'publication_info.items.properties.journal_title': {
            alwaysShow: true
          },
          'publication_info.items.properties.journal_volume': {
            alwaysShow: true
          },
          'publication_info.items.properties.journal_issue': {
            alwaysShow: true
          },
          'publication_info.items.properties.artid': {
            alwaysShow: true
          },
          'publication_info.items.properties.notes': {
            alwaysShow: true
          },
          'publication_info.items.properties.cnum': {
            alwaysShow: true
          },
          'publication_info.items.properties.year': {
            alwaysShow: true
          },
          'publication_info.items.properties.confpaper_info': {
            alwaysShow: true
          },
          'titles': {
            alwaysShow: true
          },
          'titles.items.properties.title': {
            alwaysShow: true
          },
          'title_translations': {
            alwaysShow: true
          },
          'title_translations.items.properties.title': {
            alwaysShow: true
          },
          'urls': {
            alwaysShow: true
          },
          'urls.items.properties.value': {
            alwaysShow: true
          },
          'urls.items.properties.descriptionw': {
            alwaysShow: true
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
    let collections: Array<{ primary: string }> = record['collections'];
    return collections.map(collection => collection.primary)
      .find(primary => this.jsonEditorConfigs['hep'][primary] !== undefined);
  }

  private getRecordType(record: Object): string {
    let schemaUrl: string = record['$schema'];
    let typeWithFileExt = schemaUrl.split('/').pop();
    return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
  }
}
