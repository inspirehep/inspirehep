import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectFieldTemplateProps } from '@rjsf/utils';

import { FieldOnChangeContext } from '../../../../FieldOnChangeContext';
import { useObjectFieldData } from '../../../../ObjectFieldDataContext';
import ArrayItemObjectFieldTemplate from '../ArrayItemObjectFieldTemplate';
import { buildObjectFieldTemplateProps } from './buildObjectFieldTemplateProps';

function ObjectFieldDataConsumer() {
  const { formData, onChange } = useObjectFieldData();
  return (
    <button type="button" onClick={() => onChange('new value')}>
      {JSON.stringify(formData)}
    </button>
  );
}

function renderArrayItemObjectFieldTemplateInTableRowWithContext(
  onFieldChange: () => {},
  props: ObjectFieldTemplateProps
) {
  return render(
    <table>
      <tbody>
        <tr>
          <FieldOnChangeContext.Provider value={onFieldChange}>
            <ArrayItemObjectFieldTemplate {...props} />
          </FieldOnChangeContext.Provider>
        </tr>
      </tbody>
    </table>
  );
}

describe('<ArrayItemObjectFieldTemplate />', () => {
  it('renders each property content', () => {
    const props = buildObjectFieldTemplateProps({
      properties: [
        { name: 'name', content: <span>Name</span>, hidden: false },
        { name: 'institution', content: <span>CERN</span>, hidden: false },
      ],
    });

    renderArrayItemObjectFieldTemplateInTableRowWithContext(vi.fn(), props);

    expect(screen.getByText('Name')).toBeVisible();
    expect(screen.getByText('CERN')).toBeVisible();
  });

  it('provides ObjectFieldDataContext with formData and onChange wired to the FieldOnChangeContext', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = buildObjectFieldTemplateProps({
      formData: { name: 'Jane' },
      properties: [
        { name: 'name', content: <ObjectFieldDataConsumer />, hidden: false },
      ],
    });

    renderArrayItemObjectFieldTemplateInTableRowWithContext(
      onFieldChange,
      props
    );

    await user.click(screen.getByRole('button', { name: '{"name":"Jane"}' }));

    expect(onFieldChange).toHaveBeenCalledWith('new value');
  });

  it('falls back to an empty object for ObjectFieldDataContext.formData when formData is undefined', () => {
    const props = buildObjectFieldTemplateProps({
      formData: undefined,
      properties: [
        { name: 'name', content: <ObjectFieldDataConsumer />, hidden: false },
      ],
    });

    renderArrayItemObjectFieldTemplateInTableRowWithContext(vi.fn(), props);

    expect(screen.getByText('{}')).toBeVisible();
  });

  it('throws when rendered without an ancestor FieldOnChangeContext', () => {
    const props = buildObjectFieldTemplateProps();

    expect(() =>
      render(
        <table>
          <tbody>
            <tr>
              <ArrayItemObjectFieldTemplate {...props} />
            </tr>
          </tbody>
        </table>
      )
    ).toThrow(
      'useFieldOnChange must be used within a field rendered by DefaultFieldTemplate'
    );
  });
});
