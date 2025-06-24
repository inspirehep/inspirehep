import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import DOILinkAction from '../DOILinkAction';

describe('DOILinkAction', () => {
  it('renders with a doi id', () => {
    const dois = fromJS([{ value: '10.1007/s11182-019-01606-1' }]);
    const { asFragment } = render(<DOILinkAction dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with multiple doi ids', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2' },
    ]);
    const { asFragment } = render(<DOILinkAction dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with multiple doi ids and material', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2', material: 'publication' },
    ]);
    const { asFragment } = render(<DOILinkAction dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
