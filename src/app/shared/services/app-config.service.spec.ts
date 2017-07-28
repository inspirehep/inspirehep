
/*
 * This file is part of ng2-json-editor.
 * Copyright (C) 2016 CERN.
 *
 * ng2-json-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * ng2-json-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ng2-json-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/


import { AppConfigService } from './app-config.service';
import { CommonConfigsService } from './common-configs.service';
import { FieldSplitterService } from './field-splitter.service';


describe('AppConfigService', () => {

  let service: AppConfigService;

  beforeEach(() => {
    service = new AppConfigService(new CommonConfigsService(), new FieldSplitterService());
  });

  it('should get a merged config for an hep type', () => {
    let config: any = {
      hep: {
        default: {
          schemaOptions: {
            a: 'default-a',
            b: 'default-b'
          }
        },
        anheptype: {
          schemaOptions: {
            b: 'anHepType-b',
            c: 'anHepType-c'
          }
        }
      }
    };
    service.jsonEditorConfigs = config;

    let record = {
      $schema: 'http://foo/bar/hep.json',
      document_type: [
        'foo',
        'bar',
        'anheptype'
      ]
    };

    let expectedConfig = {
      schemaOptions: {
        a: 'default-a',
        b: 'anHepType-b',
        c: 'anHepType-c'
      }
    };

    expect(service.getConfigForRecord(record)).toEqual(expectedConfig);
  });

  it('should get default config if hep type not found in CONFIGS', () => {
    let config: any = {
      hep: {
        default: {
          schemaOptions: {
            a: 'default-a',
            b: 'default-b'
          }
        }
      }
    };
    service.jsonEditorConfigs = config;

    let record = {
      $schema: 'http://foo/bar/hep.json',
      document_type: [
        'foo',
        'bar',
        'xyz'
      ]
    };

    let expectedConfig = {
      schemaOptions: {
        a: 'default-a',
        b: 'default-b'
      }
    };

    expect(service.getConfigForRecord(record)).toEqual(expectedConfig);
  });

  it('should get config for non hep schema', () => {
    let config: any = {
      notHep: {
        default: {
          schemaOptions: {
            a: 'notHep-a',
            b: 'notHep-b'
          }
        }
      }
    };
    service.jsonEditorConfigs = config;

    let record = {
      $schema: 'http://foo/bar/notHep.json'
    };

    let expectedConfig = {
      schemaOptions: {
        a: 'notHep-a',
        b: 'notHep-b'
      }
    };

    expect(service.getConfigForRecord(record)).toEqual(expectedConfig);
  });
});
