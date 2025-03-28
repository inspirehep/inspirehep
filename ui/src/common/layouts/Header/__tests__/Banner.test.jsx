import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import Banner from '../Banner';

describe('Banner', () => {
  it('renders when it is not closed', () => {
    const { container } = render(
      <Banner
        id="release-04.2020"
        message='<strong>Welcome to the new INSPIRE! <a href="/release">learn more</a></strong>'
        closedBannersById={fromJS({})}
        currentPathname="/"
        onClose={jest.fn()}
      />
    );

    expect(container.hasChildNodes()).toBe(true);
  });

  it('does not render when it is closed', () => {
    const { container } = render(
      <Banner
        id="release-04.2020"
        message='<strong>Welcome to the new INSPIRE! <a href="/release">learn more</a></strong>'
        closedBannersById={fromJS({ 'release-04.2020': true })}
        currentPathname="/"
        onClose={jest.fn()}
      />
    );
    expect(container.hasChildNodes()).toBe(false);
  });

  it('renders when pathname is a match', () => {
    const { container } = render(
      <Banner
        id="release-feature-04.2020"
        message="We have a new literature feature"
        pathnameRegexp={/^\/literature/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        onClose={jest.fn()}
      />
    );
    expect(container.hasChildNodes()).toBe(true);
  });

  it('does not render when pathname is not a match', () => {
    const { container } = render(
      <Banner
        id="release-feature-04.2020"
        message="We have a new feature"
        pathnameRegexp={/^\/new-feature-page/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        onClose={jest.fn()}
      />
    );
    expect(container.hasChildNodes()).toBe(false);
  });

  it('renders with custom style', () => {
    const { getByRole } = render(
      <Banner
        id="files-outage-20.04.2020"
        type="warning"
        message="We have problem with our storage."
        closable={false}
        action={{
          name: 'Learn more',
          href: 'https://status.inspirehep.net',
        }}
        center
        closedBannersById={fromJS({})}
        currentPathname="/"
        onClose={jest.fn()}
      />
    );

    const banner = getByRole('alert');
    expect(banner).toHaveClass('ant-alert-warning');
  });

  it('removes the banner after close', async () => {
    const onClose = jest.fn();
    const { container } = render(
      <Banner
        id="test"
        message="Test"
        closedBannersById={fromJS({})}
        currentPathname="/"
        onClose={onClose}
      />
    );
    const closeButton = screen.getByRole('button', { name: /close/i });
    // Simulate clicking the close button
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
