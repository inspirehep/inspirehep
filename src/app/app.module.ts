import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ToastrModule } from 'ngx-toastr';
import { JsonEditorModule } from 'ng2-json-editor';

import { AppComponent } from './app.component';
import { EditorHoldingPenComponent } from './editor-holdingpen';
import { EditorContainerComponent } from './editor-container';
import { EditorToolbarComponent, EditorToolbarSaveComponent } from './editor-toolbar';
import { EditorHoldingPenToolbarComponent, EditorHoldingPenToolbarSaveComponent } from './editor-holdingpen-toolbar';
import { TicketsComponent, TicketComponent, NewTicketModalComponent } from './tickets';
import { DropdownInputComponent } from './dropdown-input';
import { ReferenceBriefComponent } from './reference-brief';
import { AffiliationBriefComponent } from './affiliation-brief';
import { RefExtractActionsComponent, AuthorExtractActionsComponent } from './extract-actions';
import { UndoButtonComponent } from './undo-button';
import { HelpModalButtonComponent } from './help-modal-button';
import { RecordHistoryComponent } from './record-history';

import { routing, appRoutingProviders, } from './app.routing';

import { SHARED_PIPES, SHARED_SERVICES } from './shared';
import { RecordSearchComponent } from './record-search/record-search.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorHoldingPenComponent,
    EditorHoldingPenToolbarComponent,
    EditorHoldingPenToolbarSaveComponent,
    EditorToolbarComponent,
    EditorContainerComponent,
    EditorToolbarSaveComponent,
    TicketsComponent,
    TicketComponent,
    NewTicketModalComponent,
    DropdownInputComponent,
    ReferenceBriefComponent,
    AffiliationBriefComponent,
    RefExtractActionsComponent,
    AuthorExtractActionsComponent,
    UndoButtonComponent,
    HelpModalButtonComponent,
    RecordHistoryComponent,
    ...SHARED_PIPES,
    RecordSearchComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right' }),
    HttpModule,
    FormsModule,
    routing,
    JsonEditorModule,
    PopoverModule,
    AccordionModule.forRoot(),
    BsDropdownModule,
    ModalModule
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/editor' },
    ...appRoutingProviders,
    ...SHARED_SERVICES
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
