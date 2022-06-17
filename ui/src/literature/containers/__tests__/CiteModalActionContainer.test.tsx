import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import CiteModalActionContainer from '../CiteModalActionContainer';
import CiteModalAction from '../../components/CiteModalAction';
import { setPreference } from '../../../actions/user';
import { CITE_FORMAT_PREFERENCE } from '../../../reducers/user';


jest.mock('../../../actions/user');


describe('CiteModalActionContainer', () => {
  beforeAll(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
    setPreference.mockReturnValue(async () => {});
  });

 
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(name... Remove this comment to see the full error message
    setPreference.mockClear();
  });

  
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
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onCiteFormatChange(format);
    
    expect(setPreference).toHaveBeenCalledWith(CITE_FORMAT_PREFERENCE, format);
  });
});
