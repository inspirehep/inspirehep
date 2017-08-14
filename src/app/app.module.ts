import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
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
import { RefExtractActionsComponent } from './ref-extract-actions';

import { routing, appRoutingProviders, } from './app.routing';

import { SHARED_PIPES, SHARED_SERVICES } from './shared';

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
    ...SHARED_PIPES
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    routing,
    JsonEditorModule,
    PopoverModule,
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
