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

export const authors: JsonEditorConfig = {
  schemaOptions: {
    order: [
      'ids',
      'name',
      'positions',
      '_private_notes',
<<<<<<< HEAD
      'email',
=======
      'email_addresses',
>>>>>>> 38370b1b (record-editor: addition of authors config)
      'status',
      'project_membership'
    ],
    properties: {
<<<<<<< HEAD
      ids: {
        properties: {
          schema: {
            items: {
              order: [
                'INSPIRE ID',
                'ORCID',
                'BAI',
                'CERN',
                'WIKIPEDIA'
              ]
            }
          }
        }
      },
=======
>>>>>>> 38370b1b (record-editor: addition of authors config)
      name: {
        order: [
          'preferred_name',
          'value',
          'title',
          'numeration',
          'name_variants',
<<<<<<< HEAD
          'native_name'
=======
          'native_names'
>>>>>>> 38370b1b (record-editor: addition of authors config)
        ]
      },
      positions: {
        items: {
          alwaysShow: [
            'current',
            'institution',
            'start_date',
            'end_date',
            'rank',
            'record',
            'hidden',
            'curated_relation'
          ],
          order: [
            'current',
            'institution',
            'start_date',
            'end_date',
            'rank',
            'record',
            'hidden',
            'curated_relation'
          ],
          properties: {
            record: {
              refFieldConfig: {
                anchorBuilder: anchorBuilder,
              },
            },
          },
        },
      },
      project_membership: {
        items: {
          order: [
            'current',
            'name',
            'start_date',
            'end_date',
            'record',
            'hidden',
            'curated_relation'
          ]
        }
      },
      advisors: {
        items: {
          alwaysShow: [
            'ids',
            'name',
            'degree_type'
          ],
          order: [
            'ids',
            'name',
            'degree_type'
          ]
        }
<<<<<<< HEAD
      }
=======
      },
      $schema: {
        hidden: true,
      },
>>>>>>> 38370b1b (record-editor: addition of authors config)
    }
  },
  customFormatValidation: customValidationForDateTypes,
};
