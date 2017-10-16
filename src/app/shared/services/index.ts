import { CommonApiService } from './common-api.service';
import { RecordApiService } from './record-api.service';
import { HoldingpenApiService } from './holdingpen-api.service';
import { AppConfigService } from './app-config.service';
import { CommonConfigsService } from './common-configs.service';
import { RecordCleanupService } from './record-cleanup.service';
import { FieldSplitterService } from './field-splitter.service';
import { BeforeUnloadPromptService } from './before-unload-prompt.service';
import { RecordSearchService } from './record-search.service';

export {
  CommonApiService,
  HoldingpenApiService,
  RecordApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService,
  FieldSplitterService,
  BeforeUnloadPromptService,
  RecordSearchService
};

export const SHARED_SERVICES = [
  CommonApiService,
  HoldingpenApiService,
  RecordApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService,
  FieldSplitterService,
  BeforeUnloadPromptService,
  RecordSearchService
];
