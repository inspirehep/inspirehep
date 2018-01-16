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

import {
  Component, Input, Output, OnInit, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { SchemaKeysStoreService, QueryService, JsonUtilsService, UserActionsService } from './shared/services';
import { UserActions } from './shared/interfaces';
import { Set } from 'immutable';
import { Subscribable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 're-multi-editor',
  templateUrl: 'multi-editor.component.html',
  styleUrls: ['multi-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiEditorComponent implements OnInit {
  records: object[];
  currentPage = 1;
  totalRecords = -1;
  pageSize = 10;
  schema: object;
  validationErrors: string[];
  lastSearchedQuery = '';
  allSelected = true;
  lastSearchedCollection: string;
  previewedActions: UserActions;
  successMessage: string;
  recordSelectionStatus: { [uuid: string]: boolean } = {};
  previewMode = false;
  selectedCollection: string;
  jsonPatches: object[];
  uuids: string[] = [];
  filterExpressions: Set<string>;
  filteredRecords: object[];
  searchSubscription: Subscription;

  readonly collections: object[] = [
    ['hep', 'HEP'],
    ['authors', 'Authors'],
    ['data', 'Data'],
    ['conferences', 'Conferences'],
    ['jobs', 'Jobs'],
    ['institutions', 'Institutions'],
    ['experiments', 'Experiments'],
    ['journals', 'Journals']
  ];


  constructor(
    private schemaKeysStoreService: SchemaKeysStoreService,
    private changeDetectorRef: ChangeDetectorRef,
    private queryService: QueryService,
    private userActionsService: UserActionsService,
    private jsonUtilsService: JsonUtilsService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.selectedCollection = this.collections[0][0];
    this.onCollectionChange('hep');
  }

  onSave() {
    let uuids = Object.keys(this.recordSelectionStatus)
      .filter(key => this.recordSelectionStatus[key] !== this.allSelected);
    this.queryService.save(this.previewedActions, uuids, this.allSelected)
      .subscribe((res) => {
        this.successMessage = res.message;
        this.totalRecords = -1;
        this.changeDetectorRef.markForCheck();
      }, (error) => {
        this.displayErrorMessage(error);
        this.changeDetectorRef.markForCheck();
      });
  }

  selectAll() {
    this.allSelected = true;
    Object.keys(this.recordSelectionStatus)
      .forEach((item) => { this.recordSelectionStatus[item] = true; });
    this.changeDetectorRef.markForCheck();
  }

  deselectAll() {
    this.allSelected = false;
    Object.keys(this.recordSelectionStatus)
      .forEach((item) => { this.recordSelectionStatus[item] = false; });
    this.changeDetectorRef.markForCheck();
  }

  private setSelectionStatusesForNewPageRecords() {
    if (!this.recordSelectionStatus.hasOwnProperty(this.uuids[0])) {
      this.uuids.forEach(item => {
        this.recordSelectionStatus[item] = this.allSelected;
      });
    }
  }

  get userActions(): UserActions {
    return this.userActionsService.getUserActions();
  }

  onPreviewClick() {
    this.previewedActions = this.userActions;
    this.previewActions();
  }

  previewActions() {
    if (!this.hasAnyNonEmptyAction(this.userActions)) {
      this.toastr.error('Please use at least one action to preview');
    } else if (!this.validateActionsKeypaths(this.userActions)) {
      this.toastr.error('Please use valid paths provided by autocompletion');
    } else {
      this.queryService.previewActions(this.userActions, this.currentPage, this.pageSize)
        .subscribe((res) => {
          this.records = res.json_records;
          this.jsonPatches = res.json_patches;
          this.validationErrors = res.errors;
          this.previewMode = true;
          this.filterRecords(this.filterExpressions);
          this.changeDetectorRef.markForCheck();
        }, (error) => {
          this.displayErrorMessage(error);
        });
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.previewMode ? this.previewActions() : this.fetchPage();
  }

  private fetchPage() {
    this.queryService
      .fetchPaginatedRecords(this.currentPage, this.pageSize)
      .subscribe((json) => {
        this.records = json.json_records;
        this.uuids = json.uuids;
        this.setSelectionStatusesForNewPageRecords();
        this.filterRecords(this.filterExpressions);
        this.changeDetectorRef.markForCheck();
      }, (error) => {
        this.displayErrorMessage(error);
      });
  }

  get isSearching(): boolean {
    if (this.searchSubscription && !this.searchSubscription.closed) {
      return true;
    } else {
      return false;
    }
  }
  searchRecords(query: string) {
    this.lastSearchedCollection = this.selectedCollection;
    this.currentPage = 1;
    this.allSelected = true;
    this.previewMode = false;
    this.recordSelectionStatus = {};
    if (!query) {
      query = '';
    }
    this.lastSearchedQuery = query;
    this.queryCollection(query, this.selectedCollection);
  }

  private queryCollection(query: string, collection: string) {
    this.successMessage = undefined;
    this.searchSubscription = this.queryService.searchRecords(query, this.currentPage, collection, this.pageSize)
      .subscribe((json) => {
        this.previewMode = false;
        this.records = json.json_records;
        this.totalRecords = json.total_records;
        this.uuids = json.uuids;
        this.setSelectionStatusesForNewPageRecords();
        this.filterRecords(this.filterExpressions);
        this.changeDetectorRef.markForCheck();
      }, (error) => {
        this.displayErrorMessage(error);
        this.totalRecords = -1;
        this.changeDetectorRef.markForCheck();
      });
  }

  onCollectionChange(selectedCollection: string) {
    this.selectedCollection = selectedCollection;
    this.queryService.fetchCollectionSchema(this.selectedCollection)
      .subscribe((res) => {
        this.schema = res;
        this.schemaKeysStoreService.buildSchemaKeyStore(this.schema);
      }, (error) => {
        this.displayErrorMessage(error);
      });
  }

  trackByItem(index: number, item: object): object {
    return item;
  }

  private filterRecord(record: object): object {
    if (this.filterExpressions && this.filterExpressions.size > 0) {
      return this.jsonUtilsService.filterObject(record, this.filterExpressions);
    }
    return record;
  }

  private filterRecords(newFilterExpressionArray: Set<string>) {
    this.filterExpressions = newFilterExpressionArray;
    this.filteredRecords = new Array();
    this.records.forEach(item => {
      this.filteredRecords.push(this.filterRecord(item));
    });
    this.changeDetectorRef.markForCheck();
  }

  private hasAnyNonEmptyAction(userActions: UserActions): boolean {
    let existingAction = false;
    return userActions.actions
      .some(action => Boolean(action.mainKey));
  }

  private displayErrorMessage(error: Response) {
    const errorMessage = error.json().message || 'Something went wrong :)';
    this.toastr.error(errorMessage);
  }

  private validateActionsKeypaths(userActions: UserActions): boolean {
    let invalid = userActions.actions
      .some(action => !this.schemaKeysStoreService.findSubschema(action.mainKey));
    if (!invalid) {
      invalid = userActions.conditions
        .some(action => !this.schemaKeysStoreService.findSubschema(action.key));
    }
    return !invalid;
  }
}
