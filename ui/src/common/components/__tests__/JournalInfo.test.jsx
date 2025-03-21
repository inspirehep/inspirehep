import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import JournalInfo from '../JournalInfo';

describe('JournalInfo', () => {
  it('renders with only journal_title', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
    });
    const { getByText } = render(<JournalInfo info={info} />);
    expect(getByText('Test Journal')).toBeInTheDocument();
  });

  it('renders with journal_title and all other fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      journal_issue: '2',
      year: '2015',
    });
    const { getByText } = render(<JournalInfo info={info} />);

    expect(getByText('Test Journal')).toBeInTheDocument();
    expect(getByText('TV')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
    expect(getByText(/\(2015\)/i)).toBeInTheDocument();
  });
});
