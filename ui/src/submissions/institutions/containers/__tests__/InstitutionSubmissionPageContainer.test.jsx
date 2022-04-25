import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import InstitutionSubmissionPageContainer, { InstitutionSubmissionPage } from '../InstitutionSubmissionPageContainer';

import { getStoreWithState } from '../../../../fixtures/store';

describe('InstitutionSubmissionPageContainer', () => {
  it('passes props to InstitutionSubmissionPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        submitError: null,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <InstitutionSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(InstitutionSubmissionPage)).toHaveProp({
      error: null,
    });
  });

  describe('InstitutionSubmissionPage', () => {
    it('renders', () => {
      const component = shallow(
        <InstitutionSubmissionPage error={null} onSubmit={() => {}} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});