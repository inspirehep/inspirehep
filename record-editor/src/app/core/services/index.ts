import { CommonApiService } from './common-api.service';
import { RecordApiService } from './record-api.service';
import { HoldingpenApiService } from './holdingpen-api.service';
import { AppConfigService } from './app-config.service';
import { RecordCleanupService } from './record-cleanup.service';
import { DomUtilsService } from './dom-utils.service';
import { RecordSearchService } from './record-search.service';
import { SavePreviewModalService } from './save-preview-modal.service';
import { GlobalAppStateService } from './global-app-state.service';
import { WorkflowErrorConverterService } from './workflow-error-converter.service';
import { ReleaseLockService } from './release-lock-service';

export {
  CommonApiService,
  HoldingpenApiService,
  RecordApiService,
  AppConfigService,
  RecordCleanupService,
  DomUtilsService,
  RecordSearchService,
  SavePreviewModalService,
  GlobalAppStateService,
  WorkflowErrorConverterService,
  ReleaseLockService,
};

export const CORE_SERVICES = [
  CommonApiService,
  HoldingpenApiService,
  RecordApiService,
  AppConfigService,
  RecordCleanupService,
  DomUtilsService,
  RecordSearchService,
  SavePreviewModalService,
  GlobalAppStateService,
  WorkflowErrorConverterService,
  ReleaseLockService,
];
