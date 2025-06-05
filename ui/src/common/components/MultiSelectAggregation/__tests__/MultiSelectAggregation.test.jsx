import React from 'react';
import { fromJS } from 'immutable';
import { fireEvent, render } from '@testing-library/react';

import MultiSelectAggregation from '../MultiSelectAggregation';

import * as constants from '../constants';

jest.mock('../constants');

describe('MultiSelectAggregation', () => {
  it('renders', () => {
    const buckets = fromJS([
      {
        key: `bucket1`,
        doc_count: 1,
      },
      {
        key: `bucket2`,
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <MultiSelectAggregation
        name="Test"
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with custom display values if configured', () => {
    const buckets = fromJS([
      {
        key: `unknown bucket`,
        doc_count: 1,
      },
      {
        key: `bucket`,
        doc_count: 2,
      },
    ]);
    constants.SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG = {
      Test: {
        bucket: 'Bucket (Cool)',
      },
    };
    const { asFragment } = render(
      <MultiSelectAggregation
        name="Test"
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChange with checked bucket on select box selections change', () => {
    const onChange = jest.fn();
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
    ]);
    const screen = render(
      <MultiSelectAggregation
        onChange={onChange}
        buckets={buckets}
        name="Test"
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getAllByText('bucket1')[1]);

    expect(onChange).toHaveBeenCalledWith(['bucket1'], expect.anything());
  });
});
