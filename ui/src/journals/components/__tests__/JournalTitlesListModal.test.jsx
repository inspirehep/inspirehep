import React from 'react';
import { shallow } from 'enzyme';
import { JournalTitlesListModal } from '../JournalTitlesListModal';

describe('JournalTitlesListModal', () => {
  it('renders with props', () => {
    const titleVariants = ['Test1', 'Test2'];

    const wrapper = shallow(
      <JournalTitlesListModal
        modalVisible={false}
        onModalVisibilityChange={jest.fn()}
        titleVariants={titleVariants}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
