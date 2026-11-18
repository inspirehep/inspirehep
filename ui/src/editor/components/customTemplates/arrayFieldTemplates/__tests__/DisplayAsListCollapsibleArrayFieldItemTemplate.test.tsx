import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrayFieldItemButtonsTemplateProps } from '@rjsf/utils';

import DisplayAsListCollapsibleArrayFieldItemTemplate from '../DisplayAsListCollapsibleArrayFieldItemTemplate';
import {
  buildArrayFieldItemTemplateProps,
  reorderProps,
} from './buildArrayFieldItemTemplateProps';
import { ArrayAddItemContext } from '../../../../ArrayAddItemContext';

const renderCollapsible = (
  item: any,
  onRemoveItem = vi.fn(),
  getItemHref?: (item: any) => string | undefined
) => {
  const props = buildArrayFieldItemTemplateProps({
    index: 0,
    children: <div>item body</div>,
    buttonsProps: {
      ...reorderProps().buttonsProps,
      onRemoveItem,
    } as unknown as ArrayFieldItemButtonsTemplateProps,
  });
  render(
    <DisplayAsListCollapsibleArrayFieldItemTemplate
      {...props}
      brief={item.title}
      href={getItemHref?.(item)}
      flagged={!item.ok}
    />
  );
  return { onRemoveItem };
};

describe('<DisplayAsListCollapsibleArrayFieldItemTemplate />', () => {
  it('flags items needing edition', () => {
    renderCollapsible({ title: 'T', ok: false });
    expect(screen.getByLabelText('needs edition')).toBeVisible();
  });

  it('marks valid items', () => {
    renderCollapsible({ title: 'T', ok: true });
    expect(screen.getByLabelText('valid')).toBeVisible();
  });

  it('inserts a new element at its index through addAt', async () => {
    const addAt = vi.fn();
    const props = buildArrayFieldItemTemplateProps({
      index: 3,
      children: <div>item body</div>,
    });
    render(
      <ArrayAddItemContext.Provider value={{ addAt }}>
        <DisplayAsListCollapsibleArrayFieldItemTemplate
          {...props}
          brief="T"
          flagged={false}
        />
      </ArrayAddItemContext.Provider>
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Add new element here/ })
    );

    expect(addAt).toHaveBeenCalledWith(3);
  });

  it('expands on click and removes', async () => {
    const { onRemoveItem } = renderCollapsible({ title: 'T', ok: true });
    expect(screen.queryByText('item body')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('T'));
    expect(screen.getByText('item body')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onRemoveItem).toHaveBeenCalled();
  });

  it('renders the brief as a link to the record when an href exists', () => {
    renderCollapsible(
      { title: 'Brief' },
      vi.fn(),
      () => 'https://x/literature/1'
    );
    const link = screen.getByRole('link', { name: 'Brief' });
    expect(link).toHaveAttribute('href', 'https://x/literature/1');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders the brief as plain text without href', () => {
    renderCollapsible({ title: 'Brief' });
    expect(screen.queryByRole('link', { name: 'Brief' })).toBeNull();
  });
});
