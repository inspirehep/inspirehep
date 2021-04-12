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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ToastrService } from 'ngx-toastr';

import {
  CommonApiService,
  GlobalAppStateService,
} from '../../../core/services';
import { Ticket } from '../../interfaces';
import { SubscriberComponent } from '../../classes';

@Component({
  selector: 're-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsComponent extends SubscriberComponent implements OnInit {
  displayLimit = 1;
  tickets: Array<Ticket>;
  recordId: number;

  constructor(
    private apiService: CommonApiService,
    private globalAppStateService: GlobalAppStateService,
    private toastrService: ToastrService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    Observable.combineLatest(
      this.globalAppStateService.pidTypeBeingEdited$,
      this.globalAppStateService.pidValueBeingEdited$,
      (pidType, pidValue) => ({ pidType, pidValue })
    )
      .takeUntil(this.isDestroyed)
      .filter(({ pidValue }) => Boolean(pidValue))
      .subscribe(({ pidType, pidValue }) => {
        this.recordId = pidValue;
        this.fetchTickets(pidType);
      });
  }

  onTicketResolve(ticketIndex: number) {
    this.tickets.splice(ticketIndex, 1);
  }

  onTicketCreate(ticket: Ticket) {
    this.tickets.push(ticket);
  }

  private fetchTickets(pidType: string) {
    this.apiService
      .fetchRecordTickets(pidType, this.recordId)
      .then((tickets) => {
        this.tickets = tickets.filter(
          (ticket) => ticket.queue !== 'HEP_conflicts'
        );
        this.changeDetectorRef.markForCheck();
      })
      .catch((error) => {
        if (error.status === 403) {
          this.toastrService.error(
            'Logged in user can not access to tickets',
            'Forbidden'
          );
        } else {
          this.toastrService.error('Could not load the tickets!', 'Error');
        }
      });
  }
}
