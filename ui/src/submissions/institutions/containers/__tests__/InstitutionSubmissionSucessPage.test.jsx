import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import InstitutionSubmissionSuccessPageContainer, { InstitutionSubmissionSuccessPage } from '../InstitutionSubmissionSuccessPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';

describe('InstitutionSubmissionSuccessPageContainer', () => {
  it('passes props to InstitutionSubmissionSucessPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        successData: {
          control_number: 12345,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <InstitutionSubmissionSuccessPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(InstitutionSubmissionSuccessPage)).toHaveProp({
      recordId: 12345,
    });
  });

  describe('InstitutionSubmissionSucessPage', () => {
    it('renders', () => {
      const component = shallow(
        <InstitutionSubmissionSuccessPage recordId={12345} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});
