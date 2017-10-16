import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ToastrModule } from 'ngx-toastr';
import { JsonEditorModule } from 'ng2-json-editor';

import { routing, appRoutingProviders, } from './app.routing';
import { CoreModule } from './core';
import { HoldingpenEditorModule } from './holdingpen-editor';
import { RecordEditorModule } from './record-editor';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // needed for ToastrModule
    HttpModule,
    routing,
    // feature-modules
    CoreModule, // all core services
    HoldingpenEditorModule,
    RecordEditorModule,
    AccordionModule.forRoot(),
    // ngx-toastr
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right' }),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/editor' },
    ...appRoutingProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
