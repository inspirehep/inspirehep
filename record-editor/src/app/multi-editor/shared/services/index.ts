import { SchemaKeysStoreService } from './schema-keys-store.service';
import { MultiApiService } from './multi-api.service';
import { UserActionsService } from './user-actions.service';
import { JsonFilterService } from './json-filter.service';

export const SHARED_SERVICES = [
  SchemaKeysStoreService,
  MultiApiService,
  UserActionsService,
  JsonFilterService,
];

export {
  SchemaKeysStoreService,
  MultiApiService,
  UserActionsService,
  JsonFilterService,
};
