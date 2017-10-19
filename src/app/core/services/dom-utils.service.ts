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

import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable()
export class DomUtilsService {

  // Event handler that makes browser to show prompt before closing the application
  private beforeUnloadHandler = function (event) {
    event.returnValue = true;  // Gecko, Trident, Chrome 34+
    return true;  // Gecko, WebKit, Chrome <34
  };

  fitEditorHeightFullPage() {
    const editorContainer = document.getElementById('editor-container');
    const editorToolbar = document.getElementById('editor-toolbar');
    const toolbarHeight = window.getComputedStyle(document.getElementById('editor-toolbar'), null).getPropertyValue('min-height');
    editorContainer.style.height = (window.innerHeight - parseInt(toolbarHeight, 10)) + 'px';
  }

  fitEditorHeightFullPageOnResize() {
    window.addEventListener('resize', () => this.fitEditorHeightFullPage());
  }

  registerBeforeUnloadPrompt() {
    if (environment.production) {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  unregisterBeforeUnloadPrompt() {
    if (environment.production) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }


}
