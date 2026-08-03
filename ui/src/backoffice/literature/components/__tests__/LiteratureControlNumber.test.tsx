import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../../fixtures/render';
import { LITERATURE } from '../../../../common/routes';
import LiteratureControlNumber from '../LiteratureControlNumber';

describe('<LiteratureControlNumber />', () => {
  test('renders null when control number is missing', () => {
    const { container } = renderWithRouter(
      <LiteratureControlNumber controlNumber={null} pidType={LITERATURE} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders control number link with correct URL', () => {
    const controlNumber = 12345;

    renderWithRouter(
      <LiteratureControlNumber
        controlNumber={controlNumber}
        pidType={LITERATURE}
      />
    );

    const link = screen.getByRole('link', { name: controlNumber.toString() });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`${LITERATURE}/${controlNumber}`)
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
