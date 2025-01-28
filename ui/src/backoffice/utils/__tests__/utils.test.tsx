import React from 'react';
import { render } from '@testing-library/react';
import { getIcon, refreshToken, filterByProperty } from '../utils';
import storage from '../../../common/storage';
import { BACKOFFICE_LOGIN_API } from '../../../common/routes';

jest.mock('../../../common/storage');

describe('getIcon', () => {
  it('should return HourglassOutlined for approval status', () => {
    const { container } = render(getIcon('approval') as React.ReactElement);
    expect(container.querySelector('.anticon-hourglass')).toBeInTheDocument();
  });

  it('should return WarningOutlined for error status', () => {
    const { container } = render(getIcon('error') as React.ReactElement);
    expect(container.querySelector('.anticon-warning')).toBeInTheDocument();
  });

  it('should return CheckOutlined for completed status', () => {
    const { container } = render(getIcon('completed') as React.ReactElement);
    expect(container.querySelector('.anticon-check')).toBeInTheDocument();
  });

  it('should return LoadingOutlined for running status', () => {
    const { container } = render(getIcon('running') as React.ReactElement);
    expect(container.querySelector('.anticon-loading')).toBeInTheDocument();
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
