import { Component, Input } from '@angular/core';
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

import { AbstractListFieldComponent } from '../abstract-list-field';
import { PrimitiveFieldComponent } from '../primitive-field';

import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { ErrorsToMessagesHtmlPipe } from '../shared/pipes';

import { AppGlobalsService, EmptyValueService } from '../shared/services';


@Component({
  selector: 'primitive-list-field',
  directives: [TOOLTIP_DIRECTIVES, PrimitiveFieldComponent],
  pipes: [ErrorsToMessagesHtmlPipe],
  providers: [EmptyValueService],
  styles: [
    require('./primitive-list-field.component.scss')
  ],
  template: require('./primitive-list-field.component.html')
})
// FIXME: this doesn't have all stuff of AbstractListFieldComponent. Maybe, it shouldn't extend it.
export class PrimitiveListFieldComponent extends AbstractListFieldComponent {

  @Input() values: Array<any>;
  @Input() schema: Object;
  @Input() path: string;

  constructor(public emptyValueService: EmptyValueService,
    public appGlobalsService: AppGlobalsService) {
    super();
  }

  /**
   * Called when any element of is changed of the values is changed
   * @override
   * 
   * It casts new value to appropriate type.
   * 
   * @param {any} event - new value
   * @param {number} index - index of changed element in array
   * 
   */
  onValueChange(event: any, index: number) {
    this.values[index] = event;
  }

  /**
   * Returns path of an element at index.
   * @override
   */
  getValuePath(index: number): string {
    return `${this.path}.${index}`;
  }
}
