import { render } from '@testing-library/react';

import UnclickableTag from '../UnclickableTag';

describe('UnclickableTag', () => {
  it('renders with all props set', () => {
    const { asFragment } = render(
      <UnclickableTag
        className="this-is-a-test-class"
        color="blue"
        visible
        closable
      >
        This is a tag
      </UnclickableTag>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders without props', () => {
    const { getByText } = render(
      <UnclickableTag>This is a tag</UnclickableTag>
    );

    expect(getByText('This is a tag')).toBeInTheDocument();
  });
});
