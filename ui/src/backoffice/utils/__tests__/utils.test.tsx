import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getIcon, refreshToken } from '../utils';
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
