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

import { environment } from '../../../environments/environment';
import {
  Component,
  Input
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Http, Response } from '@angular/http';
import { ModalService } from 'ng2-json-editor';

import { RecordApiService, RecordCleanupService, BeforeUnloadPromptService } from '../../core/services';

@Component({
  selector: 're-record-save-button',
  templateUrl: './record-save-button.component.html',
  styleUrls: [
    '../json-editor-wrapper/json-editor-wrapper.component.scss'
  ]
})
export class RecordSaveButtonComponent {
  @Input() record: Object;

  constructor(
    private route: ActivatedRoute,
    private apiService: RecordApiService,
    private modalService: ModalService,
    private domSanitizer: DomSanitizer,
    private http: Http,
    private recordCleanupService: RecordCleanupService,
    private beforeUnloadPromptService: BeforeUnloadPromptService
  ) { }

  onClickSave(event: Object) {
    this.recordCleanupService.cleanup(this.record);
    this.http.post(`${environment.baseUrl}/editor/preview`, this.record)
      .subscribe((res: Response) => {
        this.modalService.displayModal({
          title: 'Preview',
          bodyHtml: this.domSanitizer.bypassSecurityTrustHtml('<iframe id="iframe-preview"></iframe>'),
          type: 'confirm',
          onConfirm: () => {
            this.apiService.saveRecord(this.record).subscribe({
              next: () => {
                this.beforeUnloadPromptService.unregister();
                this.route.params
                  .subscribe(params => {
                    window.location.href = `/${params['type']}/${params['recid']}`;
                });
              },
              error: (error) => {
                console.warn(error.json());
              },
          });
          },
          onShow: () => {
            let el = document.getElementById('iframe-preview') as HTMLIFrameElement;
            let doc = el.contentWindow.document;
            doc.open();
            doc.write(res.text());
            doc.close();
         }
        });
      });
  }
}
