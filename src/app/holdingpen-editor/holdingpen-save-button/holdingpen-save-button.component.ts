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
import { Router } from '@angular/router';

import { HoldingpenApiService, RecordCleanupService, DomUtilsService } from '../../core/services';
import { SubscriberComponent } from '../../shared/classes';

@Component({
  selector: 're-holdingpen-save-button',
  templateUrl: './holdingpen-save-button.component.html',
  styleUrls: [
    '../../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss'
  ]
})
export class HoldingpenSaveButtonComponent extends SubscriberComponent {
  @Input() workflowObject: { id: string };

  constructor(private router: Router,
    private apiService: HoldingpenApiService,
    private recordCleanupService: RecordCleanupService,
    private domUtilsService: DomUtilsService) {
    super();
  }

  onClickSave(event: Object) {
    this.recordCleanupService.cleanup(this.workflowObject['metadata']);
    this.apiService.saveWorkflowObject(this.workflowObject)
      .do(() => this.domUtilsService.unregisterBeforeUnloadPrompt())
      .filter(() => !this.hasConflicts())
      .switchMap(() => this.apiService.continueWorkflow())
      .takeUntil(this.isDestroyed)
      .subscribe(() => {
        this.router.navigate([`${this.getRecordType()}/${this.getRecordId()}`]);
      });
  }

  private hasConflicts(): boolean {
    const conflicts = this.workflowObject['_extra_data']['conflicts'];
    return conflicts && conflicts.length > 0;
  }

  // TODO: kinda duplicate, try to reuse single one with app-config.service:getRecordType
  private getRecordType() {
    const $schema: string = this.workflowObject['metadata']['$schema'];
    const schemaNameWithFileExt = $schema.slice($schema.lastIndexOf('/') + 1, $schema.length);
    const schemaName = schemaNameWithFileExt.slice(0, schemaNameWithFileExt.lastIndexOf('.'));

    if (schemaName === 'hep') {
      return 'literature';
    }
    return schemaName;
  }

  private getRecordId() {
    return this.workflowObject['metadata']['control_number'];
  }
}
