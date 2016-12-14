import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';

import * as _ from 'lodash';

@Injectable()
export class AppConfig {

  static CONFIGS: Object = {
    hep: {
      default: {
        schemaOptions: {
          '$schema': {
            x_editor_hidden: true
          },
          'control_number': {
            x_editor_disabled: true
          },
          'abstracts.items.properties.value': {
            x_editor_priority: 1
          },
          'abstracts.items.properties.source': {
            x_editor_autocomplete: {
              url: `${environment.baseUrl}/api/literature/_suggest?abstract_source=`,
              path: 'abstract_source.0.options',
              size: 5
            }
          },
          'accelerator_experiments.items.properties.experiment': {
            x_editor_autocomplete: {
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
            x_editor_ref_config: {
              template: '<span>{{(context | async)?.metadata.titles[0].title}}</span>',
              lazy: false,
              headers: [
                { name: 'Accept', value: 'application/json' }
              ]
            }
          },
          'arxiv_eprints.items.properties.value': {
            x_editor_priority: 1
          },
          'authors.items.properties.affiliations.items.properties.curated_relation': {
            x_editor_hidden: true
          },
          'authors.items.properties.affiliations.items.properties.record': {
            x_editor_hidden: true
          },
          'authors.items.properties.affiliations.items.properties.value': {
            x_editor_priority: 1
          },
          'authors.items.properties.full_name': {
            x_editor_priority: 1
          },
          'authors.items.properties.affiliations': {
            x_editor_priority: 2
          },
          'authors.items.properties.curated_relation': {
            x_editor_hidden: true
          },
          'authors.items.properties.uuid': {
            x_editor_hidden: true
          },
          'authors.items.properties.record': {
            x_editor_hidden: true
          },
          'collaboration.items.properties.record': {
            x_editor_hidden: true
          },
          'dois.items.properties.value': {
            x_editor_priority: 1
          },
          'external_system_numbers.items.properties.value': {
            x_editor_priority: 1
          },
          'hidden_notes.items.properties.value': {
            x_editor_priority: 1
          },
          'isbns.items.properties.value': {
            x_editor_priority: 1
          },
          'keywords.items.properties.keyword': {
            x_editor_priority: 1
          },
          'persistent_identifiers.items.properties.value': {
            x_editor_priority: 1
          },
          'public_notes.items.properties.value': {
            x_editor_priority: 1
          },
          'publication_info.items.properties.conference_record': {
            x_editor_hidden: true
          },
          'publication_info.items.properties.curated_relation': {
            x_editor_hidden: true
          },
          'publication_info.items.properties.parent_record': {
            x_editor_hidden: true
          },
          'publication_info.items.properties.journal_record': {
            x_editor_hidden: true
          },
          'publication_info.items.properties.journal_title': {
            x_editor_priority: 1
          },
          'publication_info.items.properties.journal_volume': {
            x_editor_priority: 2
          },
          'publication_info.items.properties.page_start': {
            x_editor_priority: 3
          },
          'publication_info.items.properties.page_end': {
            x_editor_priority: 4
          },
          'publication_info.items.properties.year': {
            x_editor_priority: 5
          },
          'report_numbers.items.properties.value': {
            x_editor_priority: 1
          },
          'self': {
            x_editor_hidden: true
          },
          'titles.items.properties.title': {
            x_editor_priority: 1
          },
          'urls.items.properties.value': {
            x_editor_priority: 1
          }
        }
      },
      article: {
        schemaOptions: {
          'abstracts': {
            x_editor_always_show: true
          },
          'abstracts.items.properties.value': {
            x_editor_always_show: true
          },
          'accelerator_experiments': {
            x_editor_always_show: true
          },
          'accelerator_experiments.items.properties.experiment': {
            x_editor_always_show: true
          },
          'authors': {
            x_editor_always_show: true
          },
          'authors.items.properties.affiliations': {
            x_editor_always_show: true
          },
          'authors.items.properties.affiliations.items.properties.value': {
            x_editor_always_show: true
          },
          'authors.items.properties.emails': {
            x_editor_always_show: true
          },
          'authors.items.properties.full_name': {
            x_editor_always_show: true
          },
          'collaboration': {
            x_editor_always_show: true
          },
          'collaboration.items.properties.value': {
            x_editor_always_show: true
          },
          'copyright': {
            x_editor_always_show: true
          },
          'copyright.items.properties.statement': {
            x_editor_always_show: true
          },
          'copyright.items.properties.url': {
            x_editor_always_show: true
          },
          'hidden_notes': {
            x_editor_always_show: true
          },
          'hidden_notes.items.properties.value': {
            x_editor_always_show: true
          },
          'imprints': {
            x_editor_always_show: true
          },
          'imprints.items.properties.date': {
            x_editor_always_show: true
          },
          'keywords': {
            x_editor_always_show: true
          },
          'keywords.items.properties.keyword': {
            x_editor_always_show: true
          },
          'keywords.items.properties.classification_scheme': {
            x_editor_always_show: true
          },
          'languages': {
            x_editor_always_show: true
          },
          'license': {
            x_editor_always_show: true
          },
          'licence.items.properties.license': {
            x_editor_always_show: true
          },
          'license.items.properties.url': {
            x_editor_always_show: true
          },
          'page_nr': {
            x_editor_always_show: true
          },
          'persistent_identifiers': {
            x_editor_always_show: true
          },
          'persistent_identifiers.items.properties.type': {
            x_editor_always_show: true
          },
          'persistent_identifiers.items.properties.value': {
            x_editor_always_show: true
          },
          'public_notes': {
            x_editor_always_show: true
          },
          'publication_info': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.journal_title': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.journal_volume': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.journal_issue': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.artid': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.notes': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.cnum': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.year': {
            x_editor_always_show: true
          },
          'publication_info.items.properties.confpaper_info': {
            x_editor_always_show: true
          },
          'titles': {
            x_editor_always_show: true
          },
          'titles.items.properties.title': {
            x_editor_always_show: true
          },
          'title_translations': {
            x_editor_always_show: true
          },
          'title_translations.items.properties.title': {
            x_editor_always_show: true
          },
          'urls': {
            x_editor_always_show: true
          },
          'urls.items.properties.value': {
            x_editor_always_show: true
          },
          'urls.items.properties.descriptionw': {
            x_editor_always_show: true
          }
        }
      }
    }
  };

  apiUrl(pidType: string, pidValue: string): string {
    return `${environment.baseUrl}/api/${pidType}/${pidValue}/db`;
  }

  getConfigForRecord(record: Object): EditorConfig {
    let recordType = this.getRecordType(record);
    if (recordType === 'hep') {
      let hepType = this.getHepType(record);
      return _.merge(AppConfig.CONFIGS[recordType]['default'], AppConfig.CONFIGS[recordType][hepType]);
    } else {
      return AppConfig.CONFIGS[recordType];
    }
  }

  private getHepType(record: Object): string {
    let collections: Array<{ primary: string }> = record['collections'];
    return collections.map(collection => collection.primary)
      .find(primary => AppConfig.CONFIGS['hep'][primary]);
  }

  private getRecordType(record: Object): string {
    let schemaUrl: string = record['$schema'];
    let typeWithFileExt = schemaUrl.split('/').pop();
    return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
  }
}
