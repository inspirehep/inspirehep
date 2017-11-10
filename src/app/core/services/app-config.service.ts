import { environment } from '../../../environments/environment';

import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { JsonEditorConfig } from 'ng2-json-editor';
import * as _ from 'lodash';

import { CommonConfigsService } from './common-configs.service';

@Injectable()
export class AppConfigService {

  jsonEditorConfigs: { [recordType: string]: { [subType: string]: JsonEditorConfig } } = {
    hep: {
      default: {
        schemaOptions: {
          order: [
            'document_type',
            'publication_type',
            'report_numbers',
            '_collections',
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
            'new_record',
            'deleted_records',
            'acquisition_source',
            'legacy_creation_date',
            'collaborations',
            'accelerator_experiments',
            'authors',
            'corporate_author',
            'curated',
            'core',
            'citeable',
            'refereed',
            'withdrawn',
            'deleted'
          ],
          alwaysShow: [
            'curated',
            'citeable',
            'refereed',
            'withdrawn',
            'deleted',
            'collaborations',
            'references'
          ],
          alwaysShowRegExp: new RegExp('value'),
          properties: {
            deleted: {
              toggleColor: '#e74c3c'
            },
            citeable: {
              toggleColor: '#8e44ad'
            },
            core: {
              toggleColor: '#27ae60'
            },
            withdrawn: {
              toggleColor: '#f1c40f'
            },
            refereed: {
              toggleColor: '#34495e'
            },
            curated: {
              toggleColor: '#3498db'
            },
            $schema: {
              hidden: true
            },
            control_number: {
              hidden: true
            },
            self: {
              hidden: true
            },
            _files: {
              hidden: true
            },
            texkeys: {
              disabled: true
            },
            document_type: {
              items: {
                onValueChange: (path, documentType) => {
                  let hepConfig = _.merge(this.jsonEditorConfigs['hep']['default'], this.jsonEditorConfigs['hep'][documentType]);
                  this.onConfigChange.next(hepConfig);
                }
              }
            },
            abstracts: {
              items: {
                properties: {
                  value: {
                    priority: 1,
                    columnWidth: 80,
                    latexPreviewEnabled: true
                  },
                  source: {
                    autocompletionConfig: {
                      url: `${environment.baseUrl}/api/literature/_suggest?abstract_source=`,
                      path: '/abstract_source/0/options',
                      size: 10
                    }
                  }
                }
              }
            },
            accelerator_experiments: {
              items: {
                alwaysShow: ['experiment'],
                order: ['institution', 'accelerator', 'experiment', 'legacy_name'],
                properties: {
                  experiment: {
                    autocompletionConfig: {
                      url: `${environment.baseUrl}/api/experiments/_suggest?experiment=`,
                      path: '/experiment/0/options',
                      size: 10,
                      onCompletionSelect: (path, completion, store) => {
                        path.splice(-1, 1, 'record', '$ref');
                        store.setIn(path, completion.payload['$ref']);
                        path.splice(-2, 2, 'curated_relation');
                        store.setIn(path, true);
                      }
                    }
                  },
                  record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  }
                }
              }
            },
            acquisition_source: {
              disabled: true,
              order: ['method', 'source', 'datetime', 'email', 'orcid'],
              properties: {
                internal_uid: {
                  hidden: true
                },
                submission_number: {
                  hidden: true
                }
              }
            },
            authors: {
              longListNavigatorConfig: {
                findMultiple: this.commonConfigsService.fullTextSearch,
                itemsPerPage: 20,
                maxVisiblePageCount: 5,
                headerItemTemplateName: 'authorExtractTemplate'
              },
              sortable: true,
              items: {
                order: [
                  'ids',
                  'full_name',
                  'alternative_names',
                  'affiliations',
                  'raw_affiliations',
                  'emails',
                  'inspire_roles',
                  'credit_roles'
                ],
                alwaysShow: ['affiliations'],
                properties: {
                  uuid: {
                    hidden: true
                  },
                  signature_block: {
                    hidden: true
                  },
                  affiliations: {
                    items: {
                      order: ['value', 'record'],
                      properties: {
                        record: {
                          refFieldConfig: {
                            anchorBuilder: this.commonConfigsService.anchorBuilder
                          }
                        },
                        value: {
                          autocompletionConfig: {
                            url: `${environment.baseUrl}/api/institutions/_suggest?affiliation=`,
                            path: '/affiliation/0/options',
                            size: 20,
                            itemTemplateName: 'affiliationAutocompleteTemplate',
                            onCompletionSelect: (path, completion, store) => {
                              path.splice(-1, 1, 'record', '$ref');
                              store.setIn(path, completion.payload['$ref']);
                              path.splice(-2, 2, 'curated_relation');
                              store.setIn(path, true);
                            }
                          }
                        }
                      }
                    }
                  },
                  ids: {
                    items: {
                      anyOf: [
                        {
                          properties: {
                            value: {
                              priority: 1
                            }
                          }
                        }
                      ]
                    }
                  },
                  record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  }
                }
              }
            },
            arxiv_eprints: {
              items: {
                order: ['value'],
                properties: {
                  value: {
                    disabled: true
                  }
                }
              }
            },
            collaborations: {
              items: {
                order: ['value'],
                properties: {
                  record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  }
                }
              }
            },
            copyright: {
              items: {
                alwaysShow: ['statement', 'url']
              }
            },
            dois: {
              items: {
                order: ['value', 'material', 'source']
              }
            },
            external_system_identifiers: {
              items: {
                order: ['value']
              }
            },
            _private_notes: {
              items: {
                order: ['value']
              }
            },
            imprints: {
              items: {
                alwaysShow: ['date'],
                order: ['publisher', 'place', 'date']
              }
            },
            isbns: {
              items: {
                order: ['value']
              }
            },
            keywords: {
              items: {
                alwaysShow: ['schema'],
                properties: {
                  value: {
                    priority: 1
                  }
                }
              }
            },
            license: {
              items: {
                alwaysShow: ['license', 'url'],
              }
            },
            languages: {
              items: {
                enumDisplayValueMap: this.commonConfigsService.isoLanguageMap
              }
            },
            persistent_identifiers: {
              items: {
                order: ['value', 'schema', 'material', 'source']
              }
            },
            publication_info: {
              items: {
                alwaysShow: ['journal_title', 'journal_volume', 'journal_issue', 'artid', 'cnum', 'year', 'page_start'],
                order: ['journal_title', 'journal_volume', 'journal_issue', 'year', 'page_start', 'page_end', 'artid'],
                properties: {
                  conference_record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  },
                  journal_record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  },
                  parent_record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  }
                }
              }
            },
            references: {
              sortable: true,
              longListNavigatorConfig: {
                findSingle: (value, expression) => {
                  return value.getIn(['reference', 'label']) === expression;
                },
                findMultiple: this.commonConfigsService.fullTextSearch,
                itemsPerPage: 40,
                maxVisiblePageCount: 5,
                headerItemTemplateName: 'refExtractTemplate'
              },
              viewTemplateConfig: {
                itemTemplateName: 'referenceTemplate',
                showEditForm: (value) => {
                  return !(value.hasIn(['record', '$ref']));
                }
              },
              items: {
                properties: {
                  record: {
                    refFieldConfig: {
                      anchorBuilder: this.commonConfigsService.anchorBuilder
                    }
                  },
                  reference: {
                    priority: 1,
                    order: ['label', 'title', 'authors', 'arxiv_eprint'],
                    properties: {
                      misc: {
                        items: {
                          onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                        }
                      },
                      arxiv_eprint: {
                        onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                      },
                      authors: {
                        items: {
                          properties: {
                            full_name: {
                              onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                            },
                            inspire_role: {
                              onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                            }
                          }
                        }
                      },
                      imprint: {
                        properties: {
                          publisher: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          }
                        }
                      },
                      title: {
                        properties: {
                          title: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          }
                        }
                      },
                      dois: {
                        items: {
                          onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                        }
                      },
                      collaborations: {
                        items: {
                          onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                        }
                      },
                      isbn: {
                        onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                      },
                      report_numbers: {
                        items: {
                          onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                        }
                      },
                      publication_info: {
                        properties: {
                          journal_title: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          journal_volume: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          journal_issue: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          page_start: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          page_end: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          artid: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                          cnum: {
                            onValueChange: this.commonConfigsService.splitPrimitiveReferenceField
                          },
                        }
                      }
                    }
                  }
                }
              },
            },
            thesis_info: {
              properties: {
                degree_type: {
                  priority: 1
                }
              }
            },
            titles: {
              items: {
                alwaysShow: ['title'],
                order: ['title'],
                properties: {
                  title: {
                    latexPreviewEnabled: true
                  },
                  source: {
                    columnWidth: 12
                  }
                }
              }
            },
            title_translations: {
              items: {
                alwaysShow: ['title'],
                order: ['title', 'subtitle', 'language', 'source'],
                properties: {
                  language: {
                    enumDisplayValueMap: this.commonConfigsService.isoLanguageMap
                  }
                }
              }
            },
            inspire_categories: {
              items: {
                properties: {
                  term: {
                    priority: 1
                  }
                }
              }
            },
            public_notes: {
              items: {
                order: ['value']
              }
            },
            report_numbers: {
              items: {
                order: ['value']
              }
            },
            urls: {
              items: {
                alwaysShow: ['description']
              }
            },
            new_record: {
              refFieldConfig: {
                anchorBuilder: this.commonConfigsService.anchorBuilder
              }
            }
          }
        },
        customFormatValidation: {
          date: {
            formatChecker: (value) => {
              let formats = [
                /^\d{4}$/,
                /^\d{4}-\d{2}$/,
                /^\d{4}-\d{2}-\d{2}$/
              ];
              return formats
                .some(format => {
                  if (value.match(format)) {
                    return Date.parse(value) !== NaN;
                  }
                  return false;
                });
            }
          },
          'date-time': {
            formatChecker: (value) => {
              let regex = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i;
              if (value.match(regex)) {
                return true;
              }
              return false;
            }
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
        menuMaxDepth: 1,
        enableAdminModeSwitch: true,
        previews: [
          {
            name: 'pdf',
            type: 'html',
            getUrl: (record) => {
              let urls: Array<{ value: string }> = record['urls'];
              if (urls && urls.length > 0) {
                let url = urls.map(_url => _url.value)
                  .find(value => value.endsWith('.pdf'));
                if (url !== undefined) {
                  return url.replace('http://', '//') + '#zoom=100';
                }
              } else {
                return undefined;
              }
            }
          },
          {
            name: 'arXiv',
            type: 'html',
            getUrl: (record) => {
              let ePrints: Array<{ value: string }> = record['arxiv_eprints'];
              if (ePrints && ePrints.length > 0) {
                return `//arxiv.org/pdf/${ePrints[0].value}.pdf#zoom=100`;
              } else {
                return undefined;
              }
            }
          },
          {
            name: 'doi',
            type: 'html',
            getUrl: (record) => {
              let dois: Array<{ value: string }> = record['dois'];
              if (dois && dois.length > 0) {
                return `//dx.doi.org/${dois[0].value}`;
              } else {
                return undefined;
              }
            }
          }
        ]
      },
      thesis: {
        schemaOptions: {
          alwaysShow: [
            'thesis_info'
          ]
        }
      }
    }
  };

  readonly onConfigChange = new ReplaySubject<EditorConfig>();

  // generic url to inspire api
  readonly apiUrl = `${environment.baseUrl}/api`;
  // url to editor api
  readonly editorApiUrl = `${this.apiUrl}/editor`;
  // url to holding api
  readonly holdingpenApiUrl = `${this.apiUrl}/holdingpen`;

  constructor(private commonConfigsService: CommonConfigsService) { }

  getConfigForRecord(record: Object): EditorConfig {
    let recordType = this.getRecordType(record);
    let recordTypeConfig = this.jsonEditorConfigs[recordType] || {};
    // Only hep records have sub type at the moment.
    if (recordType === 'hep') {
      let hepType = this.getHepType(record['document_type']);
      return _.merge(recordTypeConfig['default'], recordTypeConfig[hepType]);
    } else {
      return recordTypeConfig['default'];
    }
  }

  private getHepType(documentTypes: Array<string>): string {
    return documentTypes
      .find(primary => this.jsonEditorConfigs['hep'][primary] !== undefined);
  }

  private getRecordType(record: Object): string {
    let schemaUrl: string = record['$schema'];
    let typeWithFileExt = schemaUrl.split('/').pop();
    return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
  }

}
