import React from 'react';
import { shallow } from 'enzyme';
import { Switch } from 'antd';

import CitationSummarySwitch from '../CitationSummarySwitch';

describe('CitationSummarySwitch', () => {
  it('renders checked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch checked onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unchecked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch checked={false} onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange on switch change', () => {
    const onChange = jest.fn();

    const wrapper = shallow(
      <CitationSummarySwitch checked onChange={onChange} />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    onSwitchChange(false);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
