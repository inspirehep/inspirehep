import { ApiService } from './api.service';
import { AppConfigService } from './app-config.service';
import { CommonConfigsService } from './common-configs.service';
import { RecordCleanupService } from './record-cleanup.service';

export {
  ApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService
};

export const SHARED_SERVICES = [
  ApiService,
  AppConfigService,
  CommonConfigsService,
  RecordCleanupService
];
