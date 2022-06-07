/*
 * This file is part of record-editor.
 * Copyright (C) 2019 CERN.
 *
 * record-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * record-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with record-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
 */

import { JsonEditorConfig } from 'ng2-json-editor';
import { countryCodeToName } from 'inspire-schemas';
import {
  affiliationAutocompletionConfig,
  customValidationForDateTypes,
  anchorBuilder,
} from './commons';
import { environment } from '../../../environments/environment';

export const experiments: JsonEditorConfig = {
  customFormatValidation: customValidationForDateTypes,
  menuMaxDepth: 1,
  enableAdminModeSwitch: true,
  schemaOptions: {
    alwaysShowRegExp: new RegExp('value'),
    alwaysShow: [
      'project_type',
      'long_name',
      'legacy_name',
      'accelerator',
      'experiment',
      'collaboration',
      'institutions',
      'name_variants',
      'date_proposed',
      'date_approved',
      'date_cancelled',
      'date_started',
      'date_completed',
      'inspire_categories',
      'inspire_classification',
      'description',
      'public_notes',
      '_private_notes',
      'urls',
      '_full_ingestion',
      'related_records',
      'new_record',
      'deleted_records',
      'core',
      'deleted',
    ],
    order: [
      'project_type',
      'long_name',
      'legacy_name',
      'accelerator',
      'experiment',
      'collaboration',
      'institutions',
      'name_variants',
      'date_proposed',
      'date_approved',
      'date_cancelled',
      'date_started',
      'date_completed',
      'inspire_categories',
      'inspire_classification',
      'description',
      'public_notes',
      '_private_notes',
      'urls',
      '_full_ingestion',
      'related_records',
      'new_record',
      'deleted_records',
      'core',
      'deleted',
    ],
    properties: {
      core: {
        toggleColor: '#27ae60',
      },
      deleted: {
        toggleColor: '#e74c3c',
      },
      accelerator: {
        items: {
          order: ['value', 'record'],
          properties: {
            record: {
              refFieldConfig: {
                anchorBuilder: anchorBuilder,
                displayInputField: true,
              },
            },
          },
        },
      },
      collaboration: {
        order: ['value', 'record', 'subgroup_names'],
        alwaysShow: ['value', 'record', 'subgroup_names'],
        properties: {
          record: {
            refFieldConfig: {
              anchorBuilder: anchorBuilder,
              displayInputField: true,
            },
          },
        },
      },
      institutions: {
        items: {
          order: ['value', 'record'],
          properties: {
            record: {
              refFieldConfig: {
                anchorBuilder: anchorBuilder,
                displayInputField: true,
              },
            },
            value: {
              autocompletionConfig: affiliationAutocompletionConfig,
            },
          },
        },
      },
      experiment: {
        order: ['value', 'short_name'],
        alwaysShow: ['value', 'short_name'],
      },
      inspire_categories: {
        items: {
          order: ['term', 'source'],
          alwaysShow: ['term', 'source'],
        },
      },
      urls: {
        items: {
          order: ['value', 'description'],
        },
      },
      deleted_records: {
        items: {
          refFieldConfig: {
            anchorBuilder: anchorBuilder,
            displayInputField: true,
          },
        },
      },
      related_records: {
        items: {
          order: [
            'record',
            'curated_relation',
            'relation',
            'relation_freetext',
          ],
          alwaysShow: ['record', 'relation'],
          properties: {
            record: {
              refFieldConfig: {
                anchorBuilder: anchorBuilder,
                displayInputField: true,
              },
            },
          },
        },
      },
      new_record: {
        disabled: true,
      },
      $schema: {
        hidden: true,
      },
      _collections: {
        hidden: true,
      },
      self: {
        hidden: true,
      },
      control_number: {
        hidden: true,
      },
      external_system_identifiers: {
        hidden: true,
      },
      legacy_creation_date: {
        hidden: true,
      },
      legacy_version: {
        hidden: true,
      },
    },
  },
};
