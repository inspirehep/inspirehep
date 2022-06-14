import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'antd';

import SearchBox from '../SearchBox';
import { LITERATURE_NS } from '../../../../search/constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SearchBox', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <SearchBox
        namespace={LITERATURE_NS}
        value="value"
        placeholder="placeholder"
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ namespace: string; value: string; placehol... Remove this comment to see the full error message
        searchScopeName="scope"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSearch={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders new value on change', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      <SearchBox value="value" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );
    const inputWrapper = wrapper.find(Input.Search);
    inputWrapper.simulate('change', { target: { value: 'new' } });
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('overrides internal state with prop', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      <SearchBox value="value" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );
    const inputWrapper = wrapper.find(Input.Search);
    inputWrapper.simulate('change', { target: { value: 'internal' } });
    wrapper.setProps({ value: 'prop' });
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
