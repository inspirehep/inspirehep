import React from 'react';
import { render } from '@testing-library/react';

import NumberOfPages from '../NumberOfPages';

describe('NumberOfPages', () => {
  it('renders with number of pages', () => {
    const numberOfPages = 100;
    const { asFragment } = render(
      <NumberOfPages numberOfPages={numberOfPages} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders empty if null', () => {
    const { asFragment } = render(<NumberOfPages />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('display `page` if number_of_pages is 1', () => {
    const numberOfPages = 1;
    const { asFragment } = render(
      <NumberOfPages numberOfPages={numberOfPages} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
