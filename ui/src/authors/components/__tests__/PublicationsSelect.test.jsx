import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from 'antd';

import PublicationsSelect from '../PublicationsSelect';

describe('PublicationsSelect', () => {
  it('sets publication selection on checkbox change', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        isOwnProfile
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(wrapper).toMatchSnapshot();
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    onCheckboxChange({ target: { checked: true } });
    expect(onSelectClaimedPapers).toHaveBeenCalled();
    expect(onSelectPapers).toHaveBeenCalled();
  });
  it('renders checked when selected', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        checked
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders unchecked when not selected', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        checked={false}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
