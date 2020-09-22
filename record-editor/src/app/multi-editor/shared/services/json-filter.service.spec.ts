import { JsonFilterService } from './json-filter.service';
import { RecordCleanupService } from '../../../core/services';
import { SchemaKeysStoreService } from './schema-keys-store.service';
import { Set } from 'immutable';

describe('JsonFilterService', () => {
  let service: JsonFilterService;

  beforeEach(() => {
    service = new JsonFilterService(new RecordCleanupService(), new SchemaKeysStoreService());
  });

  it('filters a nested complex object given a path and returns the object keeping the object structure.', () => {
    let record = {
      authors: [
        {
          affiliations: [
            {
              value: 'inst1',
              name: 'inst1'
            },
            {
              value: 'inst2',
              name: 'inst2'
            }
          ]
        },
        {
          affiliations: [
            {
              value: 'inst3',
              name: 'inst3'
            },
            {
              value: 'inst4',
              name: 'inst4'
            }
          ],
          full_name: 'dummy'
        }
      ]
    };

    let expected = {
      authors: [
        {
          affiliations: [
            {
              value: 'inst1'
            },
            {
              value: 'inst2'
            }
          ]
        },
        {
          affiliations: [
            {
              value: 'inst3'
            },
            {
              value: 'inst4'
            }
          ],
          full_name: 'dummy'
        }
      ]
    };

    let result = service.filterObject(record, Set(['authors.affiliations.value', 'authors.full_name']));
    expect(result).toEqual(expected);
  });

  it('filters a nested complex object given a path by converting to tree and back', () => {
    let record = {
      authors: [
        {
          affiliations: [
            {
              value: 'inst1',
              name: 'inst1'
            },
            {
              value: 'inst2',
              name: 'inst2'
            }
          ]
        },
        {
          affiliations: [
            {
              name: 'inst3'
            }
          ],
          full_name: 'dummy'
        }
      ]
    };
    let expected = {
      authors: [{
        affiliations: [
          {
            value: 'inst1'
          },
          {
            value: 'inst2'
          }
        ]
      }, {
        full_name: 'dummy'
      }
      ]
    };
    let tags = ['authors.affiliations.value', 'authors.full_name'];
    let result = service.filterObject(record, Set(tags));
    expect(result).toEqual(expected);
  });
});
