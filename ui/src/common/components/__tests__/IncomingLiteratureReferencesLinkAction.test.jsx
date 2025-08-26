import { renderWithRouter } from '../../../fixtures/render';
import IncomingLiteratureReferencesLinkAction from '../IncomingLiteratureReferencesLinkAction';

describe('IncomingLiteratureReferencesLinkAction', () => {
  it('renders with required props', () => {
    const itemCount = 29;
    const referenceType = 'citation';
    const recordId = 888;
    const linkQuery = `refersto:recid:${recordId}`;
    const trackerEventId = 'Citations:Search';
    const { getByRole } = renderWithRouter(
      <IncomingLiteratureReferencesLinkAction
        itemCount={itemCount}
        linkQuery={linkQuery}
        referenceType={referenceType}
        trackerEventId={trackerEventId}
      />
    );
    expect(getByRole('link', { name: /29 citations/i })).toHaveAttribute(
      'href',
      '/literature?q=refersto:recid:888'
    );
  });

  it('renders with required props when reference count is singular', () => {
    const itemCount = 1;
    const referenceType = 'paper';
    const recordId = 888;
    const linkQuery = `refersto:recid:${recordId}`;
    const trackerEventId = 'Papers:Search';
    const { getByRole } = renderWithRouter(
      <IncomingLiteratureReferencesLinkAction
        itemCount={itemCount}
        linkQuery={linkQuery}
        referenceType={referenceType}
        trackerEventId={trackerEventId}
      />
    );
    expect(getByRole('link', { name: /1 paper/i })).toHaveAttribute(
      'href',
      '/literature?q=refersto:recid:888'
    );
  });
});
