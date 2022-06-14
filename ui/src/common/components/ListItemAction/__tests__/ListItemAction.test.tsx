import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

import IconText from '../../IconText';
import ListItemAction from '../ListItemAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ListItemAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(
      <ListItemAction>
        <Button>
          <IconText text="cite" icon={<ExpandOutlined />} />
        </Button>
      </ListItemAction>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
