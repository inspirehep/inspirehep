import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StandaloneFieldTemplate from '../StandaloneFieldTemplate';
import { buildFieldTemplateProps } from './buildFieldTemplateProps';

describe('<StandaloneFieldTemplate />', () => {
  it('should render label, children and error', () => {
    const props = buildFieldTemplateProps({
      label: 'Name',
      children: <div>field value</div>,
      errors: <div>Some error on this field</div>,
    });

    render(<StandaloneFieldTemplate {...props} />);

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

    render(<StandaloneFieldTemplate {...props} />);

    await user.click(screen.getByText(/Name/));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onChange).toHaveBeenCalledWith(undefined, ['name']);
  });
});
