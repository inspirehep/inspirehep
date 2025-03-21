import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import LiteratureTitle from '../LiteratureTitle';

describe('LiteratureTitle', () => {
  it('renders with only title', () => {
    const title = fromJS({
      title: 'Test Literature Title',
    });
    const { getByText } = render(<LiteratureTitle title={title} />);
    expect(getByText('Test Literature Title')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    const title = fromJS({
      title: 'Test Literature Title',
      subtitle: 'Test Literature Sub Title',
    });
    const { getByText } = render(<LiteratureTitle title={title} />);
    expect(getByText('Test Literature Title')).toBeInTheDocument();
    expect(getByText('Test Literature Sub Title')).toBeInTheDocument();
  });
});
