import { render } from '@testing-library/react';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

import IconText from '../../IconText';
import UserAction from '../UserAction';

describe('UserAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <UserAction>
        <Button>
          <IconText text="cite" icon={<ExpandOutlined />} />
        </Button>
      </UserAction>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
