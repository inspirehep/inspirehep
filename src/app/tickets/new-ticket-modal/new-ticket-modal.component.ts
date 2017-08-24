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

import { Component, Input, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Ticket } from '../../shared/interfaces';
import { ApiService } from '../../shared/services';

@Component({
  selector: 're-new-ticket-modal',
  templateUrl: './new-ticket-modal.component.html',
  styleUrls: [
    './new-ticket-modal.component.scss'
  ]
})
export class NewTicketModalComponent {
  @ViewChild('modal') modal: ModalDirective;
  @Output() create = new EventEmitter<Ticket>();

  newTicket = {} as Ticket;

  constructor(public apiService: ApiService) { }

  // invoked by parent component.
  show() {
    this.modal.show();
  }

  onNewClick() {
    this.apiService
      .createRecordTicket(this.newTicket)
      .then(data => {
        this.newTicket.id = data.id;
        this.newTicket.link = data.link;
        this.newTicket.date = new Date().toString();
        this.create.emit(this.newTicket);
        this.newTicket = {} as Ticket;
      });
    this.modal.hide();
  }
}
