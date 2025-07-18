import { renderWithRouter } from '../../../../fixtures/render';
import Logo from '../Logo';

describe('Logo', () => {
  it('renders', () => {
    const { asFragment } = renderWithRouter(<Logo />);
    expect(asFragment()).toMatchSnapshot();
  });
});
