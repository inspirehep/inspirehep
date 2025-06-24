import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import Abstract from '../Abstract';

describe('Abstract', () => {
  it('renders with abstract', () => {
    const abstract = fromJS({
      source: 'arXiv',
      value: 'Test abstract',
    });
    const { asFragment } = render(<Abstract abstract={abstract} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not display abstractSource when it is null', () => {
    const abstract = fromJS({
      value: 'Test abstract',
    });
    const { asFragment } = render(<Abstract abstract={abstract} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render if abstract is null', () => {
    const { asFragment } = render(<Abstract />);
    expect(asFragment()).toMatchSnapshot();
  });
});
