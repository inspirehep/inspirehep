import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { Subscription } from 'rxjs/Subscription';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { SavePreviewModalService, RecordApiService, DomUtilsService } from '../../core/services';
import { SavePreviewModalOptions } from '../../shared/interfaces';

@Component({
  selector: 're-save-preview-modal',
  templateUrl: './save-preview-modal.component.html',
  styleUrls: ['./save-preview-modal.component.scss']
})
export class SavePreviewModalComponent implements OnInit, OnDestroy {

  @ViewChild('modal') modal: ModalDirective;
  private options: SavePreviewModalOptions;
  private previewHtml: string;
  private onPreviewSubscription: Subscription;

  constructor(private toastrService: ToastrService,
    private recordPreviewModalService: SavePreviewModalService,
    private apiService: RecordApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private domUtilsService: DomUtilsService) { }

  ngOnInit() {
    this.onPreviewSubscription = this.recordPreviewModalService.onPreview
      .do(options => {
        this.options = options;
      })
      .switchMap(options => this.apiService.preview(options.record))
      .subscribe(previewHtml => {
        this.previewHtml = previewHtml;
        this.modal.show();
      });
  }

  ngOnDestroy() {
    this.onPreviewSubscription.unsubscribe();
  }

  onShown() {
    this.domUtilsService
      .writeContentIntoIFrameById(this.previewHtml, 're-preview-iframe');
  }

  onConfirm() {
    this.apiService.saveRecord(this.options.record)
      .then(() => {
        this.domUtilsService.unregisterBeforeUnloadPrompt();
        this.modal.hide();
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
      })
      .catch(error => {
        console.error(error);
        this.toastrService.error('Could not save the record', 'Error');
      });
  }

  onCancel() {
    this.modal.hide();
    if (this.options.onCancel) {
      this.options.onCancel();
    }
  }
}
