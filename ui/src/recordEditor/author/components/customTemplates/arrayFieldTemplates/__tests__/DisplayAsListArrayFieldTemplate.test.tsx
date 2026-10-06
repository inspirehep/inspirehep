import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DisplayAsListArrayFieldTemplate from '../DisplayAsListArrayFieldTemplate';
import { buildArrayFieldTemplateProps } from './buildArrayFieldTemplateProps';
import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';

function renderWithFieldOnChangeContext(
  props: ReturnType<typeof buildArrayFieldTemplateProps>,
  onFieldChange = vi.fn()
) {
  render(
    <FieldOnChangeContext.Provider value={onFieldChange}>
      <DisplayAsListArrayFieldTemplate {...props} />
    </FieldOnChangeContext.Provider>
  );
  return { onFieldChange };
}
describe('<DisplayAsListArrayFieldTemplate />', () => {
  it('should display items and title', () => {
    const props = buildArrayFieldTemplateProps({
      items: [<div key="1">item1</div>, <div key="2">item2</div>],
      title: 'Nice items',
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Nice items')).toBeVisible();
    expect(screen.getByText('item1')).toBeVisible();
    expect(screen.getByText('item2')).toBeVisible();
  });
  it('should display ui:title instead of prop title if defined in uiSchema', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Nice items',
      uiSchema: { 'ui:title': 'Custom title' },
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.queryByText('Nice items')).not.toBeInTheDocument();
    expect(screen.getByText('Custom title')).toBeVisible();
  });
  it('should call onAddClick on Add new click', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    const props = buildArrayFieldTemplateProps({
      title: 'Authors',
      onAddClick,
    });

    renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Add new' }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });
  it('should call onChange with undefined on Delete click', async () => {
    const user = userEvent.setup();
    const props = buildArrayFieldTemplateProps({ title: 'Authors' });

    const { onFieldChange } = renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onFieldChange).toHaveBeenCalledWith(undefined);
  });
});
