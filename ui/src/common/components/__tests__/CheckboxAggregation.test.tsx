import React from 'react';
import { List, fromJS } from 'immutable';
import { shallow } from 'enzyme';
import { Checkbox } from 'antd';

import CheckboxAggregation, {
  BUCKET_NAME_SPLITTER,
} from '../CheckboxAggregation';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CheckboxAggregation', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; name: string;... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="bucket1"
        splitDisplayName
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        text:
          'Published papers are believed to have undergone rigorous peer review.',
        link: 'https://inspirehep.net/info/faq/general#published',
      },
      [keyBucket2]: {
        text:
          'Published papers are believed to have undergone rigorous peer review.',
      },
      [keyBucket3]: {
        link: 'https://inspirehep.net/info/faq/general#published',
      },
    });
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; bucketHelp: a... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={buckets}
        bucketHelp={bucketHelp}
        name="Test"
        selections="bucket1"
        splitDisplayName
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; name: string;... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="bucket1"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; name: string;... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; name: string;... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onShowMoreClick' does not exist on type ... Remove this comment to see the full error message
    wrapper.instance().onShowMoreClick();
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('derives selectionMap state from prop selections', () => {
    const selections = ['selected1', 'selected2'];
    const wrapper = shallow(
      <CheckboxAggregation
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: List<any>; name: s... Remove this comment to see the full error message
        onChange={jest.fn()}
        buckets={List()}
        name="Test"
        selections={selections}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectionMap' does not exist on type 'Re... Remove this comment to see the full error message
    const { selectionMap } = wrapper.instance().state;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(selectionMap.get('selected1')).toBe(true);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(selectionMap.get('selected2')).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('onSelectionChange', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls onChange with all selections', () => {
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const onChange = jest.fn();
      const wrapper = shallow(
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: List<any>; name: s... Remove this comment to see the full error message
        <CheckboxAggregation onChange={onChange} buckets={List()} name="Test" />
      );
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSelectionChange' does not exist on typ... Remove this comment to see the full error message
      wrapper.instance().onSelectionChange('selected1', true);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(onChange).toHaveBeenCalledWith(['selected1']);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSelectionChange' does not exist on typ... Remove this comment to see the full error message
      wrapper.instance().onSelectionChange('selected2', true);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(onChange).toHaveBeenCalledWith(['selected1', 'selected2']);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls onChange with checked bucket when checkbox item of the bucket changes', () => {
      const buckets = fromJS([
        {
          key: 'bucket1',
          doc_count: 1,
        },
      ]);
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const onChange = jest.fn();
      const wrapper = shallow(
        <CheckboxAggregation
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; buckets: any; name: string;... Remove this comment to see the full error message
          onChange={onChange}
          buckets={buckets}
          name="Test"
        />
      );
      const event = {
        target: {
          checked: true,
        },
      };
      const onCheckboxItemChange = wrapper.find(Checkbox).prop('onChange');
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      onCheckboxItemChange(event);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(onChange).toBeCalledWith(['bucket1']);
    });
  });
});
