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

import { Component, Output, EventEmitter } from '@angular/core';
import { Collection } from '../shared/interfaces';

@Component({
  selector: 're-multi-editor-search',
  templateUrl: './multi-editor-search.component.html',
  styleUrls: ['./multi-editor-search.component.scss'],
})
export class MultiEditorSearchComponent {
  selectedCollection = 'hep';
  query = '';
  @Output() search = new EventEmitter<string>();
  @Output() collectionChange = new EventEmitter<string>();

  readonly collections: Collection[] = [
    { name: 'hep', value: 'Literature' },
    { name: 'authors', value: 'Authors' },
    { name: 'data', value: 'Data' },
    { name: 'conferences', value: 'Conferences' },
    { name: 'jobs', value: 'Jobs' },
    { name: 'institutions', value: 'Institutions' },
    { name: 'experiments', value: 'Experiments' },
    { name: 'journals', value: 'Journals' },
  ];

  onSearchClick(query: string) {
    this.search.emit(query);
  }

  onCollectionChange(collection: string) {
    this.selectedCollection = collection;
    this.collectionChange.emit(collection);
  }
}
