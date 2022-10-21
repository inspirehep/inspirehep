import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

import IconText from '../../IconText';
import UserAction from '../UserAction';

describe('UserAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <UserAction>
        <Button>
          <IconText text="cite" icon={<ExpandOutlined />} />
        </Button>
      </UserAction>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
