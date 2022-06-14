import React from 'react';
import { mount, shallow } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import InstitutionSubmissionPageContainer, { InstitutionSubmissionPage } from '../InstitutionSubmissionPageContainer';

import { getStoreWithState } from '../../../../fixtures/store';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InstitutionSubmissionPageContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(InstitutionSubmissionPage)).toHaveProp({
      error: null,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('InstitutionSubmissionPage', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('renders', () => {
      const component = shallow(
        <InstitutionSubmissionPage error={null} onSubmit={() => {}} />
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(component).toMatchSnapshot();
    });
  });
});