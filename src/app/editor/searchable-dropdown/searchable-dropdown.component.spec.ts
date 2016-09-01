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

import { provide } from '@angular/core';
import { TestComponentBuilder } from '@angular/compiler/testing';
import {
  ComponentFixture,
  inject
} from '@angular/core/testing';

import { SearchableDropdownComponent } from './searchable-dropdown.component';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { FilterByPrefixPipe } from '../shared/pipes';

// fixed value returned by the pipe.
const filterResults = ['FilteredByPrefix'];

class MockFilterByPrefixPipe extends FilterByPrefixPipe {

  transform(array: Array<string>, prefix: string): Array<string> {
    return filterResults;
  }
}

describe('SearchableDropdownComponent', () => {

  const providers = [...DROPDOWN_DIRECTIVES,
    provide(FilterByPrefixPipe, { useClass: MockFilterByPrefixPipe })];
  let fixture: ComponentFixture<SearchableDropdownComponent>;
  let component: SearchableDropdownComponent;
  let nativeEl: HTMLElement;
  let inputEl: HTMLInputElement;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    fixture = tcb
      .overrideProviders(SearchableDropdownComponent, providers)
      .createSync(SearchableDropdownComponent);
    component = fixture.componentInstance;
    component.value = 'default';
    component.items = [];
    fixture.detectChanges();

    nativeEl = fixture.nativeElement;
    inputEl = nativeEl
      .querySelector('input, textarea') as HTMLInputElement;
  }));

  it('should map shortcut to correct value when pressed enter', () => {
    component.shortcutMap = {
      s: 'shortcut'
    };

    // input change, to update component.prefix;
    inputEl.value = 's';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // trigger Enter key press
    let enterPressedEvent = new Event('keypress');
    enterPressedEvent['key'] = 'Enter';
    inputEl.dispatchEvent(enterPressedEvent);

    expect(component.value).toEqual('shortcut');
  });

  it('should show all if prefix is empty', () => {
    // set enum.items
    let items = ['First', 'Second'];
    component.items = items;
    fixture.detectChanges();

    let dropdownItems = nativeEl.querySelectorAll('.dropdown-item');
    for (let i = 0; i < dropdownItems.length; i++) {
      expect(dropdownItems.item(i).textContent).toEqual(items[i]);
    }
  });

  it('should show filtered items by pipe if prefix is not empty', () => {
    inputEl.value = 'anything';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    let items = filterResults;
    let dropdownItems = nativeEl.querySelectorAll('.dropdown-item');
    for (let i = 0; i < dropdownItems.length; i++) {
      expect(dropdownItems.item(i).textContent).toEqual([i]);
    }
  });
});
