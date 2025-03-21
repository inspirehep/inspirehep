import { render } from '@testing-library/react';
import { Button } from 'antd';

import LinkWithTargetBlank from '../LinkWithTargetBlank';

describe('LinkWithTargetBlank', () => {
  it('renders with only href and children', () => {
    const { getByRole } = render(
      <LinkWithTargetBlank href="//example.com">example</LinkWithTargetBlank>
    );
    expect(getByRole('link', { name: 'example' })).toHaveAttribute(
      'href',
      '//example.com'
    );
  });

  it('renders with only href, children and extra props', () => {
    const { getByRole } = render(
      <LinkWithTargetBlank href="//example.com" className="test">
        example
      </LinkWithTargetBlank>
    );
    const link = getByRole('link', { name: 'example' });
    expect(link).toHaveClass('test');
    expect(link).toHaveAttribute('href', '//example.com');
  });

  it('renders as custom component', () => {
    const { getByRole } = render(
      <LinkWithTargetBlank href="//example.com" as={Button}>
        button example
      </LinkWithTargetBlank>
    );
    const link = getByRole('link', { name: 'button example' });
    expect(link).toHaveAttribute('href', '//example.com');
    expect(link).toHaveClass('ant-btn');
  });
});
