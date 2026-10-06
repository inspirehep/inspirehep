import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { WidgetProps } from '@rjsf/utils';

import http from '../../../../../common/http';
import {
  ObjectFieldDataContext,
  ObjectFieldData,
} from '../../../ObjectFieldDataContext';
import InstitutionAutocompleteWidget from '../InstitutionAutocompleteWidget';
import { buildWidgetProps } from './buildWidgetProps';

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
      <InstitutionAutocompleteWidget {...props} />
    </ObjectFieldDataContext.Provider>
  );
}

describe('InstitutionAutocompleteWidget', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('calls onChange with the raw typed value and leaves the position record untouched when none was curated yet', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/institutions/_search_as_you_type?affiliation=C')
      .replyOnce(200, { affiliation: [{ options: [] }] });

    const onChange = vi.fn();
    const onPositionChange = vi.fn();

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: { institution: '' },
          onChange: onPositionChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'C');

    expect(onChange).toHaveBeenCalledWith('C');
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('clears the previously curated record when the user edits the institution text', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/institutions/_search_as_you_type?affiliation=C')
      .replyOnce(200, { affiliation: [{ options: [] }] });

    const onChange = vi.fn();
    const onPositionChange = vi.fn();
    const curatedFormData = {
      institution: 'CERN',
      record: { $ref: 'https://inspirehep.net/api/institutions/902725' },
      curated_relation: true,
    };

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: curatedFormData,
          onChange: onPositionChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'C');

    expect(onPositionChange).toHaveBeenCalledWith({
      ...curatedFormData,
      institution: 'C',
      record: undefined,
      curated_relation: false,
    });
  });

  it('selecting a suggestion sets the legacy ICN value and curates the institution record', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/institutions/_search_as_you_type?affiliation=CER')
      .replyOnce(200, {
        affiliation: [
          {
            options: [
              { _source: { control_number: 902725, legacy_ICN: 'CERN' } },
            ],
          },
        ],
      });

    const onChange = jest.fn();
    const onPositionChange = jest.fn();
    const initialFormData = { institution: '' };

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: initialFormData,
          onChange: onPositionChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'CER');

    const suggestion = await screen.findByText('CERN');
    await user.click(suggestion);

    expect(onChange).toHaveBeenCalledWith('CERN');
    expect(onPositionChange).toHaveBeenCalledWith({
      ...initialFormData,
      institution: 'CERN',
      record: {
        $ref: `${window.location.origin}/api/institutions/902725`,
      },
      curated_relation: true,
    });
  });
});
