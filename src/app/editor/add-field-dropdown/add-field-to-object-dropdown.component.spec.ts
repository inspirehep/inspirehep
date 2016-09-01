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

import { AddFieldToObjectDropdownComponent } from './add-field-to-object-dropdown.component';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { DifferentKeysPipe } from '../shared/pipes';

import { EmptyValueService } from '../shared/services';

const schemaProperties = {
  propA: {},
  propB: {},
  propNotInValueA: {},
  propNotInValueB: {}
};
const value = {
  propA: 'A',
  propB: 'B'
};
const mockDifferentKeys = ['propNotInValueA', 'propNotInValueB'];
const emptyValue = 'empty-value';

class MockEmptyValueService extends EmptyValueService {
  generateEmptyValue(schema: Object): any {
    return emptyValue;
  }
}

describe('AddFieldToObjectDropdownComponent', () => {

  const providers = [
    ...DROPDOWN_DIRECTIVES,
    provide(EmptyValueService, { useClass: MockEmptyValueService })
  ];
  let fixture: ComponentFixture<AddFieldToObjectDropdownComponent>;
  let component: AddFieldToObjectDropdownComponent;
  let nativeEl: HTMLElement;
  let showDropdownButton: HTMLButtonElement;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    fixture = tcb
      .overrideProviders(AddFieldToObjectDropdownComponent, providers)
      .createSync(AddFieldToObjectDropdownComponent);
    component = fixture.componentInstance;
    component.value = value;
    component.schema = schemaProperties;
    fixture.detectChanges();

    nativeEl = fixture.nativeElement;
    showDropdownButton = nativeEl.querySelector('button') as HTMLButtonElement;
  }));

  it('should show different keys of schema', () => {
    showDropdownButton.dispatchEvent(new Event('click'));
    let items: Array<string> = Array.prototype
      .slice.call(nativeEl.querySelectorAll('li a'))
      .map((a: HTMLAnchorElement) => a.textContent);
    expect(items).toEqual(mockDifferentKeys);
  });

  it('should add field with empty value when dropdown item clicked', () => {
    showDropdownButton.dispatchEvent(new Event('click'));
    let anchor = nativeEl.querySelector('li a') as HTMLAnchorElement;
    expect(component.value[anchor.textContent]).toBeUndefined();
    anchor.dispatchEvent(new Event('click'));
    expect(component.value[anchor.textContent]).toEqual(emptyValue);
  });
});
