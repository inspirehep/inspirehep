import React from 'react';
import { shallow } from 'enzyme';
import { fromJS, Set, List } from 'immutable';
import { Checkbox } from 'antd';

import PublicationsSelectAll from '../PublicationsSelectAll';

describe('PublicationsSelectAll', () => {
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
      <PublicationsSelectAll
        publications={publications}
        selection={selection}
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(<PublicationsSelectAll disabled />);
    expect(wrapper).toMatchSnapshot();
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
    const wrapper = shallow(
      <PublicationsSelectAll
        publications={publications}
        selection={selection}
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange with publication ids when checkbox change', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
          curated_relation: false,
          can_claim: true,
        },
      },
      {
        metadata: {
          control_number: 2,
          curated_relation: false,
          can_claim: false,
        },
      },
    ]);
    const onChange = jest.fn();
    const selection = Set([2]);
    const wrapper = shallow(
      <PublicationsSelectAll
        publications={publications}
        selection={selection}
        onChange={onChange}
      />
    );
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    onCheckboxChange({ target: { checked: true } });
    expect(onChange).toHaveBeenCalledWith(
      List([1, 2]),
      List([false, false]),
      List([true, false]),
      true
    );
  });
});
