import { List } from 'immutable';

import { render } from '@testing-library/react';
import RegionsList from '../RegionsList';

describe('RegionsList', () => {
  it('renders regions', () => {
    const regions = List(['Asia', 'North America']);
    const { getByText } = render(<RegionsList regions={regions} />);
    expect(getByText('Asia,')).toBeInTheDocument();
    expect(getByText('North America')).toBeInTheDocument();
  });
});
