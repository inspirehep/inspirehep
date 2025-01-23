import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import JournalSubmissionPageContainer, {
  JournalSubmissionPage,
} from '../JournalSubmissionPageContainer';

import { getStoreWithState } from '../../../../fixtures/store';

describe('JournalSubmissionPageContainer', () => {
  it('passes props to JournalSubmissionPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        submitError: {
          message: null,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <JournalSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(JournalSubmissionPage)).toHaveProp({
      error: null,
    });
  });

  describe('JournalSubmissionPage', () => {
    it('renders', () => {
      const component = shallow(
        <JournalSubmissionPage error={null} onSubmit={() => {}} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});
