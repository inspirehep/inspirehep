import { render } from '@testing-library/react';

import TabNameWithCount from '../TabNameWithCount';

describe('TabNameWithCount', () => {
  it('renders with required props', () => {
    const { asFragment } = render(<TabNameWithCount name="Test" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when loading true', () => {
    const { getByTestId } = render(<TabNameWithCount name="Test" loading />);
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  it('does not display count if loading is true', () => {
    const { getByTestId, queryByText } = render(
      <TabNameWithCount name="Test" loading count={10} />
    );
    expect(getByTestId('loading')).toBeInTheDocument();
    expect(queryByText('(10)')).toBeNull();
  });

  it('displays count if loading is false', () => {
    const { getByText } = render(
      <TabNameWithCount name="Test" loading={false} count={10} />
    );
    expect(getByText('(10)')).toBeInTheDocument();
  });
});
