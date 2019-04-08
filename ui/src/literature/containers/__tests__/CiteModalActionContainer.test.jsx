import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteModalActionContainer, {
  dispatchToProps,
} from '../CiteModalActionContainer';
import * as user from '../../../actions/user';
import CiteModalAction from '../../components/CiteModalAction';

jest.mock('../../../actions/user');

describe('CiteModalActionContainer', () => {
  it('passes user preferred cite format as initialCiteFormat', () => {
    const store = getStoreWithState({
      user: fromJS({
        preferredCiteFormat: 'x-bibtex',
      }),
    });
    const wrapper = mount(
      <CiteModalActionContainer recordId={12345} store={store} />
    );
    const dummyWrapper = wrapper.find(CiteModalAction);
    expect(dummyWrapper).toHaveProp('initialCiteFormat', 'x-bibtex');
    expect(dummyWrapper).toHaveProp('recordId', 12345);
  });

  it('calls setPreferredCiteFormat onCiteFormatChange', () => {
    const mockSetPreferredCiteFormat = jest.fn();
    user.setPreferredCiteFormat = mockSetPreferredCiteFormat;
    const props = dispatchToProps(jest.fn());
    const format = `x-bibtex`;
    props.onCiteFormatChange(format);
    expect(mockSetPreferredCiteFormat).toHaveBeenCalledWith(format);
  });
});
