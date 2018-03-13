/*
 * This file is part of ng2-json-editor.
 * Copyright (C) 2016 CERN.
 *
 * ng2-json-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * ng2-json-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ng2-json-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { JsonEditorConfig } from 'ng2-json-editor';

import { editorConfigs } from '../../shared/config';
import { onDocumentTypeChange } from '../../shared/config/hep';

@Injectable()
export class AppConfigService {

  readonly configsByType = editorConfigs;
  readonly onConfigChange = Observable.from(onDocumentTypeChange)
    .map(documentType => this.configsByType[documentType] || this.configsByType.hep);

  getConfigForRecord(record: object): JsonEditorConfig {
    const recordType = this.getRecordType(record);

    if (recordType === 'hep') {
      return this.getConfigForHepRecord(record);
    }

    return this.configsByType[recordType];
  }

  private getRecordType(record: Object): string {
    const schemaUrl: string = record['$schema'];
    const typeWithFileExt = schemaUrl.slice(schemaUrl.lastIndexOf('/') + 1, schemaUrl.length);
    return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
  }

  private getConfigForHepRecord(record: object): JsonEditorConfig {
    if (record['document_type']) {
      const hepType = this.getHepType(record['document_type']);
      if (hepType) {
        return this.configsByType[hepType];
      }
    }
    return this.configsByType.hep;
  }

  /**
   * Returns first document type which has a config, `undefined` otherwise
   */
  private getHepType(documentTypes: Array<string>): string | undefined {
    return documentTypes
      .find(documentType => this.configsByType[documentType] !== undefined);
  }
}
