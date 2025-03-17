import { render } from '@testing-library/react';
import { InfoOutlined } from '@ant-design/icons';

import IconText from '../IconText';

describe('IconText', () => {
  it('renders with all props set', () => {
    const { asFragment } = render(
      <IconText icon={<InfoOutlined />} text="Test" className="test" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
