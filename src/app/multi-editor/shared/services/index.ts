import { SchemaKeysStoreService } from './schema-keys-store.service';
import { QueryService } from './query.service';
import { AppGlobalsService } from './app-globals.service';
import { UserActionsService } from './user-actions.service';
import { JsonUtilsService } from './json-utils.service';

export const SHARED_SERVICES = [
  SchemaKeysStoreService,
  QueryService,
  AppGlobalsService,
  UserActionsService,
  JsonUtilsService
];

export {
  SchemaKeysStoreService,
  QueryService,
  AppGlobalsService,
  UserActionsService,
  JsonUtilsService
}

