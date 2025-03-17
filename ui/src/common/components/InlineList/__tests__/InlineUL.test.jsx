import { render } from '@testing-library/react';
import { InlineUL } from '..';
import { SEPARATOR_MIDDLEDOT } from '../constants';

describe('InlineUL', () => {
  it('renders children separated by default', () => {
    const { asFragment } = render(
      <InlineUL>
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders children with class', () => {
    const { asFragment } = render(
      <InlineUL wrapperClassName="di">
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with separator passed', () => {
    const { getAllByRole, getByText } = render(
      <InlineUL separator={SEPARATOR_MIDDLEDOT}>
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );

    expect(getAllByRole('listitem')).toHaveLength(2);
    expect(getByText(SEPARATOR_MIDDLEDOT.trim())).toBeInTheDocument();
  });

  it('does not render null children', () => {
    const { getAllByRole } = render(
      <InlineUL>
        <div>First div</div>
        {null}
        <div>Third div</div>
        {null}
      </InlineUL>
    );
    expect(getAllByRole('listitem')).toHaveLength(2);
  });
});
