import React from 'react';
import { shallow, mount } from 'enzyme';
import { Switch } from 'antd';

import CitationSummarySwitch from '../CitationSummarySwitch';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CitationSummarySwitch', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders checked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unchecked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onCitationSummaryUserPreferenceChange on mount', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onCitationSummaryUserPreferenceChange = jest.fn();
    mount(
      <CitationSummarySwitch
        checked={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={
          onCitationSummaryUserPreferenceChange
        }
        citationSummaryEnablingPreference
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onCitationSummaryUserPreferenceChange).toHaveBeenCalledWith(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange on switch change', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();

    const wrapper = shallow(
      <CitationSummarySwitch
        checked
        onChange={onChange}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
