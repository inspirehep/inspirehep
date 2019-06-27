import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import CiteModalActionContainer from '../CiteModalActionContainer';
import { setPreferredCiteFormat } from '../../../actions/user';
import CiteModalAction from '../../components/CiteModalAction';

jest.mock('../../../actions/user');

describe('CiteModalActionContainer', () => {
  beforeAll(() => {
    setPreferredCiteFormat.mockReturnValue(async () => {});
  });

  afterEach(() => {
    setPreferredCiteFormat.mockClear();
  });

  it('passes user preferred cite format as initialCiteFormat', () => {
    const store = getStoreWithState({
      user: fromJS({
        preferredCiteFormat: 'x-bibtex',
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteModalActionContainer recordId={12345} />
      </Provider>
    );
    expect(wrapper.find(CiteModalAction)).toHaveProp({
      initialCiteFormat: 'x-bibtex',
      recordId: 12345,
    });
  });

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
    expect(setPreferredCiteFormat).toHaveBeenCalledWith(format);
  });
});
