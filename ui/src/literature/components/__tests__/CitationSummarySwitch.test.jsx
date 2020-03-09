import React from 'react';
import { shallow, mount } from 'enzyme';
import { Switch } from 'antd';

import CitationSummarySwitch from '../CitationSummarySwitch';

describe('CitationSummarySwitch', () => {
  it('renders checked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unchecked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked={false}
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCitationSummaryUserPreferenceChange on mount', () => {
    const onCitationSummaryUserPreferenceChange = jest.fn();
    mount(
      <CitationSummarySwitch
        checked={false}
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={
          onCitationSummaryUserPreferenceChange
        }
        citationSummaryEnablingPreference
      />
    );
    expect(onCitationSummaryUserPreferenceChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange on switch change', () => {
    const onChange = jest.fn();

    const wrapper = shallow(
      <CitationSummarySwitch
        checked
        onChange={onChange}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    onSwitchChange(false);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
