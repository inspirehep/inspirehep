import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReferenceSearchLinkAction from '../ReferenceSearchLinkAction';

describe('ReferenceSearchLinkAction', () => {
  it('renders with required props', () => {
    const recordId = 12345;
    const { getByRole } = render(
      <MemoryRouter>
        <ReferenceSearchLinkAction recordId={recordId} />
      </MemoryRouter>
    );
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/literature?q=citedby:recid:12345'
    );
  });
});
