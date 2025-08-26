import React from 'react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../fixtures/render';
import ConferenceInfoList from '../ConferenceInfoList';

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
    const { asFragment } = renderWithProviders(
      <ConferenceInfoList conferenceInfo={info} />
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

    const { asFragment } = renderWithProviders(
      <ConferenceInfoList conferenceInfo={info} isProceedings={false} />
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
    const { asFragment } = renderWithProviders(
      <ConferenceInfoList conferenceInfo={info} isProceedings />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
