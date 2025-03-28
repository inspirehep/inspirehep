import { List } from 'immutable';

import { render } from '@testing-library/react';
import RanksList from '../RanksList';

describe('RanksList', () => {
  it('renders ranks', () => {
    const ranks = List(['POSTDOC', 'PHD']);
    const { queryByText, getByText } = render(<RanksList ranks={ranks} />);
    expect(queryByText(/PostDoc/i)).toBeInTheDocument();
    expect(getByText('PhD')).toBeInTheDocument();
  });
});
