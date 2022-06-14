/* eslint-disable react/button-has-type, react/prop-types */
import React, { useCallback } from 'react';
import { mount } from 'enzyme';

import useIsMounted from '../useIsMounted';

function TestAsyncButton({ asyncOnClick }) {
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

describe('useIsMounted', () => {
  it('does not call onClick when unmounted', () => {
    const asyncOnClick = jest.fn().mockResolvedValue();
    const wrapper = mount(<TestAsyncButton asyncOnClick={asyncOnClick} />);
    wrapper.find('button').simulate('click');
    wrapper.unmount();
    expect(asyncOnClick).not.toHaveBeenCalled();
  });
});
