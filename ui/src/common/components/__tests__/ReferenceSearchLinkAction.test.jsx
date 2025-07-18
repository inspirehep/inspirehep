import { renderWithRouter } from '../../../fixtures/render';
import ReferenceSearchLinkAction from '../ReferenceSearchLinkAction';

describe('ReferenceSearchLinkAction', () => {
  it('renders with required props', () => {
    const recordId = 12345;
    const { getByRole } = renderWithRouter(
      <ReferenceSearchLinkAction recordId={recordId} />
    );
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/literature?q=citedby:recid:12345'
    );
  });
});
