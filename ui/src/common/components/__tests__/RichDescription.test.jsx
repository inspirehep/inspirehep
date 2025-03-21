import { render } from '@testing-library/react';

import RichDescription from '../RichDescription';

describe('RichDescription', () => {
  it('renders with description', () => {
    const { asFragment } = render(
      <RichDescription>description</RichDescription>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
