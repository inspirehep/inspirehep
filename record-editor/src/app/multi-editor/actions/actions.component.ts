/*
 * This file is part of ng2-multi-record-editor.
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

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActionTemplateComponent } from '../action';
import { UserActions } from '../shared/interfaces';
import { UserActionsService } from '../shared/services';
import { ACTION_MATCH_TYPES, CONDITION_MATCH_TYPES } from '../shared/constants';

@Component({
  selector: 're-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {
  selectedAction = 'Addition';
  userActions: UserActions;

  constructor(private userActionsService: UserActionsService) {}

  ngOnInit() {
    this.userActions = this.userActionsService.getUserActions();
    this.userActionsService.addAction(
      this.selectedAction,
      ACTION_MATCH_TYPES[0]
    );
    this.userActionsService.addCondition(CONDITION_MATCH_TYPES[0]);
  }

  addAction() {
    this.userActionsService.addAction(
      this.selectedAction,
      ACTION_MATCH_TYPES[0]
    );
  }

  addCondition() {
    this.userActionsService.addCondition(CONDITION_MATCH_TYPES[0]);
  }

  onRemoveAction(index: number) {
    this.userActionsService.removeAction(index);
  }

  onRemoveCondition(index: number) {
    this.userActionsService.removeCondition(index);
  }

  onActionChange(actionType: string) {
    this.selectedAction = actionType;
    this.userActions.actions = [];
    this.userActionsService.addAction(
      this.selectedAction,
      ACTION_MATCH_TYPES[0]
    );
  }
}
