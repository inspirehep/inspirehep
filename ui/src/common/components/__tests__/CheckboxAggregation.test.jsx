import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckboxAggregation, {
  BUCKET_NAME_SPLITTER,
} from '../CheckboxAggregation';

describe('CheckboxAggregation', () => {
  it('render initial state with all props set', () => {
    const buckets = fromJS([
      {
        key: `prefix${BUCKET_NAME_SPLITTER}bucket1`,
        doc_count: 1000000,
      },
      {
        key: `prefix${BUCKET_NAME_SPLITTER}bucket2`,
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="bucket1"
        splitDisplayName
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('render initial state with bucketHelp', () => {
    const keyBucket1 = `prefix${BUCKET_NAME_SPLITTER}bucket1`;
    const keyBucket2 = `prefix${BUCKET_NAME_SPLITTER}bucket2`;
    const keyBucket3 = `prefix${BUCKET_NAME_SPLITTER}bucket3`;
    const buckets = fromJS([
      {
        key: keyBucket1,
        doc_count: 1,
      },
      {
        key: keyBucket2,
        doc_count: 2,
      },
      {
        key: keyBucket3,
        doc_count: 3,
      },
    ]);
    const bucketHelp = fromJS({
      [keyBucket1]: {
        text: 'Published papers are believed to have undergone rigorous peer review.',
        link: 'https://inspirehep.net/info/faq/general#published',
      },
      [keyBucket2]: {
        text: 'Published papers are believed to have undergone rigorous peer review.',
      },
      [keyBucket3]: {
        link: 'https://inspirehep.net/info/faq/general#published',
      },
    });
    const { asFragment } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        bucketHelp={bucketHelp}
        name="Test"
        selections="bucket1"
        splitDisplayName
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('render initial state without splitDisplayName', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="bucket1"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('render initial state with splitDisplayName set to 2', () => {
    const buckets = fromJS([
      {
        key: `bucket1`,
        doc_count: 1,
      },
      {
        key: `prefix${BUCKET_NAME_SPLITTER}bucket2`,
        doc_count: 2,
      },
      {
        key: `PREFIX${BUCKET_NAME_SPLITTER}BUCKET3`,
        doc_count: 2,
      },
    ]);
    const { getByText } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="bucket1"
        splitDisplayName={2}
      />
    );
    expect(getByText('Bucket1')).toBeInTheDocument();
    expect(getByText('Prefix Bucket2')).toBeInTheDocument();
    expect(getByText('PREFIX BUCKET3')).toBeInTheDocument();
  });

  it('renders with show more button if buckets are more than 10', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
      {
        key: 'bucket3',
        doc_count: 3,
      },
      {
        key: 'bucket4',
        doc_count: 4,
      },
      {
        key: 'bucket5',
        doc_count: 2,
      },
      {
        key: 'bucket6',
        doc_count: 2,
      },
      {
        key: 'bucket7',
        doc_count: 2,
      },
      {
        key: 'bucket8',
        doc_count: 2,
      },
      {
        key: 'bucket9',
        doc_count: 2,
      },
      {
        key: 'bucket10',
        doc_count: 2,
      },
      {
        key: 'bucket11',
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('render more than 10 after show more clicked', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
      {
        key: 'bucket3',
        doc_count: 3,
      },
      {
        key: 'bucket4',
        doc_count: 4,
      },
      {
        key: 'bucket5',
        doc_count: 2,
      },
      {
        key: 'bucket6',
        doc_count: 2,
      },
      {
        key: 'bucket7',
        doc_count: 2,
      },
      {
        key: 'bucket8',
        doc_count: 2,
      },
      {
        key: 'bucket9',
        doc_count: 2,
      },
      {
        key: 'bucket10',
        doc_count: 2,
      },
      {
        key: 'bucket11',
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe('onSelectionChange', () => {
    it('calls onChange with all selections', async () => {
      const onChange = jest.fn();
      const buckets = fromJS([
        { key: 'selected1', doc_count: 10 },
        { key: 'selected2', doc_count: 5 },
      ]);

      const user = userEvent.setup();
      const { getByLabelText } = render(
        <CheckboxAggregation
          onChange={onChange}
          buckets={buckets}
          name="Test"
        />
      );

      await user.click(getByLabelText('selected1'));
      expect(onChange).toHaveBeenLastCalledWith(['selected1']);

      await user.click(getByLabelText('selected2'));
      expect(onChange).toHaveBeenLastCalledWith(['selected1', 'selected2']);
    });

    it('calls onChange with checked bucket when checkbox item of the bucket changes', async () => {
      const onChange = jest.fn();
      const buckets = fromJS([{ key: 'bucket1', doc_count: 10 }]);

      const user = userEvent.setup();
      const { getByLabelText } = render(
        <CheckboxAggregation
          onChange={onChange}
          buckets={buckets}
          name="Test"
        />
      );

      const checkbox = getByLabelText('bucket1');
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(['bucket1']);
    });
  });
});
