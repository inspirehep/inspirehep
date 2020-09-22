import { SchemaKeysStoreService } from './schema-keys-store.service';
import { OrderedSet } from 'immutable';

describe('SchemaKeysStoreService', () => {
  let service: SchemaKeysStoreService;

  beforeEach(() => {
    service = new SchemaKeysStoreService();
  });

  it('it should extract keys for each path in a nested complex array', () => {
    let schema = {
      type: 'object',
      properties: {
        anArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              anObject: {
                type: 'object',
                properties: {
                  prop1: {
                    type: 'string'
                  },
                  prop2: {
                    type: 'string'
                  }
                }
              },
              aString: {
                type: 'string'
              },
              innerArray: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    prop1: {
                      type: 'string'
                    },
                    prop2: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    let expectedMap = {
      '': OrderedSet(['anArray']),
      '.anArray': OrderedSet(['anObject', 'aString', 'innerArray']),
      '.anArray.anObject': OrderedSet(['prop1', 'prop2']),
      '.anArray.innerArray': OrderedSet(['prop1', 'prop2'])
    };

    service.buildSchemaKeyStore(schema);
    Object.keys(service.schemaKeyStoreMap)
      .forEach(key => {
        expect(service.schemaKeyStoreMap[key]).toEqual(expectedMap[key]);
      });
  });



  it('it should find items of innerArray', () => {
    let schema = {
      type: 'object',
      properties: {
        anArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              anObject: {
                type: 'object',
                properties: {
                  prop1: {
                    type: 'string'
                  },
                  prop2: {
                    type: 'string'
                  }
                }
              },
              aString: {
                type: 'string'
              },
              innerArray: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    prop1: {
                      type: 'string'
                    },
                    prop2: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    let expectedMap = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        },
        prop2: {
          type: 'string'
        }
      }
    };

    service.buildSchemaKeyStore(schema);
    let subschema = service.findSubSchema('anArray.innerArray');
    expect(subschema).toEqual(expectedMap);
  });

});
