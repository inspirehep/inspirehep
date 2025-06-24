import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { fromJS, Set, List } from 'immutable';

import LiteratureSelectAll from '../LiteratureSelectAll';

describe('LiteratureSelectAll', () => {
  it('renders checked if all publications are part of the selection', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1, 2]);
    const { asFragment } = render(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        onChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('render unchecked if all publications are not part of the selection', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([2]);
    const { asFragment } = render(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        onChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChange with publication ids when checkbox change', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);

    const onChange = jest.fn();
    const selection = Set([2]);
    const { getByRole } = render(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        onChange={onChange}
      />
    );
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(List([1, 2]), true);
  });
});
