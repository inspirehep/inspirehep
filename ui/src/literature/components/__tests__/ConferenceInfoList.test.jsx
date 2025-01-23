import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

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
    const wrapper = shallow(<ConferenceInfoList conferenceInfo={info} />);
    expect(wrapper.dive()).toMatchSnapshot();
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
    const wrapper = shallow(
      <ConferenceInfoList conferenceInfo={info} isProceedings={false} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
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
    const wrapper = shallow(
      <ConferenceInfoList conferenceInfo={info} isProceedings />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
