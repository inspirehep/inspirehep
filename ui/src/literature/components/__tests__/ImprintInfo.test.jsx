import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import ImprintInfo from '../ImprintInfo';

describe('ImprintInfo', () => {
  it('renders imprints with date', () => {
    const imprint = fromJS([
      {
        date: '2004',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with place', () => {
    const imprint = fromJS([
      {
        place: 'Cambridge, UK',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with publisher', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with date and publisher', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with date and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        place: 'Cambridge, UK',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with publisher and place', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders imprints with date, publisher, and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders multiple imprints', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
      {
        date: '2010',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders date with month and day', () => {
    const imprint = fromJS([
      {
        date: '2018-06-17',
      },
    ]);
    const { asFragment } = render(<ImprintInfo imprint={imprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
