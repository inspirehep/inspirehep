import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldTemplateProps } from '@rjsf/utils';

import { useFieldOnChange } from '../../../../FieldOnChangeContext';
import DefaultFieldTemplate from '../DefaultFieldTemplate';
import { buildFieldTemplateProps } from './buildFieldTemplateProps';

function FieldOnChangeConsumer() {
  const onFieldChange = useFieldOnChange();
  return (
    <button type="button" onClick={() => onFieldChange('new value')}>
      trigger change
    </button>
  );
}

describe('DefaultFieldTemplate', () => {
  it('provides a FieldOnChangeContext calling onChange with the new value and the field path', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const props = buildFieldTemplateProps({
      onChange,
      fieldPathId: { $id: 'root_name', path: ['name'] },
      children: <FieldOnChangeConsumer />,
    });

    render(<DefaultFieldTemplate {...props} />);

    await user.click(screen.getByRole('button', { name: 'trigger change' }));

    expect(onChange).toHaveBeenCalledWith('new value', ['name']);
  });

  it.each(['string', 'number', 'boolean', 'integer'])(
    'renders the field errors for a scalar schema type (%s)',
    (type) => {
      const props = buildFieldTemplateProps({
        schema: { type } as FieldTemplateProps['schema'],
        errors: <span>Required field</span>,
      });

      render(<DefaultFieldTemplate {...props} />);

      expect(screen.getByText('Required field')).toBeVisible();
    }
  );
});
