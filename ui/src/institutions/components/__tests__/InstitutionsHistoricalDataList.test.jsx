import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import InstitutionsHistoricalDataList from '../InstitutionsHistoricalDataList';

describe('InstitutionsHistoricalDataList', () => {
  it('renders', () => {
    const historicalData = fromJS(['This is my first note', 'second note']);
    const { asFragment } = render(
      <InstitutionsHistoricalDataList historicalData={historicalData} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
