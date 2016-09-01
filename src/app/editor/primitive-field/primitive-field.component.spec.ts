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

import { TestComponentBuilder } from '@angular/compiler/testing';
import {
  ComponentFixture,
  inject
} from '@angular/core/testing';

import { PrimitiveFieldComponent } from './primitive-field.component';

import {
  AppGlobalsService,
  ComponentTypeService,
  SchemaValidationService
} from '../shared/services';

/**
 * Change input html element value
 * and dispatches/fires an input event.
 * 
 * Used to mock changing element value on UI.
 * 
 * TODO: create a test helper class for this kind of functions!
 * 
 * @param {HTMLInputElement} el - <textarea> or <input> html element
 * @param {string} value - new value to be set to el.value
 */
function changeInputElementValue(el: HTMLInputElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

describe('PrimitiveFieldComponent', () => {

  const providers: Array<any> = [AppGlobalsService, ComponentTypeService, SchemaValidationService];
  let fixture: ComponentFixture<PrimitiveFieldComponent>;
  let component: PrimitiveFieldComponent;
  let nativeEl: HTMLElement;
  let inputEl: HTMLInputElement;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    fixture = tcb
      .overrideProviders(PrimitiveFieldComponent, providers)
      .createSync(PrimitiveFieldComponent);
    component = fixture.componentInstance;

    // force component to render completely by setting @Input() manually 
    component.value = 'defaultStringValue';
    component.schema = {
      type: 'string'
    };
    fixture.detectChanges();

    // get useful elements to use in tests
    nativeEl = fixture.nativeElement;
    inputEl = nativeEl
      .querySelector('input, textarea') as HTMLInputElement;
  }));

  it('should be binded to view', () => {
    let modelValue = 'modelValue';
    component.value = modelValue;
    fixture.detectChanges();
    expect(inputEl.value).toEqual(modelValue);

    let inputValue = 'inputValue';
    changeInputElementValue(inputEl, inputValue);
    fixture.detectChanges();
    expect(component.value).toEqual(inputValue);
  });

  it('should propagate change event to the parent', () => {
    spyOn(component.onValueChange, 'emit');
    let newValue = 'newValue';
    changeInputElementValue(inputEl, newValue);
    fixture.detectChanges();
    expect(component.onValueChange.emit).toHaveBeenCalledWith(newValue);
  });
});
