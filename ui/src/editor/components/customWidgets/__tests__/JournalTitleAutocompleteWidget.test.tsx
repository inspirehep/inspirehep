import MockAdapter from 'axios-mock-adapter';
import { WidgetProps } from '@rjsf/utils';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { buildWidgetProps } from './buildWidgetProps';
import http from '../../../../common/http';
import {
  ObjectFieldData,
  ObjectFieldDataContext,
} from '../../../ObjectFieldDataContext';
import JournalTitleAutocompleteWidget from '../JournalTitleAutocompleteWidget';

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
      <JournalTitleAutocompleteWidget {...props} />
    </ObjectFieldDataContext.Provider>
  );
}

describe('JournalTitleAutocompleteWidget', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('clears the previously curated journal record when the user edits the title', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/journals/_suggest?journal_title=P')
      .replyOnce(200, { journal_title: [{ options: [] }] });

    const onChange = vi.fn();
    const onPublicationInfoChange = vi.fn();
    const curatedFormData = {
      journal_title: 'Phys.Rev.D',
      journal_record: { $ref: 'https://inspirehep.net/api/journals/1' },
      curated_relation: true,
    };

    render(
      <ControlledWidget
        widgetProps={{ onChange }}
        contextValue={{
          formData: curatedFormData,
          onChange: onPublicationInfoChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'P');

    expect(onChange).toHaveBeenCalledWith('P');
    expect(onPublicationInfoChange).toHaveBeenCalledWith({
      ...curatedFormData,
      journal_title: 'P',
      journal_record: undefined,
      curated_relation: false,
    });
  });

  it('selecting a suggestion sets the short title and curates the journal record', async () => {
    const user = userEvent.setup();
    const self = { $ref: 'https://inspirehep.net/api/journals/1234' };
    mockHttp.onGet('/journals/_suggest?journal_title=Phys').replyOnce(200, {
      journal_title: [
        {
          options: [
            {
              _source: {
                control_number: 1234,
                short_title: 'Phys.Rev.D',
                self,
              },
            },
          ],
        },
      ],
    });

    const onPublicationInfoChange = vi.fn();
    const initialFormData = { journal_title: '' };

    render(
      <ControlledWidget
        widgetProps={{}}
        contextValue={{
          formData: initialFormData,
          onChange: onPublicationInfoChange,
        }}
      />
    );

    await user.type(screen.getByRole('combobox'), 'Phys');
    await user.click(await screen.findByText('Phys.Rev.D'));

    expect(onPublicationInfoChange).toHaveBeenCalledWith({
      ...initialFormData,
      journal_title: 'Phys.Rev.D',
      journal_record: self,
      curated_relation: true,
    });
  });

  it('is disabled when readonly', () => {
    render(
      <ControlledWidget
        widgetProps={{ readonly: true }}
        contextValue={{ formData: {}, onChange: vi.fn() }}
      />
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
