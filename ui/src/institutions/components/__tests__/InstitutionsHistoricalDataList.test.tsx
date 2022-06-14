import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import InstitutionsHistoricalDataList from '../InstitutionsHistoricalDataList';

describe('InstitutionsHistoricalDataList', () => {
  it('renders', () => {
    const historicalData = fromJS(['This is my first note', 'second note']);
    const wrapper = shallow(
      <InstitutionsHistoricalDataList historicalData={historicalData} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
