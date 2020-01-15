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
import { customValidationForDateTypes } from './commons';
import { environment } from '../../../environments/environment';
import { ISO_COUNTRY_MAP } from '../constants';

export const conferences: JsonEditorConfig = {
  customFormatValidation: customValidationForDateTypes,
  menuMaxDepth: 1,
  enableAdminModeSwitch: true,
  schemaOptions: {
    alwaysShowRegExp: new RegExp('value'),
    alwaysShow: [
      'titles',
      'acronyms',
      'addresses',
      'cnum',
      'opening_date',
      'closing_date',
      'series',
      'urls',
      'contact_details',
      'short_description',
      'public_notes',
      '_private_notes',
      'alternative_titles',
      'inspire_categories',
      'keywords',
      'deleted'
    ],
    order: [
      'titles',
      'acronyms',
      'addresses',
      'cnum',
      'opening_date',
      'closing_date',
      'series',
      'urls',
      'contact_details',
      'short_description',
      'public_notes',
      '_private_notes',
      'alternative_titles',
      'inspire_categories',
      'keywords',
      'core',
      'deleted',
    ],
    properties: {
      core: {
        toggleColor: '#27ae60'
      },
      deleted: {
        toggleColor: '#e74c3c'
      },
      titles: {
        items: {
          alwaysShow: [
            'title',
          ],
          order: [
            'title',
          ]
        }
      },
      series: {
        items: {
          alwaysShow: [
            'name'
          ],
          order: [
            'name'
          ],
          properties: {
            name: {
              autocompletionConfig: {
                url: `${environment.baseUrl}/api/conferences/_suggest?series_name=`,
                path: '/series_name/0/options',
                optionField: '/text',
                size: 10,
              }
            }
          }
        }
      },
      inspire_categories: {
        items: {
          alwaysShow: [
            'term'
          ],
          order: [
            'term'
          ]
        }
      },
      addresses: {
        items: {
          properties: {
            country_code: {
              enumDisplayValueMap: ISO_COUNTRY_MAP
            }
          }
        }
      },
      cnum: {
        disabled: true,
      },
      $schema: {
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
      new_record: {
        hidden: true,
      },
      deleted_record: {
        hidden: true,
      },
    }
  }
};
