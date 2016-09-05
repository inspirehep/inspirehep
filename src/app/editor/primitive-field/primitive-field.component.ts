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

import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { AbstractFieldComponent } from '../abstract-field';
import { AutocompleteInputComponent } from '../autocomplete-input';
import { SearchableDropdownComponent } from '../searchable-dropdown';

import { ErrorsToMessagesHtmlPipe } from '../shared/pipes';
import {
  AppGlobalsService,
  ComponentTypeService,
  SchemaValidationService
} from '../shared/services';

@Component({
  selector: 'primitive-field',
  encapsulation: ViewEncapsulation.None,
  directives: [TOOLTIP_DIRECTIVES, AutocompleteInputComponent, SearchableDropdownComponent],
  pipes: [ErrorsToMessagesHtmlPipe],
  providers: [ComponentTypeService, SchemaValidationService],
  styles: [
    require('./primitive-field.component.scss')
  ],
  template: require('./primitive-field.component.html')
})
export class PrimitiveFieldComponent extends AbstractFieldComponent {

  @Input() value: string | number | boolean;
  @Input() schema: Object;
  @Input() path: string;
  valueType: string;

  @Output() onValueChange = new EventEmitter<any>();

  constructor(private schemaValidationService: SchemaValidationService,
    private componentTypeService: ComponentTypeService,
    public appGlobalsService: AppGlobalsService) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.schema = this.schema || {};
    this.valueType = this.componentTypeService.getComponentType(this.schema);
  }

  onModelChange(event: any) {
    // Validation
    if (this.schema['type'] === 'string' && this.schema['enum'] === undefined) {
      try {
        this.schemaValidationService.validateStringValue(event.toString(), this.schema);
      } catch (error) {
        console.error(error);
      }
    }
    // TODO: should we make the change even if it is not validated
    this.value = event;
    this.onValueChange.emit(event);
  }

}
