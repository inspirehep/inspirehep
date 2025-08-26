import React from 'react';
import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import Advisor from '../Advisor';

describe('Advisor', () => {
  it('renders linked', () => {
    const advisor = fromJS({
      name: 'Yoda',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const { asFragment } = renderWithRouter(<Advisor advisor={advisor} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with first_name and last_name', () => {
    const advisor = fromJS({
      name: 'Yoda, John',
      first_name: 'John',
      last_name: 'Yoda',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const { asFragment } = renderWithRouter(<Advisor advisor={advisor} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only first_name', () => {
    const advisor = fromJS({
      name: 'Yoda, John',
      first_name: 'John',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const { asFragment } = renderWithRouter(<Advisor advisor={advisor} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders unliked', () => {
    const advisor = fromJS({
      name: 'Yoda',
    });
    const { asFragment } = renderWithRouter(<Advisor advisor={advisor} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
