import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import IconText from '../../IconText';
import ListItemAction from '../ListItemAction';

describe('ListItemAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ListItemAction>
        <Button onClick={undefined}>
          <IconText text="cite" type="export" />
        </Button>
      </ListItemAction>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
