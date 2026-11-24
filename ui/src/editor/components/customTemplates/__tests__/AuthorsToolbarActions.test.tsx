import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AuthorsToolbarActions from '../AuthorsToolbarActions';
import {
  ToolbarActions,
  ToolbarActionsContext,
} from '../../../ToolbarActionsContext';

const existing = { full_name: 'Doe, John' };
const extracted = { full_name: 'Roe, Jane' };

function renderAuthorsToolbarActions({
  formData = [existing] as any[],
  readonly = false,
  extractAuthors = vi.fn().mockResolvedValue([extracted]),
} = {}) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  render(
    <ToolbarActionsContext.Provider
      value={{ extractAuthors } as unknown as ToolbarActions}
    >
      <AuthorsToolbarActions
        formData={formData}
        onChange={onChange}
        readonly={readonly}
        onReset={onReset}
      />
    </ToolbarActionsContext.Provider>
  );
  return { onChange, onReset, extractAuthors };
}

async function extract(source: string) {
  await userEvent.click(
    screen.getByRole('button', { name: 'Extract authors' })
  );
  const textarea = await screen.findByPlaceholderText(/Text or Author XML/);
  await userEvent.type(textarea, source);
}

describe('<AuthorsToolbarActions />', () => {
  it('throws when rendered outside of the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <AuthorsToolbarActions formData={[]} onChange={vi.fn()} readonly />
      )
    ).toThrow('useToolbarActions must be used within');
  });

  it('replaces existing authors on extract by default', async () => {
    const { onChange, extractAuthors } = renderAuthorsToolbarActions();
    await extract('  some text ');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(extractAuthors).toHaveBeenCalledWith('some text');
    expect(onChange).toHaveBeenCalledWith([extracted]);
  });

  it('appends extracted authors when replace is unchecked', async () => {
    const { onChange } = renderAuthorsToolbarActions();
    await extract('some text');
    await userEvent.click(screen.getByLabelText('Replace existing'));
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).toHaveBeenCalledWith([existing, extracted]);
  });

  it('strips empty values from extracted authors', async () => {
    const { onChange } = renderAuthorsToolbarActions({
      extractAuthors: vi
        .fn()
        .mockResolvedValue([{ full_name: 'Roe, Jane', emails: [] }]),
    });
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).toHaveBeenCalledWith([extracted]);
  });

  it('calls onReset and resets the popover after a successful extraction', async () => {
    const { onReset } = renderAuthorsToolbarActions();
    await extract('some text');
    await userEvent.click(screen.getByLabelText('Replace existing'));
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onReset).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole('button', { name: 'Extract authors' })
    );
    expect(
      await screen.findByPlaceholderText(/Text or Author XML/)
    ).toHaveValue('');
    expect(screen.getByLabelText('Replace existing')).toBeChecked();
  });

  it('does not change the authors nor reset when extraction fails', async () => {
    const { onChange, onReset } = renderAuthorsToolbarActions({
      extractAuthors: vi.fn().mockResolvedValue(undefined),
    });
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('disables Extract until there is a source', async () => {
    renderAuthorsToolbarActions();
    await userEvent.click(
      screen.getByRole('button', { name: 'Extract authors' })
    );
    expect(
      await screen.findByRole('button', { name: 'Extract' })
    ).toBeDisabled();
  });

  it('disables the button when readonly', () => {
    renderAuthorsToolbarActions({ readonly: true });
    expect(
      screen.getByRole('button', { name: 'Extract authors' })
    ).toBeDisabled();
  });

  it('links to the authorlist tool help', async () => {
    renderAuthorsToolbarActions();
    await userEvent.click(
      screen.getByRole('button', { name: 'Extract authors' })
    );
    expect(
      await screen.findByRole('link', { name: 'How to use' })
    ).toHaveAttribute('href', '/authorlist-tool');
  });
});
