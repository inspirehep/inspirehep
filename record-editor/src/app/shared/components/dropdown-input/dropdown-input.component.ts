/*
 * This file is part of record-editor.
 * Copyright (C) 2017 CERN.
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

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { SubscriberComponent } from '../../classes';

@Component({
  selector: 're-dropdown-input',
  templateUrl: './dropdown-input.component.html',
  styleUrls: ['./dropdown-input.component.scss'],
})
export class DropdownInputComponent extends SubscriberComponent
  implements OnInit {
  @Input() items: Array<string> | Observable<Array<string>>;
  @Input() placeholder?: string;
  @Input() defaultValue?: string;

  // this event emitter is async to solve the ExpressionChangedAfterItHasBeenCheckedException
  @Output() valueChange = new EventEmitter<string>(true);
  @Input()
  get value(): string {
    return this._value;
  }
  set value(value: string) {
    if (value !== this._value) {
      this._value = value || this.defaultValue;
      this.valueChange.emit(this._value);
    }
  }
  private _value: string;

  filterExpression = '';

  private itemsArray: Array<string>;

  ngOnInit() {
    if (Array.isArray(this.items)) {
      this.itemsArray = this.items;
    } else {
      this.items
        .takeUntil(this.isDestroyed)
        .subscribe(itemsArray => (this.itemsArray = itemsArray));
    }

    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
  }

  onHidden() {
    this.filterExpression = '';
  }

  onDeselectClick() {
    this.value = undefined;
  }
}
