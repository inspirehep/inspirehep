import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';
import DefaultArrayFieldTemplate from '../DefaultArrayFieldTemplate';
import { buildArrayFieldTemplateProps } from './buildArrayFieldTemplateProps';

function renderWithFieldOnChangeContext(
  props: ReturnType<typeof buildArrayFieldTemplateProps>,
  onFieldChange = vi.fn()
) {
  render(
    <FieldOnChangeContext.Provider value={onFieldChange}>
      <DefaultArrayFieldTemplate {...props} />
    </FieldOnChangeContext.Provider>
  );
  return { onFieldChange };
}

function getColumnHeaderTexts() {
  const table = screen.getByRole('table');
  return within(table)
    .getAllByRole('columnheader')
    .map((th) => th.textContent)
    .filter((text) => text !== '');
}

describe('<DefaultArrayFieldTemplate />', () => {
  it('uses properties keys as columns when uiSchema.items has no ui:order', () => {
    const props = buildArrayFieldTemplateProps({
      schema: {
        items: { type: 'object', properties: { name: {}, email: {} } },
      },
    });

    renderWithFieldOnChangeContext(props);

    expect(getColumnHeaderTexts()).toEqual(['name', 'email']);
  });

  it('uses uiSchema.items["ui:order"] as columns, silently excluding keys absent from schema.items.properties', () => {
    const props = buildArrayFieldTemplateProps({
      schema: {
        items: { type: 'object', properties: { name: {}, email: {} } },
      },
      uiSchema: { items: { 'ui:order': ['email', 'ghost', 'name'] } },
    });

    renderWithFieldOnChangeContext(props);

    expect(getColumnHeaderTexts()).toEqual(['email', 'name']);
  });

  it('does not render "Add new" in the menu when canAdd is false', async () => {
    const user = userEvent.setup();
    const props = buildArrayFieldTemplateProps({
      title: 'Authors',
      canAdd: false,
    });

    renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors'));

    expect(
      screen.queryByRole('button', { name: 'Add new' })
    ).not.toBeInTheDocument();
  });

  it('calls onAddClick when clicking "Add new"', async () => {
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

  it.each([
    ['removable', { removable: false }],
    ['clearable', { clearable: false }],
  ])(
    'does not render "Delete" in the menu when ui:options.%s is false',
    async (_optionName, uiOptions) => {
      const user = userEvent.setup();
      const props = buildArrayFieldTemplateProps({
        title: 'Authors',
        uiSchema: { 'ui:options': uiOptions },
      });

      renderWithFieldOnChangeContext(props);

      await user.click(screen.getByText('Authors'));

      expect(
        screen.queryByRole('button', { name: 'Delete' })
      ).not.toBeInTheDocument();
    }
  );

  it('does not render the header when uiSchema["ui:options"].showHeader is false', () => {
    const props = buildArrayFieldTemplateProps({
      uiSchema: { 'ui:options': { showHeader: false } },
      schema: {
        items: { type: 'object', properties: { name: {}, email: {} } },
      },
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.queryByText('name')).not.toBeInTheDocument();
    expect(screen.queryByText('email')).not.toBeInTheDocument();
  });

  it('calls onFieldChange(undefined) when clicking "Delete"', async () => {
    const user = userEvent.setup();
    const props = buildArrayFieldTemplateProps({ title: 'Authors' });

    const { onFieldChange } = renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onFieldChange).toHaveBeenCalledWith(undefined);
  });
});
