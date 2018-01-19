
import { NgModule } from '@angular/core';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { SharedModule } from '../shared';

import { MultiEditorRouter } from './multi-editor.router';

import { MultiEditorComponent } from './multi-editor.component';
import { ActionTemplateComponent } from './action';
import { ActionsComponent } from './actions/actions.component';
import { AddActionComponent } from './add-action/add-action.component';
import { DeleteActionComponent } from './delete-action/delete-action.component';
import { UpdateActionComponent } from './update-action/update-action.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { MultiEditorToolbarComponent } from './multi-editor-toolbar';
import { MultiEditorSearchComponent } from './multi-editor-search';
import { AutocompleteInputComponent } from './autocomplete-input';
import { PrimitiveNodeComponent } from './json-tree/primitive-node/primitive-node.component';
import { ObjectNodeComponent } from './json-tree/object-node/object-node.component';
import { ArrayNodeComponent } from './json-tree/array-node/array-node.component';
import { AnyTypeNodeComponent } from './json-tree/any-type-node.component';


import { SHARED_SERVICES } from './shared';


@NgModule({
  declarations: [
    MultiEditorComponent,
    ActionTemplateComponent,
    ActionsComponent,
    AutocompleteInputComponent,
    AddActionComponent,
    DeleteActionComponent,
    UpdateActionComponent,
    ConditionsComponent,
    MultiEditorToolbarComponent,
    MultiEditorSearchComponent,
    AnyTypeNodeComponent,
    PrimitiveNodeComponent,
    ObjectNodeComponent,
    ArrayNodeComponent,
  ],
  imports: [
    SharedModule,
    PaginationModule.forRoot(),
    TypeaheadModule.forRoot(),
    MultiEditorRouter
  ],
  providers: SHARED_SERVICES,
})
export class MultiEditorModule { }
