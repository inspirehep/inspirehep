import { render, screen } from '@testing-library/react';
import { buildObjectFieldTemplateProps } from './buildObjectFieldTemplateProps';
import DefaultObjectFieldTemplate from '../DefaultObjectFieldTemplate';

describe('<DefaultObjectFieldTemplate />', () => {
  it('should render properties content and not title', () => {
    const props = buildObjectFieldTemplateProps({
      title: 'Authors',
      properties: [
        { name: 'Name', content: <span>Test</span>, hidden: false },
        { name: 'Institution', content: <span>CERN</span>, hidden: false },
      ],
    });

    render(<DefaultObjectFieldTemplate {...props} />);

    expect(screen.queryByText('Authors')).not.toBeInTheDocument();
    expect(screen.getByText('Test')).toBeVisible();
    expect(screen.getByText('CERN')).toBeVisible();
  });
});
