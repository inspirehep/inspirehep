import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildArrayFieldTemplateProps } from './buildArrayFieldTemplateProps';
import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';
import NestedWithHeaderArrayFieldTemplate from '../NestedWithHeaderArrayFieldTemplate';

function renderWithFieldOnChangeContext(
  props: ReturnType<typeof buildArrayFieldTemplateProps>,
  onFieldChange = vi.fn()
) {
  render(
    <table>
      <tbody>
        <FieldOnChangeContext.Provider value={onFieldChange}>
          <NestedWithHeaderArrayFieldTemplate {...props} />
        </FieldOnChangeContext.Provider>
      </tbody>
    </table>
  );
  return { onFieldChange };
}

describe('<NestedWithHeaderArrayFieldTemplate/>', () => {
  it('should display title, header and items when items', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      schema: {
        items: { type: 'object', properties: { firstName: {}, lastName: {} } },
      },
      uiSchema: { items: { 'ui:order': ['lastName', 'firstName'] } },
      items: [
        <tr key="1">
          <td>Jean Dupond</td>
        </tr>,
        <tr key="2">
          <td>Paul Dupont</td>
        </tr>,
      ],
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Name')).toBeVisible();
    expect(screen.getByText('lastName')).toBeVisible();
    expect(screen.getByText('firstName')).toBeVisible();
    expect(screen.getByText('Jean Dupond')).toBeVisible();
    expect(screen.getByText('Paul Dupont')).toBeVisible();
  });
  it('should display title and no header when no items', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      schema: {
        items: { type: 'object', properties: { firstName: {}, lastName: {} } },
      },
      uiSchema: { items: { 'ui:order': ['lastName', 'firstName'] } },
      items: [],
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Name')).toBeVisible();
    expect(screen.queryByText('lastName')).not.toBeInTheDocument();
    expect(screen.queryByText('firstName')).not.toBeInTheDocument();
  });
  it('should call onAddClick on Add new click', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      onAddClick,
    });

    renderWithFieldOnChangeContext(props);

    await user.click(screen.getByText('Name'));
    await user.click(screen.getByRole('button', { name: 'Add new' }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });
  it('should call onFieldChange with undefined on Delete click', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
    });

    renderWithFieldOnChangeContext(props, onFieldChange);

    await user.click(screen.getByText('Name'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onFieldChange).toHaveBeenCalledTimes(1);
  });
});
