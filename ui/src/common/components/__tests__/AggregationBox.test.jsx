import React from 'react';
import { shallow } from 'enzyme';

import AggregationBox from '../AggregationBox';

describe('AggregationBox', () => {
  it('renders AggreagationBox with action', () => {
    const wrapper = shallow(
      <AggregationBox name="Jessica Jones" headerAction={<h2>PI</h2>}>
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders AggreagationBox without action', () => {
    const wrapper = shallow(
      <AggregationBox name="Jessica Jones">
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders AggreagationBox without children and without action', () => {
    const wrapper = shallow(<AggregationBox name="Jessica Jones" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders AggreagationBox without children and with action', () => {
    const wrapper = shallow(
      <AggregationBox name="Jessica Jones" headerAction={<h2>PI</h2>} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders AggreagationBox with empty string name', () => {
    const wrapper = shallow(
      <AggregationBox name="" headerAction={<h2>PI</h2>}>
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
