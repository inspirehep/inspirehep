import { ApiService } from './api.service';
import { AppConfigService } from './app-config.service';
import { CommonConfigsService } from './common-configs.service';
import { RecordCleanupService } from './record-cleanup.service';
import { FieldSplitterService } from './field-splitter.service';
import { RefExtractApiService } from './ref-extract-api.service';
import { BeforeUnloadPromptService } from './before-unload-prompt.service';

export {
  ApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService,
  FieldSplitterService,
  RefExtractApiService,
  BeforeUnloadPromptService
};

export const SHARED_SERVICES = [
  ApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService,
  FieldSplitterService,
  RefExtractApiService,
  BeforeUnloadPromptService
];
