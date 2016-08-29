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

import { Component, Input } from '@angular/core';

import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { AbstractTrackerComponent } from '../abstract-tracker';

@Component({
  selector: 'previewer',
  directives: [PdfViewerComponent, TAB_DIRECTIVES],
  styles: [
    require('./previewer.component.scss')
  ],
  template: require('./previewer.component.html')
})
export class PreviewerComponent extends AbstractTrackerComponent {

  @Input() previews: Array<Preview>;
  hidden: boolean = false;

  get toggleButtonActionName(): string {
    return this.hidden ? 'Show' : 'Hide';
  }

}

export interface Preview {
  name: string;
  type: string;
  url: string;
}
