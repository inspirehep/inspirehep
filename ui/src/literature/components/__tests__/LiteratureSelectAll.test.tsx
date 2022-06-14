import React from 'react';
import { shallow } from 'enzyme';
import { fromJS, Set, List } from 'immutable';
import { Checkbox } from 'antd';

import LiteratureSelectAll from '../LiteratureSelectAll';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LiteratureSelectAll', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const selection = Set([2]);
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        onChange={onChange}
      />
    );
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCheckboxChange({ target: { checked: true } });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(List([1, 2]), true);
  });
});
