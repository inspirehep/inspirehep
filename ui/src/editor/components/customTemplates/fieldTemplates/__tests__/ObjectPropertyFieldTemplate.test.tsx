import { render, screen } from '@testing-library/react';
import { FieldTemplateProps } from '@rjsf/utils';
import userEvent from '@testing-library/user-event';

import { buildFieldTemplateProps } from './buildFieldTemplateProps';
import ObjectPropertyFieldTemplate from '../ObjectPropertyFieldTemplate';

function renderObjectPropertyFieldTemplateInTable(props: FieldTemplateProps) {
  render(
    <table>
      <tbody>
        <ObjectPropertyFieldTemplate {...props} />
      </tbody>
    </table>
  );
}

describe('<ObjectPropertyFieldTemplate />', () => {
  it('should render label, children and error', () => {
    const props = buildFieldTemplateProps({
      label: 'Name',
      children: <div>field value</div>,
      errors: <div>Some error on this field</div>,
    });

    renderObjectPropertyFieldTemplateInTable(props);

    expect(screen.getByText('Name')).toBeVisible();
    expect(screen.getByText('field value')).toBeVisible();
    expect(screen.getByText('Some error on this field')).toBeVisible();
  });
  it('should reset field value on delete click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = buildFieldTemplateProps({
      label: 'Name',
      onChange,
      fieldPathId: { $id: 'root_name', path: ['name'] },
    });

    renderObjectPropertyFieldTemplateInTable(props);

    await user.click(screen.getByText(/Name/));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onChange).toHaveBeenCalledWith(undefined, ['name']);
  });
});
