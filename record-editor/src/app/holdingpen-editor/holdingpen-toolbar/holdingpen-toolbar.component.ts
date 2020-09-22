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

import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 're-holdingpen-toolbar',
  templateUrl: './holdingpen-toolbar.component.html',
  styleUrls: [
    '../../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingpenToolbarComponent {
  @Output() revisionChange = new EventEmitter<object>();
  displayingRevision = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  onRevisionChange(revision: object | undefined) {
    this.revisionChange.emit(revision);
    if (revision) {
      // disable save, undo etc. if displaying an older revision
      this.displayingRevision = true;
    } else {
      // enable save, undo etc. if it's back to the current revision
      this.displayingRevision = false;
    }
    this.changeDetectorRef.markForCheck();
  }
}
