import { render } from '@testing-library/react';
import ErrorAppCrash from '../ErrorAppCrash';

describe('ErrorAppCrash', () => {
  it('renders ErrorAppCrash', () => {
    const { asFragment } = render(<ErrorAppCrash />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the referrer link outside of a Router', () => {
    const referrerSpy = vi
      .spyOn(document, 'referrer', 'get')
      .mockReturnValue('https://www.google.com/');

    const { getByRole } = render(<ErrorAppCrash />);

    expect(
      getByRole('link', { name: 'https://www.google.com/' })
    ).toHaveAttribute('href', 'https://www.google.com/');
    referrerSpy.mockRestore();
  });
});
