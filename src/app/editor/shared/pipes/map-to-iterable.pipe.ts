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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapToIterable',
  pure:false, // FIX for http://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
})

export class MapToIterablePipe implements PipeTransform {
  transform(map: {}): any {
    if (!map)
      return null;
    return Object.keys(map)
      .map(key => new Pair<string>(key, map[key]));
  }
}

class Pair<T> {
  constructor(public key: string, public value: T) {
    
  }
}


