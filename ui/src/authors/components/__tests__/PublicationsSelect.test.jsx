import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from 'antd';

import PublicationsSelect from '../PublicationsSelect';

describe('PublicationsSelect', () => {
  it('sets publication selection on checkbox change', () => {
    const onSelectPapersUserCanNotClaim = jest.fn();
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        canClaim={false}
        onSelectPapersUserCanNotClaim={onSelectPapersUserCanNotClaim}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(wrapper).toMatchSnapshot();
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    onCheckboxChange({ target: { checked: true } });
    expect(onSelectPapersUserCanNotClaim).toHaveBeenCalled();
    expect(onSelectClaimedPapers).toHaveBeenCalled();
    expect(onSelectPapers).toHaveBeenCalled();
  });
});
