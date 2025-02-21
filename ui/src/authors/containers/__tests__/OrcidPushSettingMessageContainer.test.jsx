import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import OrcidPushSettingMessageContainer from '../OrcidPushSettingMessageContainer';

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
    const { getByTestId } = render(
      <Provider store={store}>
        <OrcidPushSettingMessageContainer />
      </Provider>
    );
    expect(getByTestId('orcid-push-setting-message')).toHaveTextContent(
      'Your INSPIRE works are not exported to your ORCID yet.'
    );
  });
});
