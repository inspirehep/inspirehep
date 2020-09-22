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

import { Injectable } from '@angular/core';

import { UserActions } from '../interfaces';

@Injectable()
export class UserActionsService {
  private userActions: UserActions = { actions: [], conditions: [] };

  addAction(selectedAction: string, matchType: string) {
    let action = {
      actionName: selectedAction,
      mainKey: '',
      value: '',
      updateValue: '',
      matchType: matchType
    };
    this.userActions.actions.push(action);
  }

  addCondition(matchType: string) {
    let condition = {
      key: '',
      value: '',
      matchType: matchType
    };
    this.userActions.conditions.push(condition);
  }

  removeAction(index: number) {
    this.userActions.actions.splice(index, 1);
  }

  removeCondition(index: number) {
    this.userActions.conditions.splice(index, 1);
  }

  getUserActions(): UserActions {
    return this.userActions;
  }
}
