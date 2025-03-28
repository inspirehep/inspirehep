/* eslint-disable react/button-has-type, react/prop-types */
import { useCallback } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useIsMounted from '../useIsMounted';

function TestAsyncButton({ asyncOnClick }) {
  const isMounted = useIsMounted();

  const onClick = useCallback(async () => {
    if (isMounted) {
      await asyncOnClick();
    }
  }, [isMounted, asyncOnClick]);
  return <button onClick={onClick}>Test Async</button>;
}

// result is the same regardless if wrapper.unmount() is called or not. remove?
describe('useIsMounted', () => {
  it('does not call onClick when unmounted', () => {
    const asyncOnClick = jest.fn().mockResolvedValue();
    const { unmount } = render(<TestAsyncButton asyncOnClick={asyncOnClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    unmount();
    expect(asyncOnClick).not.toHaveBeenCalled();
  });
});
