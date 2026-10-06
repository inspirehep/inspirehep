import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectFieldTemplateProps } from '@rjsf/utils';

import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';
import { ArrayItemRemoveContext } from '../../../../ArrayItemRemoveContext';
import TableObjectFieldTemplate from '../TableObjectFieldTemplate';
import { buildObjectFieldTemplateProps } from './buildObjectFieldTemplateProps';

function renderTableObjectFieldTemplateWithRemoveContext({
  onFieldChange,
  remove,
  props,
}: {
  onFieldChange: () => {};
  remove: () => {};
  props: ObjectFieldTemplateProps;
}) {
  render(
    <FieldOnChangeContext.Provider value={onFieldChange}>
      <ArrayItemRemoveContext.Provider value={{ remove }}>
        <TableObjectFieldTemplate {...props} />
      </ArrayItemRemoveContext.Provider>
    </FieldOnChangeContext.Provider>
  );
}

describe('<TableObjectFieldTemplate />', () => {
  it('calls onFieldChange(undefined) on delete click when no ArrayItemRemoveContext is provided by an ancestor', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = buildObjectFieldTemplateProps({ title: 'Authors' });

    render(
      <FieldOnChangeContext.Provider value={onFieldChange}>
        <TableObjectFieldTemplate {...props} />
      </FieldOnChangeContext.Provider>
    );

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onFieldChange).toHaveBeenCalledWith(undefined);
  });

  it('calls remove() instead of onFieldChange when an ArrayItemRemoveContext is provided with canRemove: true', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const remove = vi.fn();
    const props = buildObjectFieldTemplateProps({ title: 'Authors' });

    renderTableObjectFieldTemplateWithRemoveContext({
      onFieldChange,
      remove,
      props,
    });

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(remove).toHaveBeenCalledTimes(1);
    expect(onFieldChange).not.toHaveBeenCalled();
  });

  it('does not render the header when uiSchema["ui:options"].showHeader is false', () => {
    const props = buildObjectFieldTemplateProps({
      title: 'Authors',
      uiSchema: { 'ui:options': { showHeader: false } },
      properties: [{ name: 'Name', content: <span>Test</span>, hidden: false }],
    });

    render(
      <FieldOnChangeContext.Provider value={vi.fn()}>
        <TableObjectFieldTemplate {...props} />
      </FieldOnChangeContext.Provider>
    );

    expect(screen.queryByText('Authors')).not.toBeInTheDocument();
    expect(screen.getByText('Test')).toBeVisible();
  });

  it('renders uiSchema["ui:title"] as the title when present, falling back to title otherwise', () => {
    const props = buildObjectFieldTemplateProps({
      title: 'Authors',
      uiSchema: { 'ui:title': 'Custom title' },
    });

    render(
      <FieldOnChangeContext.Provider value={vi.fn()}>
        <TableObjectFieldTemplate {...props} />
      </FieldOnChangeContext.Provider>
    );

    expect(screen.getByText('Custom title')).toBeVisible();
    expect(screen.queryByText('Authors')).not.toBeInTheDocument();
  });
});
