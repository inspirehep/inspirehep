import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';
import { buildArrayFieldTemplateProps } from './buildArrayFieldTemplateProps';
import NestedArrayFieldTemplate from '../NestedArrayFieldTemplate';
import NestedArrayRowLabelContext from '../NestedArrayRowLabelContext';

function renderWithFieldOnChangeContext(
  props: ReturnType<typeof buildArrayFieldTemplateProps>,
  onFieldChange = vi.fn()
) {
  render(
    <table>
      <tbody>
        <FieldOnChangeContext.Provider value={onFieldChange}>
          <NestedArrayFieldTemplate {...props} />
        </FieldOnChangeContext.Provider>
      </tbody>
    </table>
  );
  return { onFieldChange };
}

describe('<NestedArrayFieldTemplate />', () => {
  it('should display title when no items', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Name')).toBeVisible();
  });
  it('should display items, error and no title when items', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      items: [
        <tr key="1">
          <td>item1</td>
        </tr>,
        <tr key="2">
          <td>item2</td>
        </tr>,
      ],
      rawErrors: ['Some error'],
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('item1')).toBeVisible();
    expect(screen.getByText('item2')).toBeVisible();
    expect(screen.getByText('Some error')).toBeVisible();
  });
  it('should display ui:title instead of prop title if defined in uiSchema', () => {
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      uiSchema: { 'ui:title': 'Custom title' },
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('Custom title')).toBeVisible();
  });
  it('provides a NestedArrayRowLabelContext with labelCell when items', () => {
    function ContextConsumer() {
      const rowLabelCell = useContext(NestedArrayRowLabelContext);
      return <tr>{rowLabelCell}</tr>;
    }
    const props = buildArrayFieldTemplateProps({
      title: 'Name',
      items: [<ContextConsumer key="consumer" />],
    });

    renderWithFieldOnChangeContext(props);

    expect(screen.getByText('Name')).toBeVisible();
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
