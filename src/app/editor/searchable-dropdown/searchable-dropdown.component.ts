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

import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { FilterByPrefixPipe } from '../shared/pipes';

@Component({
  selector: 'searchable-dropdown',
  directives: [DROPDOWN_DIRECTIVES],
  pipes: [FilterByPrefixPipe],
  styles: [
    require('./searchable-dropdown.component.scss')
  ],
  template: require('./searchable-dropdown.component.html')
})
export class SearchableDropdownComponent {

  @Input() items: Array<string>;
  @Input() shortcutMap: Object;
  @Input() value: string;
  prefix: string = '';
  status: { isOpen: boolean } = { isOpen: false };

  @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();

  onPrefixChange(prefix: string) {
    this.prefix = prefix;
  }

  onItemClick(item: string) {
    this.value = item;
    this.onSelect.emit(item);
  }

  onKeypress(key: string) {
    if (key === 'Enter') {
      this.status.isOpen = false;
      if (this.shortcutMap && this.shortcutMap[this.prefix]) {
        this.onItemClick(this.shortcutMap[this.prefix]);
      }
      this.prefix = '';
    }
  }

}
