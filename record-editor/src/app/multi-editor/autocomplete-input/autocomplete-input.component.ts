/*
 * This file is part of ng2-multi-record-editor.
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

import {
  Component,
  Input,
  Output,
  ChangeDetectionStrategy,
  EventEmitter
} from '@angular/core';
import { SchemaKeysStoreService } from '../shared/services/schema-keys-store.service';
import { ParsedAutocompleteInput } from '../shared/interfaces/parsed-autocomplete-input';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Set } from 'immutable';

@Component({
  selector: 're-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteInputComponent {
  @Input() disabled;
  @Input() className;
  @Input() placeholder;
  @Input() tagsEnabled = false;
  @Output() valueChange = new EventEmitter<string | Set<string>>();
  valueChange$ = new Subject<string>();
  value = '';
  selectedValues = Set<string>();
  currentPath = '';
  dataSource: Observable<any>;

  typeaheadNoResults = false;

  private tagShortcut = 'space';

  constructor(
    private schemaKeysStoreService: SchemaKeysStoreService) {
    this.dataSource = Observable
      .create((observer: any) => {
        observer.next(this.value);
      })
      .map(inputValue => this.getStateForValue(inputValue))
      .do((state: ParsedAutocompleteInput) => {
        this.currentPath = state.path;
      })
      .mergeMap((state: ParsedAutocompleteInput) => {
        return Observable.of(
          this.schemaKeysStoreService.forPath(state.path).filter(item => item.startsWith(state.query))
        );
      });
    this.valueChange$
      .debounceTime(500)
      .subscribe(value => {
        this.valueChange.emit(value);
      });
  }

  modelChange(value: string) {
    this.value = value;
    this.valueChange$.next(this.value);
  }

  onSpaceKeydown(event) {
    if (this.tagsEnabled) {
      event.preventDefault();
      this.selectedValues = this.selectedValues.add(this.value);
      this.value = '';
      this.valueChange.emit(this.selectedValues);
    }
  }

  selectUserInput(match: TypeaheadMatch) {
    if (this.currentPath !== '') {
      this.value = `${this.currentPath}${this.schemaKeysStoreService.separator}${match.value}`;
    } else {
      this.value = match.value;
    }

    if (!this.tagsEnabled) {
      this.valueChange$.next(this.value);
    }
  }

  private getStateForValue(value: string): ParsedAutocompleteInput {
    let path, query;
    let separatorIndex = value.lastIndexOf(this.schemaKeysStoreService.separator);
    if (separatorIndex < 0) {
      path = '';
      query = value;
    } else if (separatorIndex === value.length - 1) {
      path = value.slice(0, -1);
      query = '';
    } else {
      path = value.slice(0, separatorIndex);
      query = value.slice(separatorIndex + 1);
    }
    return { path, query };
  }

  private removeValue(value) {
    this.selectedValues = this.selectedValues.remove(value);
    this.valueChange.emit(this.selectedValues);
  }

}
