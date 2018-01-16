import { TagFilterPipe } from './tag-filter.pipe';
import { JsonUtilsService } from '../services/json-utils.service';
import { SchemaKeysStoreService } from '../services/schema-keys-store.service';

describe('TagFilterPipe', () => {
  it(`filters records by the fields specified. It returns the union
    of all filters applied to each record.`, () => {
    const pipe = new TagFilterPipe(new JsonUtilsService(new SchemaKeysStoreService()));
    let records = [{
      lla: 3,
      authors: [
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
          ]
        }
      ],
      test: 4,
      dup: 3
    }, {
    authors: [
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
        ]
      }, {
        affiliations: [
          {
            name: 'inst4'
          },
          {
            name: 'inst5'
          }
        ],
        full_name: 'dummy'
      }
    ]}];

    let expected = [{
      authors: [{
          affiliations: [
            {
              value: 'inst3'
            },
            {
              value: 'inst4'
            }
          ]
        }
      ]}, {
      authors: [{
        affiliations: [
          {
            value: 'inst3'
          },
          {
            value: 'inst4'
          }
        ]
      }]
    }];
    let result = pipe.transform(records, 'authors.affiliations.value');
    expect(result).toEqual(expected);
  });
});
