import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import CiteModalActionContainer from '../CiteModalActionContainer';
import CiteModalAction from '../../components/CiteModalAction';
import { setPreference } from '../../../actions/user';
import { CITE_FORMAT_PREFERENCE } from '../../../reducers/user';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/user');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CiteModalActionContainer', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
  beforeAll(() => {
    (setPreference as $TSFixMe).mockReturnValue(async () => { });
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    (setPreference as $TSFixMe).mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes user preferred cite format as initialCiteFormat', () => {
    const store = getStoreWithState({
      user: fromJS({
        preferences: {
          [CITE_FORMAT_PREFERENCE]: 'x-bibtex',
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteModalActionContainer recordId={12345} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CiteModalAction)).toHaveProp({
      initialCiteFormat: 'x-bibtex',
      recordId: 12345,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls setPreferredCiteFormat on CiteModalAction cite format change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CiteModalActionContainer recordId={12345} />
      </Provider>
    );
    const format = 'x-bibtex';
    const onCiteFormatChange = wrapper
      .find(CiteModalAction)
      .prop('onCiteFormatChange');
    onCiteFormatChange(format);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setPreference).toHaveBeenCalledWith(CITE_FORMAT_PREFERENCE, format);
  });
});
