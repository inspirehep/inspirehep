import React from 'react';
import { advanceTo, clear } from 'jest-date-mock';
import { render } from '@testing-library/react';
import SeminarTimezone from '../SeminarTimezone';

describe('SeminarTimezone', () => {
  it('renders with timezone', () => {
    advanceTo('2020-09-10');
    const { getByText } = render(<SeminarTimezone timezone="Europe/Zurich" />);
    expect(getByText('Times in Europe/Zurich (CEST)')).toBeInTheDocument();
    clear();
  });
});
