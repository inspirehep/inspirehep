import React from 'react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import OrcidPushSettingMessageContainer from '../OrcidPushSettingMessageContainer';
import { renderWithProviders } from '../../../fixtures/render';

describe('OrcidPushSettingMessageContainer', () => {
  it('passes state to props', () => {
    const store = getStore({
      user: fromJS({
        data: {
          allow_orcid_push: false,
          orcid: '0000-0001-8058-0014',
        },
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
    const { getByTestId } = renderWithProviders(
      <OrcidPushSettingMessageContainer />,
      { store }
    );
    expect(getByTestId('orcid-push-setting-message')).toHaveTextContent(
      'Your INSPIRE works are not exported to your ORCID yet.'
    );
  });
});
