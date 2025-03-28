import { advanceTo, clear } from 'jest-date-mock';
import { render } from '@testing-library/react';
import DateFromNow from '../DateFromNow';

describe('UpdatedDate', () => {
  afterEach(() => {
    clear();
  });

  it('renders with updated', () => {
    advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const { getByText } = render(
      <DateFromNow date="2019-05-28T13:30:00+00:00" />
    );
    expect(getByText('a minute ago')).toBeInTheDocument();
  });
});
