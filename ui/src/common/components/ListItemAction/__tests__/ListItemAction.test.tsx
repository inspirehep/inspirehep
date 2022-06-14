import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

import IconText from '../../IconText';
import ListItemAction from '../ListItemAction';

describe('ListItemAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ListItemAction>
        <Button>
          <IconText text="cite" icon={<ExpandOutlined />} />
        </Button>
      </ListItemAction>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
