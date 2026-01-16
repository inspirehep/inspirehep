import React from 'react';
import { render } from '@testing-library/react';
import {
  getIcon,
  refreshToken,
  filterByProperty,
  formatDateTime,
  getDag,
} from '../utils';
import storage from '../../../common/storage';
import { BACKOFFICE_LOGIN_API } from '../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../constants';

jest.mock('../../../common/storage');

describe('getIcon', () => {
  it('should return HourglassOutlined for approval status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.APPROVAL) as React.ReactElement
    );
    expect(container.querySelector('.anticon-hourglass')).toBeInTheDocument();
  });

  it('should return WarningOutlined for error status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.ERROR) as React.ReactElement
    );
    expect(container.querySelector('.anticon-warning')).toBeInTheDocument();
  });

  it('should return CheckOutlined for completed status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.COMPLETED) as React.ReactElement
    );
    expect(container.querySelector('.anticon-check')).toBeInTheDocument();
  });

  it('should return LoadingOutlined for running status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.RUNNING) as React.ReactElement
    );
    expect(container.querySelector('.anticon-loading')).toBeInTheDocument();
  });

  it('should return FieldTimeOutlined for processing status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.PROCESSING) as React.ReactElement
    );
    expect(container.querySelector('.anticon-field-time')).toBeInTheDocument();
  });

  it('should return StopOutlined for blocked status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.BLOCKED) as React.ReactElement
    );
    expect(container.querySelector('.anticon-stop')).toBeInTheDocument();
  });

  it('should return HourglassOutlined for fuzzy matching status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.APPROVAL_FUZZY_MATCHING) as React.ReactElement
    );
    expect(container.querySelector('.anticon-hourglass')).toBeInTheDocument();
  });

  it('should return HourglassOutlined for fuzzy merging status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.APPROVAL_MERGE) as React.ReactElement
    );
    expect(container.querySelector('.anticon-hourglass')).toBeInTheDocument();
  });

  it('should return WarningOutlined for multiple exact matches status', () => {
    const { container } = render(
      getIcon(
        WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES
      ) as React.ReactElement
    );
    expect(container.querySelector('.anticon-warning')).toBeInTheDocument();
  });

  it('should return WarningOutlined for validation error status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.ERROR_VALIDATION) as React.ReactElement
    );
    expect(container.querySelector('.anticon-warning')).toBeInTheDocument();
  });

  it('should return HourglassOutlined for core selection approval status', () => {
    const { container } = render(
      getIcon(WorkflowStatuses.APPROVAL_CORE_SELECTION) as React.ReactElement
    );
    expect(container.querySelector('.anticon-hourglass')).toBeInTheDocument();
  });

  it('should return null for unknown status', () => {
    const icon = getIcon('unknown');
    expect(icon).toBeNull();
  });
});

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
    [WorkflowTypes.HEP_UPDATE, 'hep_create_dag'],
    ['AUTHOR_CREATE', 'author_create_initialization_dag'],
    ['AUTHOR_UPDATE', 'author_update_dag'],
    ['HEP_CREATE', 'hep_create_dag'],
    ['HEP_UPDATE', 'hep_create_dag'],
  ])('returns the expected DAG for %j', (input, expected) => {
    expect(getDag(input)).toBe(expected);
  });
});
