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

import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SearchableDropdownComponent } from '../searchable-dropdown';

import { SchemaValidationService } from '../shared/services';

@Component({
  selector: 'primitive-field',
  directives: [SearchableDropdownComponent],
  providers: [SchemaValidationService],
  styles: [
    require('./primitive-field.component.scss')
  ],
  template: require('./primitive-field.component.html')
})
export class PrimitiveFieldComponent {

  @Input() value: string | number | boolean;
  @Input() schema: Object;
  error: Error;

  @Output() onValueChange = new EventEmitter<any>();

  constructor(private schemaValidationService: SchemaValidationService) {

  }

  onModelChange(event: any) {
    // Validation
    if (this.schema['type'] === 'string' && this.schema['enum'] == null) {
      try {
        this.schemaValidationService.validateStringValue(event.toString(), this.schema);
      } catch (error) {
        console.error(error);
      }
    }
    // TODO: should we make the change even if it is not validated
    this.onValueChange.emit(event);
  }

  get valueType(): string {
    return typeof this.value;
  }

  ngOnInit() {
    // TODO: remove default after flattened records' schema problem is resolved
   this.schema = this.schema || {}
  }
}