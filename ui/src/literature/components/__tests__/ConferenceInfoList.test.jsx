import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';

import { Provider } from 'react-redux';
import ConferenceInfoList from '../ConferenceInfoList';
import { getStore } from '../../../fixtures/store';

describe('ConferenceInfoList', () => {
  it('renders conference link', () => {
    const info = fromJS([
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 111111,
      },
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 222222,
      },
    ]);
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ConferenceInfoList conferenceInfo={info} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders contribution label if document type is other than proceedings', () => {
    const info = fromJS([
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 111111,
      },
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 222222,
      },
    ]);

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ConferenceInfoList conferenceInfo={info} isProceedings={false} />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  it('renders proceedings label if document type is proceedings', () => {
    const info = fromJS([
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 111111,
      },
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 222222,
      },
    ]);
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ConferenceInfoList conferenceInfo={info} isProceedings />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
