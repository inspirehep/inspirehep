import { ApiService } from './api.service';
import { AppConfigService } from './app-config.service';
import { CommonConfigsService } from './common-configs.service';

export {
  ApiService,
  AppConfigService,
  CommonConfigsService
};

export const SHARED_SERVICES = [
  ApiService,
  AppConfigService,
  CommonConfigsService
];
