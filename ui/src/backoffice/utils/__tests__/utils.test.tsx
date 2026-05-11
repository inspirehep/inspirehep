import { List, Map as ImmutableMap } from 'immutable';
import {
  refreshToken,
  filterByProperty,
  formatDateTime,
  getDag,
  filterDecisions,
  hasPublicationInfo,
  isLiteratureUpdateWorkflow,
} from '../utils';
import storage from '../../../common/storage';
import { BACKOFFICE_LOGIN_API } from '../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../constants';
import { WorkflowDecisions } from '../../../common/constants';

jest.mock('../../../common/storage');

describe('refreshToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call storage.getSync and fetch with the correct URL and payload', async () => {
    const mockToken = 'mockRefreshToken';
    (storage.getSync as jest.Mock).mockReturnValue(mockToken);

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ access: 'newAccessToken' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await refreshToken();

    expect(storage.getSync).toHaveBeenCalledWith('backoffice.refreshToken');
    expect(fetch).toHaveBeenCalledWith(`${BACKOFFICE_LOGIN_API}refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: mockToken }),
    });
    expect(storage.set).toHaveBeenCalledWith(
      'backoffice.token',
      'newAccessToken'
    );
    expect(result).toBe('newAccessToken');
  });
});

describe('filterByProperty', () => {
  let testData: Map<string, Array<Map<string, string>>>;

  beforeEach(() => {
    const items = [
      new Map<string, string>([
        ['schema', 'ORCID'],
        ['value', '0000-0001-2345-6789'],
      ]),
      new Map<string, string>([
        ['schema', 'DOI'],
        ['value', '10.1000/xyz123'],
      ]),
      new Map<string, string>([
        ['schema', 'ORCID'],
        ['value', '0000-0002-6789-1234'],
      ]),
    ];

    testData = new Map([['ids', items]]);
  });

  it('should include only items with schema value "ORCID"', () => {
    const result = filterByProperty(testData, 'ids', 'schema', 'ORCID', true);

    expect(result).toHaveLength(2);
    expect(result[0].get('schema')).toBe('ORCID');
    expect(result[1].get('schema')).toBe('ORCID');
  });

  it('should exclude items with schema value "ORCID"', () => {
    const result = filterByProperty(testData, 'ids', 'schema', 'ORCID', false);

    expect(result).toHaveLength(1);
    expect(result[0].get('schema')).toBe('DOI');
    expect(result[0].get('value')).toBe('10.1000/xyz123');
  });
});

describe('formatDateTime', () => {
  it('should return an object with formatted date and time for a valid date', () => {
    const rawDateTime = '2024-02-11T15:30:00Z';
    const result = formatDateTime(rawDateTime);

    expect(result).toEqual({
      date: '2024-02-11',
      time: '15:30',
    });
  });

  it('should return undefined for an invalid date', () => {
    const rawDateTime = 'invalid-date-string';
    const result = formatDateTime(rawDateTime);

    expect(result).toBeUndefined();
  });
});

describe('getDag', () => {
  it.each([
    [WorkflowTypes.AUTHOR_CREATE, 'author_create_initialization_dag'],
    [WorkflowTypes.AUTHOR_UPDATE, 'author_update_dag'],
    [WorkflowTypes.HEP_CREATE, 'hep_create_dag'],
    [WorkflowTypes.HEP_PUBLISHER_CREATE, 'hep_create_dag'],
    [WorkflowTypes.HEP_PUBLISHER_UPDATE, 'hep_create_dag'],
    [WorkflowTypes.HEP_SUBMISSION, 'hep_create_dag'],
    [WorkflowTypes.HEP_UPDATE, 'hep_create_dag'],
    ['AUTHOR_CREATE', 'author_create_initialization_dag'],
    ['AUTHOR_UPDATE', 'author_update_dag'],
    ['HEP_CREATE', 'hep_create_dag'],
    ['HEP_PUBLISHER_CREATE', 'hep_create_dag'],
    ['HEP_PUBLISHER_UPDATE', 'hep_create_dag'],
    ['HEP_SUBMISSION', 'hep_create_dag'],
    ['HEP_UPDATE', 'hep_create_dag'],
  ])('returns the expected DAG for %j', (input, expected) => {
    expect(getDag(input)).toBe(expected);
  });
});

describe('isLiteratureUpdateWorkflow', () => {
  it('returns true for HEP_UPDATE workflows', () => {
    expect(isLiteratureUpdateWorkflow(WorkflowTypes.HEP_UPDATE)).toBe(true);
  });

  it('returns true for HEP_PUBLISHER_UPDATE workflows', () => {
    expect(isLiteratureUpdateWorkflow(WorkflowTypes.HEP_PUBLISHER_UPDATE)).toBe(
      true
    );
  });

  it('returns false for non-update workflows', () => {
    expect(isLiteratureUpdateWorkflow(WorkflowTypes.HEP_CREATE)).toBe(false);
  });
});

describe('filterDecisions', () => {
  const makeDecisions = (actions: string[]) =>
    List(actions.map((action) => ImmutableMap({ action })));

  it('returns null when decisions are undefined', () => {
    expect(filterDecisions(undefined)).toBeNull();
  });

  it.each([
    WorkflowDecisions.FUZZY_MATCH,
    WorkflowDecisions.EXACT_MATCH,
    WorkflowDecisions.MERGE_APPROVE,
    WorkflowDecisions.MISSING_SUBJECT_FIELDS,
  ])('filters out %s decisions', (action) => {
    const result = filterDecisions(makeDecisions([action]));
    expect(result?.size).toBe(0);
  });

  it('keeps decisions that are not in the hidden list', () => {
    const result = filterDecisions(
      makeDecisions([
        WorkflowDecisions.HEP_ACCEPT,
        WorkflowDecisions.HEP_REJECT,
      ])
    );
    expect(result?.size).toBe(2);
  });

  it('removes only hidden decisions from a mixed list', () => {
    const result = filterDecisions(
      makeDecisions([
        WorkflowDecisions.HEP_ACCEPT,
        WorkflowDecisions.FUZZY_MATCH,
        WorkflowDecisions.EXACT_MATCH,
        WorkflowDecisions.MERGE_APPROVE,
        WorkflowDecisions.MISSING_SUBJECT_FIELDS,
        WorkflowDecisions.HEP_REJECT,
      ])
    );
    expect(result?.size).toBe(2);
    expect(
      result
        ?.map((d: ImmutableMap<string, any>) => d.get('action'))
        .toList()
        .toJS()
    ).toEqual([WorkflowDecisions.HEP_ACCEPT, WorkflowDecisions.HEP_REJECT]);
  });
});

describe('hasPublicationInfo', () => {
  it('returns true when first publication has journal_title', () => {
    const publicationInfo = List([
      ImmutableMap({
        journal_title: 'J.Math.Phys.',
      }),
    ]);

    expect(hasPublicationInfo(publicationInfo)).toBe(true);
  });

  it('returns true when first publication has pubinfo_freetext', () => {
    const publicationInfo = List([
      ImmutableMap({
        pubinfo_freetext: 'Phys. Lett. B 870 (2025) 139959',
      }),
    ]);

    expect(hasPublicationInfo(publicationInfo)).toBe(true);
  });

  it('returns false when first publication has neither journal_title nor pubinfo_freetext', () => {
    const publicationInfo = List([
      ImmutableMap({
        year: 2025,
      }),
    ]);

    expect(hasPublicationInfo(publicationInfo)).toBe(false);
  });
});
