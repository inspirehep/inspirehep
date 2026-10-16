import { render } from '@testing-library/react';

import RichDescription from '../RichDescription';

describe('RichDescription', () => {
  it('renders with description', () => {
    const { asFragment } = render(
      <RichDescription>description</RichDescription>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders latex inside html', () => {
    const { container } = render(
      <RichDescription>{'<p>energy $E=mc^2$ here</p>'}</RichDescription>
    );
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  it('does not treat currency dollar signs as latex', () => {
    const text =
      'a monthly gross salary of CLP$2.498.509. (~EUR$2448) and $5 or $6';
    const { container } = render(<RichDescription>{text}</RichDescription>);
    expect(container.querySelector('.katex')).not.toBeInTheDocument();
    expect(container).toHaveTextContent(text);
  });

  it('renders latex glued to a word', () => {
    const { container } = render(
      <RichDescription>Universe (E$^2$U19) to take place</RichDescription>
    );
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });
});
