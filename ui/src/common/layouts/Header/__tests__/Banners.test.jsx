import { render } from '@testing-library/react';

import Banners from '../Banners';
import { renderWithProviders } from '../../../../fixtures/render';

describe('Banners', () => {
  beforeEach(() => {
    global.CONFIG = {};
  });

  it('renders nothing if banners config not set', () => {
    const { container } = render(<Banners />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders banners if banners config is set', () => {
    global.CONFIG = {
      BANNERS: [
        {
          id: 'maintenance',
          message: 'Maintenance in progress',
        },
        {
          id: 'release',
          message: 'We are just out of beta',
        },
      ],
    };
    const { getByText } = renderWithProviders(<Banners />);
    expect(getByText('Maintenance in progress')).toBeInTheDocument();
    expect(getByText('We are just out of beta')).toBeInTheDocument();
  });
});
