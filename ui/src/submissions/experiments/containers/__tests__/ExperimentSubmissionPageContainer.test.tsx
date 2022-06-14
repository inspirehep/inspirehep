import React from 'react';
import { mount, shallow } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import ExperimentSubmissionPageContainer, { ExperimentSubmissionPage } from '../ExperimentSubmissionPageContainer';

import { getStoreWithState } from '../../../../fixtures/store';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExperimentSubmissionSuccessPageContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes props to ExperimentSubmissionSucessPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        submitError: null,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ExperimentSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ExperimentSubmissionPage)).toHaveProp({
      error: null,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('ExperimentSubmissionSucessPage', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('renders', () => {
      const component = shallow(
        <ExperimentSubmissionPage error={null} onSubmit={() => {}} />
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(component).toMatchSnapshot();
    });
  });
});
