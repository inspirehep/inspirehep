import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DisplayAsListArrayFieldTemplate from '../DisplayAsListArrayFieldTemplate';
import { buildArrayFieldTemplateProps } from './buildArrayFieldTemplateProps';
import { useArrayAddItem } from '../../../../ArrayAddItemContext';
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
function AddAtButton({ index }: { index: number }) {
  const arrayAddItem = useArrayAddItem();
  return (
    <button type="button" onClick={() => arrayAddItem?.addAt(index)}>
      Insert at {index}
    </button>
  );
}

describe('<DisplayAsListArrayFieldTemplate />', () => {
  it('should display items and title and error', () => {
    const props = buildArrayFieldTemplateProps({
      items: [<div key="1">item1</div>, <div key="2">item2</div>],
      title: 'Nice items',
      rawErrors: ['Some error'],
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Nice items (0)')).toBeVisible();
    expect(screen.getByText('item1')).toBeVisible();
    expect(screen.getByText('item2')).toBeVisible();
    expect(screen.getByText('Some error')).toBeVisible();
  });
  it('should display ui:title instead of prop title if defined in uiSchema', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Nice items',
      uiSchema: { 'ui:title': 'Custom title' },
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.queryByText('Nice items')).not.toBeInTheDocument();
    expect(screen.getByText('Custom title (0)')).toBeVisible();
  });
  it('should call onAddClick on Add new click', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    const props = buildArrayFieldTemplateProps({
      title: 'Authors',
      onAddClick,
    });

    renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors (0)'));
    await user.click(screen.getByRole('button', { name: 'Add new' }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });
  it('should call onChange with undefined on Delete click', async () => {
    const user = userEvent.setup();
    const props = buildArrayFieldTemplateProps({ title: 'Authors' });

    const { onFieldChange } = renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors (0)'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onFieldChange).toHaveBeenCalledWith(undefined);
  });

  it('disables the menu when readonly', async () => {
    const user = userEvent.setup();
    const props = buildArrayFieldTemplateProps({
      title: 'Authors',
      canAdd: true,
      readonly: true,
    });

    renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Authors (0)'));

    expect(
      screen.queryByRole('button', { name: 'Add new' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  describe('addAt context', () => {
    it.each([0, 1])(
      'delegates insertion at index %i to RJSF onAddClick',
      async (index) => {
        const user = userEvent.setup();
        const onAddClick = vi.fn();
        const props = buildArrayFieldTemplateProps({
          onAddClick,
          items: [<AddAtButton key="k" index={index} />],
        });

        renderWithFieldOnChangeContext(props);

        await user.click(
          screen.getByRole('button', { name: `Insert at ${index}` })
        );

        expect(onAddClick).toHaveBeenCalledWith(undefined, index);
      }
    );
  });

  describe('optional features', () => {
    const linked = { id: 'a', title: 'Linked one', ok: true };
    const unlinked = { id: 'b', title: 'Unlinked two', ok: false };
    const build = (list: any[], options: Record<string, any> = {}) =>
      buildArrayFieldTemplateProps({
        title: 'things',
        formData: list,
        items: list.map((item) => <div key={item.id}>{item.title}</div>),
        uiSchema: { 'ui:options': options },
      });

    it('displays the number of items when showCount', () => {
      renderWithFieldOnChangeContext(
        build([linked, unlinked], { showCount: true })
      );
      expect(screen.getByText('things (2)')).toBeVisible();
    });

    it('renders no toolbar by default', () => {
      renderWithFieldOnChangeContext(build([linked]));
      expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
    });

    it('paginates items', async () => {
      const many = Array.from({ length: 30 }, (_, i) => ({
        id: `id${i}`,
        title: `Item ${i}`,
      }));
      renderWithFieldOnChangeContext(build(many, { pageSize: 25 }));
      expect(screen.getByText('Item 0')).toBeVisible();
      expect(screen.queryByText('Item 25')).not.toBeInTheDocument();
      await userEvent.click(screen.getByTitle('Next Page'));
      expect(screen.getByText('Item 25')).toBeVisible();
      expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
    });

    it('searches items on Enter, not while typing', async () => {
      renderWithFieldOnChangeContext(
        build([linked, unlinked], { searchable: true })
      );
      const input = screen.getByPlaceholderText('Search');
      await userEvent.type(input, 'unlinked');
      expect(screen.getByText('Linked one')).toBeVisible();

      await userEvent.type(input, '{Enter}');
      expect(await screen.findByText('Unlinked two')).toBeVisible();
      expect(screen.queryByText('Linked one')).not.toBeInTheDocument();
    });

    it('shows all items again when the search is cleared', async () => {
      renderWithFieldOnChangeContext(
        build([linked, unlinked], { searchable: true })
      );
      const input = screen.getByPlaceholderText('Search');
      await userEvent.type(input, 'unlinked{Enter}');
      expect(screen.queryByText('Linked one')).not.toBeInTheDocument();

      await userEvent.clear(input);
      expect(await screen.findByText('Linked one')).toBeVisible();
    });

    it('filters items to edit', async () => {
      renderWithFieldOnChangeContext(
        build([linked, unlinked], { needsEdit: (item: any) => !item.ok })
      );
      await userEvent.click(screen.getByText('To edit (1)'));
      expect(screen.getByText('Unlinked two')).toBeVisible();
      expect(screen.queryByText('Linked one')).not.toBeInTheDocument();
    });

    it('renders toolbarActions with data and onChange', async () => {
      const onFieldChange = vi.fn();
      const Actions = ({ formData, onChange }: any) => (
        <button type="button" onClick={() => onChange([...formData, 'x'])}>
          act {formData.length}
        </button>
      );
      renderWithFieldOnChangeContext(
        build([linked], { toolbarActions: Actions }),
        onFieldChange
      );
      await userEvent.click(screen.getByRole('button', { name: 'act 1' }));
      expect(onFieldChange).toHaveBeenCalledWith([linked, 'x']);
    });
  });
});
