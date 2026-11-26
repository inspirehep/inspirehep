/*
 * This file is part of record-editor.
 * Copyright (C) 2026 CERN.
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

import { BackofficeApiService } from './backoffice-api.service';

describe('BackofficeApiService', () => {
  const url = 'http://backoffice/api/workflows/literature/some-id/';
  const firstConflict = { op: 'remove', path: '/collaborations/1' };
  const secondConflict = { op: 'remove', path: '/collaborations/2' };

  let service: BackofficeApiService;
  let http: { put: jasmine.Spy };

  function getPutBody(): any {
    return http.put.calls.mostRecent().args[1];
  }

  beforeEach(() => {
    const observableStub = { map: () => observableStub };
    http = {
      put: jasmine
        .createSpy('put')
        .and.returnValue({ catch: () => observableStub }),
    };
    service = new BackofficeApiService(http as any);
    (service as any).currentWorkflowObjectApiUrl = url;
  });

  describe('saveWorkflowObject', () => {
    const requestData = {
      id: 'some-id',
      status: 'approval_merge',
      data: { titles: [{ title: 'stale' }] },
      merge_details: {
        head_uuid: 'head-uuid',
        conflicts: [firstConflict, secondConflict],
      },
    };

    it('sends the remaining conflicts from the editor', () => {
      const object = {
        id: 1,
        metadata: { titles: [{ title: 'edited' }] },
        _extra_data: { conflicts: [secondConflict] },
      } as any;

      service.saveWorkflowObject(object, requestData);

      expect(http.put).toHaveBeenCalledWith(url, jasmine.any(Object), {
        withCredentials: true,
      });
      expect(getPutBody()).toEqual({
        id: 'some-id',
        status: 'approval_merge',
        data: { titles: [{ title: 'edited' }] },
        merge_details: {
          head_uuid: 'head-uuid',
          conflicts: [secondConflict],
        },
      });
    });

    it('sends an empty list once every conflict is resolved', () => {
      const object = {
        id: 1,
        metadata: {},
        _extra_data: { conflicts: [] },
      } as any;

      service.saveWorkflowObject(object, requestData);

      expect(getPutBody().merge_details).toEqual({
        head_uuid: 'head-uuid',
        conflicts: [],
      });
    });

    it('keeps merge_details untouched when the editor has no conflicts', () => {
      const object = { id: 1, metadata: {}, _extra_data: {} } as any;

      service.saveWorkflowObject(object, requestData);

      expect(getPutBody().merge_details).toEqual(requestData.merge_details);
    });

    it('does not mutate the request data', () => {
      const object = {
        id: 1,
        metadata: {},
        _extra_data: { conflicts: [] },
      } as any;

      service.saveWorkflowObject(object, requestData);

      expect(requestData.merge_details.conflicts).toEqual([
        firstConflict,
        secondConflict,
      ]);
    });
  });
});
