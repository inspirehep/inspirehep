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

import { Component, Input, ViewEncapsulation} from '@angular/core';
import { Http } from '@angular/http';

import { ComplexListFieldComponent } from './complex-list-field';
import { TableListFieldComponent } from './table-list-field';
import { ObjectFieldComponent } from './object-field';
import { PrimitiveListFieldComponent } from './primitive-list-field';
import { PrimitiveFieldComponent } from './primitive-field';

import { MapToSortedIterablePipe, UnderscoreToSpacePipe } from './shared/pipes';

import {
  AppGlobalsService,
  ComponentTypeService,
  JsonUtilService,
  RecordFixerService,
} from './shared/services';

@Component({
  selector: 'editor',
  encapsulation: ViewEncapsulation.None,
  directives: [
    ComplexListFieldComponent,
    PrimitiveListFieldComponent,
    PrimitiveFieldComponent,
    TableListFieldComponent,
    ObjectFieldComponent
  ],
  pipes: [MapToSortedIterablePipe, UnderscoreToSpacePipe],
  providers: [
    AppGlobalsService,
    ComponentTypeService,
    JsonUtilService,
    RecordFixerService
  ],
  styles: [
    require('./editor.component.scss')
  ],
  template: require('./editor.component.html'),
})
export class EditorComponent {
  // TODO: remove dummy
  @Input() record: Object;
  @Input() schema: Object;


  constructor(private http: Http,
    private appGlobalsService: AppGlobalsService,
    private componentTypeService: ComponentTypeService,
    private jsonUtilService: JsonUtilService,
    private recordFixerService: RecordFixerService) { }

  onValueChange(event: any, key: string) {
    this.record[key] = event;
  }

  getFieldType(field: string): string {
    let fieldScehma = this.schema['properties'][field];
    return this.componentTypeService.getComponentType(fieldScehma);
  }

  // FIXME: called two times!
  ngOnChanges() {
    // TODO: remove this when this is called only once.
    if (Object.keys(this.record).length === 0) return;

    this.recordFixerService.fixRecord(this.record, this.schema);
    this.record = this.jsonUtilService.flattenMARCJson(this.record, this.schema);
    this.schema = this.jsonUtilService.flattenMARCSchema(this.schema);
    console.log(this.schema, this.record);
  }

  trackByFunction(index: number, obj: any): any {
    return index;
  }

  saveRecord() {
    // Remote validation before save.
    let validationUrl = this.schema['x_editor_validation_url'];
    if (validationUrl) {
      // TODO: change it post and include record and schema in request when it is not mock.
      this.http.get(validationUrl).map(res => res.json())
        .subscribe(validationErrors => { 
          this.appGlobalsService.globalErrors = validationErrors;
        });
    }

    //TODO: implement saving and do it when only validationErrors is empty.
  }
}