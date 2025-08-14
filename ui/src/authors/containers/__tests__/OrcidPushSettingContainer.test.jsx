import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import OrcidPushSettingContainer from '../OrcidPushSettingContainer';
import { USER_SET_ORCID_PUSH_SETTING_REQUEST } from '../../../actions/actionTypes';
import OrcidPushSetting from '../../components/OrcidPushSetting';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('../../components/OrcidPushSetting', () => {
  const actual = jest.requireActual('../../components/OrcidPushSetting');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

describe('OrcidPushSettingContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('passes state to props', () => {
    const store = getStore({
      user: fromJS({
        data: {
          allow_orcid_push: true,
          orcid: '0000-0001-8058-0014',
        },
        isUpdatingOrcidPushSetting: false,
      }),
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1,
            bai: 'Author.1.E',
          },
        },
      }),
    });
    renderWithProviders(<OrcidPushSettingContainer />, { store });

    expect(OrcidPushSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        isUpdating: false,
        enabled: true,
      }),
      expect.anything()
    );
  });

  it('dispatches USER_SET_ORCID_PUSH_SETTING_REQUEST on change', async () => {
    const store = getStore({
      user: fromJS({
        data: {
          allow_orcid_push: true,
          orcid: '0000-0001-8058-0014',
        },
        isUpdatingOrcidPushSetting: false,
      }),
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1,
            bai: 'Author.1.E',
          },
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<OrcidPushSettingContainer />, {
      store,
    });

    const switchElement = getByTestId('orcid-switch');
    fireEvent.click(switchElement);

    await waitFor(() => {
      const confirmButton = document.querySelector(
        '.ant-popconfirm .ant-btn-primary'
      );
      expect(confirmButton).toBeInTheDocument();
      fireEvent.click(confirmButton);
    });

    const settingValue = false;
    const expectedActions = [
      {
        type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
        payload: { value: settingValue },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
