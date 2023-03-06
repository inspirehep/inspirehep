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

import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { SnowTicket, Ticket } from '../../../interfaces';
import { SubscriberComponent } from '../../../classes';
import {
  CommonApiService,
  GlobalAppStateService,
} from '../../../../core/services';

@Component({
  selector: 're-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent extends SubscriberComponent implements OnInit {
  @Input() ticket: Ticket | SnowTicket;
  @Output() resolve = new EventEmitter<void>();

  recordId: number;

  get category() {
    return this.isSnowTicket(this.ticket)
      ? this.ticket.u_functional_category
      : this.ticket.queue;
  }

  constructor(
    private apiService: CommonApiService,
    private globalAppStateService: GlobalAppStateService
  ) {
    super();
  }

  ngOnInit() {
    this.globalAppStateService.pidValueBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe((recordId) => {
        this.recordId = recordId;
      });
  }

  onResolveClick() {
    this.apiService
      .resolveTicket(this.recordId, this.ticket.id)
      .then(() => this.resolve.emit());
  }

  private isSnowTicket(ticket: Ticket | SnowTicket): ticket is SnowTicket {
    return (ticket as SnowTicket).u_functional_category !== undefined;
  }
}
