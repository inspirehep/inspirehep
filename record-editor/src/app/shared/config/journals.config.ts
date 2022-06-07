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
import { customValidationForDateTypes, anchorBuilder } from './commons';
import { environment } from '../../../environments/environment';

export const journals: JsonEditorConfig = {
  customFormatValidation: customValidationForDateTypes,
  menuMaxDepth: 1,
  enableAdminModeSwitch: true,
  schemaOptions: {
    alwaysShowRegExp: new RegExp('value'),
    alwaysShow: [
      '_private_notes',
      'date_ended',
      'date_started',
      'deleted_records',
      'doi_prefixes',
      'inspire_categories',
      'issns',
      'journal_title',
      'legacy_creation_date',
      'license',
      'new_record',
      'public_notes',
      'publisher',
      'related_records',
      'short_title',
      'title_variants',
      'urls',
    ],
    order: [
      'short_title',
      'journal_title',
      'title_variants',
      'issns',
      'doi_prefixes',
      'publisher',
      'public_notes',
      'date_started',
      'date_ended',
      '_private_notes',
      'inspire_categories',
      'legacy_creation_date',
      'license',
      'urls',
      'new_record',
      'deleted_records',
      'related_records',
      'refereed',
      'proceedings',
      'book_series',
      'deleted',
    ],
    properties: {
      refereed: {
        toggleColor: '#34495e',
      },
      proceedings: {
        toggleColor: '#f1c40f',
      },
      book_series: {
        toggleColor: '#8e44ad',
      },
      deleted: {
        toggleColor: '#e74c3c',
      },
      journal_title: {
        items: {
          alwaysShow: ['title'],
        },
      },
      inspire_categories: {
        items: {
          properties: {
            term: {
              priority: 1,
            },
          },
        },
      },
      issns: {
        items: {
          alwaysShow: ['medium'],
          order: ['value', 'medium'],
        },
      },
      license: {
        items: {
          alwaysShow: ['license', 'url'],
        },
      },
      _private_notes: {
        items: {
          order: ['value'],
        },
      },
      public_notes: {
        items: {
          order: ['value'],
        },
      },
      urls: {
        items: {
          alwaysShow: ['description'],
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
    },
  },
};
