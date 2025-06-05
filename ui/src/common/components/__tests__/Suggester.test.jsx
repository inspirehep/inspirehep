import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import http from '../../http';
import Suggester, { REQUEST_DEBOUNCE_MS } from '../Suggester';

const mockHttp = new MockAdapter(http.httpClient);

function wait(milisec = REQUEST_DEBOUNCE_MS + 25) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milisec);
  });
}

describe('Suggester', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('renders results onSearch', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
            },
            {
              text: 'Result 2',
            },
          ],
        },
      ],
    };

    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);

    const screen = render(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'test' },
    });

    await wait();

    expect(screen.getAllByText('Result 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Result 2')[0]).toBeInTheDocument();
  });

  it('renders results with custom extractUniqueItemValue', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
              extra: 'Extra 1',
            },
            {
              text: 'Result 2',
              extra: 'Extra 2',
            },
          ],
        },
      ],
    };

    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);

    const screen = render(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        extractUniqueItemValue={(result) => `${result.text} - ${result.extra}`}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'test' },
    });

    await wait();

    expect(
      screen.getByRole('option', { name: 'Result 1 - Extra 1' })
    ).toBeInTheDocument();
  });

  it('renders results with custom extractItemCompletionValue', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              id: '1',
              name: 'Result',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const screen = render(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        extractItemCompletionValue={(suggestion) => suggestion.name}
        extractUniqueItemValue={(suggestion) => suggestion.id}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'test' },
    });

    await wait();

    expect(screen.getByRole('option', { name: '1' })).toBeInTheDocument();
  });

  it('renders results with custom result template', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
              extra: 'Extra 1',
            },
            {
              text: 'Result 2',
              extra: 'Extra 2',
            },
          ],
        },
      ],
    };

    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);

    const screen = render(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        renderResultItem={(result) => (
          <span>
            {result.text} <em>{result.extra}</em>
          </span>
        )}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'test' },
    });

    await wait();

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onChange if extractItemCompletionValue prop is present', async () => {
    const onChange = jest.fn();
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              id: '1',
              name: 'Result',
            },
          ],
        },
      ],
    };

    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);

    const screen = render(
      <Suggester
        onChange={onChange}
        pidType="literature"
        extractItemCompletionValue={(suggestion) => suggestion.name}
        extractUniqueItemValue={(suggestion) => suggestion.id}
        suggesterName="abstract_source"
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Result' },
    });

    await wait();

    expect(onChange).toHaveBeenCalledWith('Result', {});
  });

  it('calls only onChange if extractItemCompletionValue prop is present and onSelect is not when an option is selected', async () => {
    const onChange = jest.fn();
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              id: '1',
              name: 'Result',
            },
          ],
        },
      ],
    };

    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);

    const screen = render(
      <Suggester
        onChange={onChange}
        pidType="literature"
        extractItemCompletionValue={(suggestion) => suggestion.name}
        extractUniqueItemValue={(suggestion) => suggestion.id}
        suggesterName="abstract_source"
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Result' },
    });

    await wait();

    expect(onChange).toHaveBeenCalledWith('Result', {});
  });

  it('renders empty if request fails', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    mockHttp.onGet(suggesterQueryUrl).replyOnce(404);

    const screen = render(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'test' },
    });

    await wait();

    expect(screen.baseElement).toMatchSnapshot();
  });
});
