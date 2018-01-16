
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { multiEditorRouter } from './multi-editor.router';

import { MultiEditorComponent } from './multi-editor.component';
import { ActionTemplateComponent } from './action';
import { ActionsComponent } from './actions/actions.component';
import { JsonEditorModule } from 'ng2-json-editor';
import { AddActionComponent } from './add-action/add-action.component';
import { DeleteActionComponent } from './delete-action/delete-action.component';
import { UpdateActionComponent } from './update-action/update-action.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { EditorToolbarSaveComponent } from './toolbar/editor-toolbar-save/editor-toolbar-save.component';
import { EditorToolbarSearchComponent } from './toolbar/editor-toolbar-search/editor-toolbar-search.component';
import { AutocompleteInputComponent } from './autocomplete-input';
import { PrimitiveNodeComponent } from './json-tree/primitive-node/primitive-node.component';
import { ObjectNodeComponent } from './json-tree/object-node/object-node.component';
import { ArrayNodeComponent } from './json-tree/array-node/array-node.component';
import { AnyTypeNodeComponent } from './json-tree/any-type-node.component';


import { SHARED_SERVICES, SHARED_PIPES } from './shared';


@NgModule({
  declarations: [
    ...SHARED_PIPES,
    MultiEditorComponent,
    ActionTemplateComponent,
    ActionsComponent,
    AutocompleteInputComponent,
    AddActionComponent,
    DeleteActionComponent,
    UpdateActionComponent,
    ConditionsComponent,
    ToolbarComponent,
    EditorToolbarSaveComponent,
    EditorToolbarSearchComponent,
    AnyTypeNodeComponent,
    PrimitiveNodeComponent,
    ObjectNodeComponent,
    ArrayNodeComponent,
  ],
  imports: [
    BsDropdownModule.forRoot(),
    FormsModule,
    PaginationModule.forRoot(),
    JsonEditorModule,
    TypeaheadModule.forRoot(),
    CommonModule,
    multiEditorRouter
  ],
  providers: SHARED_SERVICES,
})
export class MultiEditorModule { }
