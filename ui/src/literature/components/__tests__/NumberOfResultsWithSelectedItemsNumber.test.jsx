import React from 'react';
import { shallow } from 'enzyme';

import NumberOfResultsWithSelectedItemsNumber from '../NumberOfResultsWithSelectedItemsNumber';

describe('NumberOfResultsWithSelectedItemsNumber', () => {
  it('renders correctly with default props', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber namespace="testNamespace" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        namespace="testNamespace"
        numberOfSelected={5}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected as 0', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        namespace="testNamespace"
        numberOfSelected={0}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
