/*
 * This file is part of record-editor.
 * Copyright (C) 2018 CERN.
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

import { anchorBuilder } from './commons';

describe('Config Commons', () => {
  describe('anchorBuilder', () => {
    it('should return de pluralised display with link to legacy if not literature', () => {
      const url = 'https://labs.inspirehep.net/api/experiments/1108642';
      const result = anchorBuilder(url);
      expect(result.display).toEqual('View experiment');
      expect(result.href).toEqual('//inspirehep.net/record/1108642');
    });

    it('should return display and link without "api" part', () => {
      const url = 'https://labs.inspirehep.net/api/literature/1108642';
      const result = anchorBuilder(url);
      expect(result.display).toEqual('View literature');
      expect(result.href).toEqual('https://labs.inspirehep.net/literature/1108642');
    });
  });
});
