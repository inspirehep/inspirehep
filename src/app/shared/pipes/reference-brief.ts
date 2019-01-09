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

import { Pipe, PipeTransform } from '@angular/core';

import { Map } from 'immutable';

@Pipe({
  name: 'referenceBrief',
})

export class ReferenceBriefPipe implements PipeTransform {

  /**
   * Brief format for references
   */
  transform(item: Map<string, any>): string {
    let referenceHTML = '';
    let hasRefUrl = false;
    let title = '';
    let author = '';
    let arxivEprint = '';
    let label = '';
    let pubNote = '';
    let reportNumber = '';
    let misc = '';

    hasRefUrl = item.hasIn(['record', '$ref']);

    item = item.get('reference');

    if (!item) {
      return referenceHTML;
    }

    arxivEprint = item.get('arxiv_eprint', '');
    reportNumber = item.getIn(['report_numbers', 0], '');
    if (item.has('label')) {
      label = `[${item.get('label')}] `;
    }

    if (item.has('titles')) {
      title = item.getIn(['titles', 0, 'title'], '');
    }
    if (item.has('authors')) {
      author = item.getIn(['authors', 0, 'full_name'], '') + ' ';
      if (item.get('authors').size > 1) {
        author += 'el al. ';
      }
    }
    if (item.has('publication_info')) {
      pubNote += item.getIn(['publication_info', 'journal_title'], '') + ' ';
      pubNote += item.getIn(['publication_info', 'journal_volume'], '') + ' ';
      pubNote += '(' + item.getIn(['publication_info', 'year'], '') + ') ';
      pubNote += item.getIn(['publication_info', 'artid'], '') + ' ';
    }
    if (!author) {
      if (item.has('collaborations')) {
        author = item.getIn(['collaborations', 0]) + ' ';
      }
    }

    if (!hasRefUrl) {
      misc = item.getIn(['misc', 0], '');
    }

    referenceHTML = label + title + author + pubNote + arxivEprint + reportNumber + misc;

    return referenceHTML;

  }
}
