import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import BibliographyGeneratorPageContainer from '../BibliographyGeneratorPageContainer';
import { getStoreWithState } from '../../fixtures/store';
import BibliographyGenerator from '../BibliographyGenerator';
import { BIBLIOGRAPHY_GENERATOR_REQUEST } from '../../actions/actionTypes';

describe('BibliographyGeneratorPageContainer', () => {
  it('passes props down', () => {
    const store = getStoreWithState({
      bibliographyGenerator: fromJS({
        data: { download_url: 'https://google.com' },
        citationErrors: [
          {
            message: 'Citation error 1',
          },
        ],
        error: { message: 'Error' },
        loading: false,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <BibliographyGeneratorPageContainer />
      </Provider>
    );
    expect(wrapper.find(BibliographyGenerator)).toHaveProp({
      data: fromJS({ download_url: 'https://google.com' }),
      citationErrors: fromJS([{ message: 'Citation error 1' }]),
      error: fromJS({ message: 'Error' }),
      loading: false,
    });
  });

  it('dispatches BIBLIOGRAPHY_GENERATOR_REQUEST on submission', () => {
    const store = getStoreWithState({
      bibliographyGenerator: fromJS({
        data: { download_url: 'https://google.com' },
        citationErrors: [
          {
            message: 'Citation error 1',
          },
        ],
        error: { message: 'Error' },
        loading: false,
      }),
    });
    const data = {
      format: 'bibtex',
      fileupload: {
        file: 'this is a file',
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <BibliographyGeneratorPageContainer />
      </Provider>
    );
    const onSubmit = wrapper.find(BibliographyGenerator).prop('onSubmit');
    onSubmit(data);
    const expectedActions = [
      {
        type: BIBLIOGRAPHY_GENERATOR_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
