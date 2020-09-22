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

import { coreHep } from './core.config';
import { thesisHep } from './thesis.config';
import { bookHep } from './book.config';
import { bookChapterHep } from './book-chapter.config';
import { proceedingsHep } from './proceedings.config';
import { conferencePaperHep } from './conference-paper.config';
import { immutableMergeWithConcattingArrays } from './utils';

export const hep = coreHep;
export const thesis = immutableMergeWithConcattingArrays(coreHep, thesisHep);
export const book = immutableMergeWithConcattingArrays(coreHep, bookHep);
export const bookChapter = immutableMergeWithConcattingArrays(
  coreHep,
  bookChapterHep
);
export const proceedings = immutableMergeWithConcattingArrays(
  coreHep,
  proceedingsHep
);
export const conferencePaper = immutableMergeWithConcattingArrays(
  coreHep,
  conferencePaperHep
);

export { onDocumentTypeChange } from './utils';
