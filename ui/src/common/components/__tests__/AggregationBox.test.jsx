import React from 'react';

import { render } from '@testing-library/react';
import AggregationBox from '../AggregationBox';

describe('AggregationBox', () => {
  it('renders AggreagationBox with action', () => {
    const { getByText } = render(
      <AggregationBox name="Jessica Jones" headerAction={<h2>PI</h2>}>
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(getByText('Jessica Jones')).toBeInTheDocument();
    expect(getByText('PI')).toBeInTheDocument();
    expect(getByText('Defenders')).toBeInTheDocument();
  });

  it('renders AggreagationBox without action', () => {
    const { getByText } = render(
      <AggregationBox name="Jessica Jones">
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(getByText('Jessica Jones')).toBeInTheDocument();
    expect(getByText('Defenders')).toBeInTheDocument();
  });

  it('renders AggreagationBox without children and without action', () => {
    const { getByText } = render(<AggregationBox name="Jessica Jones" />);
    expect(getByText('Jessica Jones')).toBeInTheDocument();
  });

  it('renders AggreagationBox without children and with action', () => {
    const { getByText } = render(
      <AggregationBox name="Jessica Jones" headerAction={<h2>PI</h2>} />
    );
    expect(getByText('Jessica Jones')).toBeInTheDocument();
    expect(getByText('PI')).toBeInTheDocument();
  });

  it('renders AggreagationBox with empty string name', () => {
    const { getByText } = render(
      <AggregationBox name="" headerAction={<h2>PI</h2>}>
        <div>Defenders</div>
      </AggregationBox>
    );
    expect(getByText('PI')).toBeInTheDocument();
    expect(getByText('Defenders')).toBeInTheDocument();
  });
});
