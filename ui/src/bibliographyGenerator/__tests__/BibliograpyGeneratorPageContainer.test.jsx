import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import BibliographyGeneratorPageContainer from '../BibliographyGeneratorPageContainer';
import BibliographyGenerator from '../BibliographyGenerator';
import { getStore } from '../../fixtures/store';
import { BIBLIOGRAPHY_GENERATOR_REQUEST } from '../../actions/actionTypes';

jest.mock('../BibliographyGenerator', () => {
  const MockBibliographyGenerator = jest.fn(() => null);
  return MockBibliographyGenerator;
});

describe('BibliographyGeneratorPageContainer', () => {
  beforeAll(() => {
    global.window.open = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes props to BibliographyGenerator component', () => {
    const expectedState = {
      data: fromJS({ download_url: 'https://google.com' }),
      citationErrors: fromJS([{ message: 'Citation error 1' }]),
      error: fromJS({ message: 'Error' }),
      loading: false,
    };

    const store = getStore({
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

    render(
      <Provider store={store}>
        <BibliographyGeneratorPageContainer />
      </Provider>
    );

    expect(BibliographyGenerator).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expectedState.data,
        citationErrors: expectedState.citationErrors,
        error: expectedState.error,
        loading: expectedState.loading,
      }),
      expect.any(Object)
    );
  });

  it('dispatches BIBLIOGRAPHY_GENERATOR_REQUEST on submission', () => {
    const store = getStore({
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

    render(
      <Provider store={store}>
        <BibliographyGeneratorPageContainer />
      </Provider>
    );

    const { onSubmit } = BibliographyGenerator.mock.calls[0][0];

    const data = {
      format: 'bibtex',
      fileupload: {
        file: 'this is a file',
      },
    };
    onSubmit(data);

    const expectedActions = [
      {
        type: BIBLIOGRAPHY_GENERATOR_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
