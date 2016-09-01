/*
 * This file is part of record-editor.
 * Copyright (C) 2016 CERN.
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

import { addProviders, inject } from '@angular/core/testing';

import { SchemaValidationService } from './schema-validation.service';

describe('SchemaValidationService', () => {

  const schema = { 'type': 'string', 'pattern': '[0-9]' };

  let service: SchemaValidationService;

  beforeEach(() => addProviders([SchemaValidationService]));

  beforeEach(inject([SchemaValidationService], (schemaValidationService) => {
    service = schemaValidationService;
  }));

  it('should validate pattern correctly', () => {
    let value = '1';
    expect(() => service.validateStringValue('1', schema)).not.toThrowError();
    expect(() => service.validateStringValue('a', schema)).toThrowError();
  });
});
