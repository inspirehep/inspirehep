import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { SavePreviewModalService, RecordApiService, DomUtilsService } from '../../core/services';
import { SavePreviewModalOptions } from '../../shared/interfaces';
import { SubscriberComponent } from '../../shared/classes';

@Component({
  selector: 're-save-preview-modal',
  templateUrl: './save-preview-modal.component.html',
  styleUrls: ['./save-preview-modal.component.scss']
})
export class SavePreviewModalComponent extends SubscriberComponent implements OnInit, OnDestroy {

  @ViewChild('modal') modal: ModalDirective;
  private options: SavePreviewModalOptions;
  private previewHtml: string;

  constructor(private toastrService: ToastrService,
    private recordPreviewModalService: SavePreviewModalService,
    private apiService: RecordApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private domUtilsService: DomUtilsService) {
    super();
  }

  ngOnInit() {
    this.recordPreviewModalService.onPreview
      .do(options => {
        this.options = options;
      })
      .switchMap(options => this.apiService.preview(options.record))
      .takeUntil(this.isDestroyed)
      .subscribe(previewHtml => {
        this.previewHtml = previewHtml;
        this.modal.show();
      });
  }

  onShown() {
    this.domUtilsService
      .writeContentIntoIFrameById(this.previewHtml, 're-preview-iframe');
  }

  onConfirm() {
    this.apiService.saveRecord(this.options.record)
      .subscribe(() => {
        this.domUtilsService.unregisterBeforeUnloadPrompt();
        this.modal.hide();
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
      },
      (error) => {
        this.displayErrorToast(error);
        this.modal.hide();
      });
  }

  private displayErrorToast(error: Response) {
    let body;
    if (error.status === 400) {
      body = error.json();
    }

    if (body && body.message) {
      this.toastrService.error(body.message, 'Error', { closeButton: true, timeOut: 15000 });
    } else {
      console.error(error);
      this.toastrService.error('Could not save the record', 'Error');
    }
  }

  onCancel() {
    this.modal.hide();
    if (this.options.onCancel) {
      this.options.onCancel();
    }
  }
}
