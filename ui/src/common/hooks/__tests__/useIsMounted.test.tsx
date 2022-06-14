/* eslint-disable react/button-has-type, react/prop-types */
import React, { useCallback } from 'react';
import { mount } from 'enzyme';

import useIsMounted from '../useIsMounted';

function TestAsyncButton({
  asyncOnClick
}: $TSFixMe) {
  const isMounted = useIsMounted();

  const onClick = useCallback(
    async () => {
      if (isMounted) {
        await asyncOnClick();
      }
    },
    [isMounted, asyncOnClick]
  );
  return <button onClick={onClick}>Test Async</button>;
}

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('useIsMounted', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not call onClick when unmounted', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const asyncOnClick = jest.fn().mockResolvedValue();
    const wrapper = mount(<TestAsyncButton asyncOnClick={asyncOnClick} />);
    wrapper.find('button').simulate('click');
    wrapper.unmount();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(asyncOnClick).not.toHaveBeenCalled();
  });
});
