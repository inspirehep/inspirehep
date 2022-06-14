import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import usePrevious from '../usePrevious';

// eslint-disable-next-line react/prop-types
function TestPrevious({
  value
}: any) {
  const previousValue = usePrevious(value);
  return (
    <span>
      Previous: {previousValue}, Current: {value}
    </span>
  );
}

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('usePrevious', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders previous and current value', () => {
    const wrapper = mount(<TestPrevious value={1} />);
    act(() => {
      wrapper.setProps({ value: 2 });
      wrapper.update();
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
