import React from 'react';
import { shallow } from 'enzyme';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import UserSettingsModal from '../UserSettingsModal';
import { getStore } from '../../../fixtures/store';

describe('UserSettingsModal', () => {
  it('renders with props', () => {
    const wrapper = shallow(<UserSettingsModal visible onCancel={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCancel on modal cancel', () => {
    const onCancel = jest.fn();
    const { getByLabelText } = render(
      <Provider store={getStore()}>
        <UserSettingsModal visible onCancel={onCancel} />
      </Provider>
    );

    getByLabelText('Close').click();
    expect(onCancel).toHaveBeenCalled();
  });
});
