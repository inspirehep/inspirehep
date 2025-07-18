import { fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import BannerContainer from '../BannerContainer';

const REQUIRED_BANNER_PROPS = {
  id: 'test',
  message: 'Test',
};

describe('BannerContainer', () => {
  it('passes props from state when submissions page', () => {
    const closedBannersById = fromJS({ foo: true });
    const store = getStore({
      router: {
        location: {
          pathname: `/test`,
        },
      },
      ui: fromJS({
        closedBannersById,
      }),
    });
    const { getByText } = renderWithProviders(
      <BannerContainer {...REQUIRED_BANNER_PROPS} />,
      { store }
    );

    expect(getByText('Test')).toBeInTheDocument();
  });

  it('closes banner on banner close', async () => {
    const bannerId = 'test-banner';
    const closedBannersById = fromJS({});
    const store = getStore({
      router: {
        location: {
          pathname: `/test`,
        },
      },
      ui: fromJS({
        closedBannersById,
      }),
    });

    const screen = renderWithProviders(
      <BannerContainer {...REQUIRED_BANNER_PROPS} id={bannerId} closable />,
      { store }
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    fireEvent.animationEnd(closeButton);

    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});
