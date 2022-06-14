import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import ConferenceSubmissionSuccessPageContainer, {
  ConferenceSubmissionSucessPage,
} from '../ConferenceSubmissionSuccessPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';

describe('ConferenceSubmissionSuccessPageContainer', () => {
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
    expect(wrapper.find(ConferenceSubmissionSucessPage)).toHaveProp({
      cnum: 'C19-02-01',
      recordId: 12345,
    });
  });

  describe('ConferenceSubmissionSucessPage', () => {
    it('renders', () => {
      const component = shallow(
        <ConferenceSubmissionSucessPage cnum="C19-02-01" recordId={12345} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});
