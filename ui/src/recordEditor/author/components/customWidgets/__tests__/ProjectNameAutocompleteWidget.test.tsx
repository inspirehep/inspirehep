import MockAdapter from 'axios-mock-adapter';
import { WidgetProps } from '@rjsf/utils';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { buildWidgetProps } from './buildWidgetProps';
import http from '../../../../../common/http';
import {
  ObjectFieldData,
  ObjectFieldDataContext,
} from '../../../ObjectFieldDataContext';
import ProjectNameAutocompleteWidget from '../ProjectNameAutocompleteWidget';

const mockHttp = new MockAdapter((http as any).httpClient);

function ControlledWidget({
  widgetProps,
  contextValue,
}: {
  widgetProps: Partial<WidgetProps>;
  contextValue: ObjectFieldData;
}) {
  const { onChange: onChangeSpy, value: initialValue, ...rest } = widgetProps;
  const [value, setValue] = useState(initialValue ?? '');

  const onChange: WidgetProps['onChange'] = (newValue, ...args) => {
    setValue(newValue);
    onChangeSpy?.(newValue, ...args);
  };

  const props = buildWidgetProps({ ...rest, value, onChange });

  return (
    <ObjectFieldDataContext.Provider value={contextValue}>
      <ProjectNameAutocompleteWidget {...props} />
    </ObjectFieldDataContext.Provider>
  );
}

describe('ProjectNameAutocompleteWidget', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('calls onChange with the raw typed value and leaves the project membership record untouched when none was curated yet', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/experiments/_search_as_you_type?experiment=C')
      .replyOnce(200, { experiment: [{ options: [] }] });

    const onChange = vi.fn();
    const onProjectChange = vi.fn();

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: { name: '' },
          onChange: onProjectChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'D');

    expect(onChange).toHaveBeenCalledWith('D');
    expect(onProjectChange).not.toHaveBeenCalled();
  });

  it('clears the previously curated record when the user edits the experiment name text', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/experiments/_search_as_you_type?experiment=C')
      .replyOnce(200, { experiment: [{ options: [] }] });

    const onChange = vi.fn();
    const onProjectChange = vi.fn();
    const curatedFormData = {
      name: 'DES',
      record: { $ref: 'https://inspirebeta.net/api/experiments/1108381' },
      curated_relation: true,
    };

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: curatedFormData,
          onChange: onProjectChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'D');

    expect(onProjectChange).toHaveBeenCalledWith({
      ...curatedFormData,
      name: 'D',
      record: undefined,
      curated_relation: false,
    });
  });

  it('selecting a suggestion sets the legacy name and curates the experiment record', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/experiments/_search_as_you_type?experiment=DE')
      .replyOnce(200, {
        experiment: [
          {
            options: [
              { _source: { control_number: 1108381, legacy_name: 'DES' } },
            ],
          },
        ],
      });

    const onChange = vi.fn();
    const onProjectChange = vi.fn();
    const initialFormData = { name: '' };

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: initialFormData,
          onChange: onProjectChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'DE');

    const suggestion = await screen.findByText('DES');
    await user.click(suggestion);

    expect(onChange).toHaveBeenCalledWith('DES');
    expect(onProjectChange).toHaveBeenCalledWith({
      ...initialFormData,
      name: 'DES',
      record: {
        $ref: `${window.location.origin}/api/experiments/1108381`,
      },
      curated_relation: true,
    });
  });
});
