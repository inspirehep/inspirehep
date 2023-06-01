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
import { customValidationForDateTypes, anchorBuilder } from './commons';
import { environment } from '../../../environments/environment';

export const institutions: JsonEditorConfig = {
  customFormatValidation: customValidationForDateTypes,
  menuMaxDepth: 1,
  enableAdminModeSwitch: true,
  schemaOptions: {
    alwaysShowRegExp: new RegExp('value'),
    alwaysShow: [
      'ICN',
      '_private_notes',
      'addresses',
      'core',
      'deleted',
      'deleted_records',
      'external_system_identifiers',
      'extra_words',
      'historical_data',
      'inactive',
      'inspire_categories',
      'institution_hierarchy',
      'institution_type',
      'legacy_ICN',
      'name_variants',
      'public_notes',
      'related_records',
      'urls',
    ],
    order: [
      'legacy_ICN',
      'ICN',
      'institution_type',
      'institution_hierarchy',
      'addresses',
      'name_variants',
      'extra_words',
      'deleted_records',
      'external_system_identifiers',
      'historical_data',
      'inspire_categories',
      '_private_notes',
      'public_notes',
      'urls',
      'related_records',
      'core',
      'inactive',
      'deleted',
    ],
    properties: {
      core: {
        toggleColor: '#27ae60',
      },
      deleted: {
        toggleColor: '#e74c3c',
      },
      inactive: {
        toggleColor: '#f1c40f',
      },
      inspire_categories: {
        items: {
          alwaysShow: ['term'],
          order: ['term'],
        },
      },
      addresses: {
        items: {
          order: [
            'postal_address',
            'postal_code',
            'cities',
            'state',
            'country_code',
            'place_name',
          ],
          properties: {
            country_code: {
              enumDisplayValueMap: countryCodeToName,
            },
            longitude: {
              hidden: true,
            },
            latitude: {
              hidden: true,
            },
          },
        },
      },
      external_system_identifiers: {
        items: {
          anyOf: [
            {
              order: ['value', 'schema'],
              alwaysShow: ['schema'],
            },
          ],
        },
      },
      institution_hierarchy: {
        items: {
          order: ['name', 'acronym'],
          alwaysShow: ['name', 'acronym'],
        },
      },
      name_variants: {
        items: {
          order: ['value'],
        },
      },
      urls: {
        items: {
          order: ['value', 'description'],
        },
      },
      public_notes: {
        items: {
          order: ['value'],
        },
      },
      _private_notes: {
        items: {
          order: ['value'],
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
      legacy_creation_date: {
        hidden: true,
      },
      legacy_version: {
        hidden: true,
      },
    },
  },
};
