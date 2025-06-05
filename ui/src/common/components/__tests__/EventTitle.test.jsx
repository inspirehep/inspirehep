import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import EventTitle from '../EventTitle';

describe('EventTitle', () => {
  it('renders with only title', () => {
    const title = fromJS({ title: 'Conference Title' });
    const { getByText } = render(<EventTitle title={title} />);
    expect(getByText('Conference Title')).toBeInTheDocument();
  });

  it('renders with also subtitle', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const { getByText } = render(<EventTitle title={title} />);
    expect(getByText('Conference Title')).toBeInTheDocument();
    expect(getByText('Sub')).toBeInTheDocument();
  });

  it('renders with everything', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const acronym = 'Test';
    const { getByText } = render(
      <EventTitle title={title} acronym={acronym} />
    );
    expect(getByText('Conference Title')).toBeInTheDocument();
    expect(getByText('Sub')).toBeInTheDocument();
    expect(getByText('(Test)')).toBeInTheDocument();
  });
});
