import React from 'react';
import { mount, shallow } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import ConferenceSubmissionSuccessPageContainer, {
  ConferenceSubmissionSucessPage,
} from '../ConferenceSubmissionSuccessPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceSubmissionSuccessPageContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes props to ConferenceSubmissionSucessPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        successData: {
          pid_value: 12345,
          cnum: 'C19-02-01',
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ConferenceSubmissionSuccessPageContainer />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ConferenceSubmissionSucessPage)).toHaveProp({
      cnum: 'C19-02-01',
      recordId: 12345,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('ConferenceSubmissionSucessPage', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('renders', () => {
      const component = shallow(
        <ConferenceSubmissionSucessPage cnum="C19-02-01" recordId={12345} />
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(component).toMatchSnapshot();
    });
  });
});
