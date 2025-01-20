import React from 'react';
import { render } from '@testing-library/react';

import ConferenceDates from '../ConferenceDates';

describe('ConferenceDates', () => {
  it('renders only opening date ', () => {
    const opening = '2019-05-12';
    const { container } = render(<ConferenceDates openingDate={opening} />);
    expect(container).toMatchSnapshot();
  });

  it('renders only opening date with missing day', () => {
    const opening = '2019-05';
    const { container } = render(<ConferenceDates openingDate={opening} />);
    expect(container).toMatchSnapshot();
  });

  it('renders only of the dates if opening and closing are same', () => {
    const opening = '2019-05-02';
    const closing = '2019-05-02';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when opening and closing on different dates of the same month', () => {
    const opening = '2019-05-02';
    const closing = '2019-05-05';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when opening and closing in different months of the same year', () => {
    const opening = '2019-04-29';
    const closing = '2019-05-05';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when opening and closing in different months of the same year and day is missing', () => {
    const opening = '2019-04';
    const closing = '2019-07';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when opening and closing has only (same) year', () => {
    const opening = '2019';
    const closing = '2019';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when opening and closing is completely different', () => {
    const opening = '2019-12-30';
    const closing = '2020-01-05';
    const { container } = render(<ConferenceDates openingDate={opening} closingDate={closing} />);
    expect(container).toMatchSnapshot();
  });
});
