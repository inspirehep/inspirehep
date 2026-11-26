import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReferencesToolbarActions from '../ReferencesToolbarActions';
import {
  ToolbarActions,
  ToolbarActionsContext,
} from '../../../ToolbarActionsContext';

const existing = { reference: { label: '1' } };
const extracted = { reference: { label: '2' } };
const linked = { record: { $ref: 'x' }, reference: { label: '1' } };

function renderReferencesToolbarActions({
  formData = [existing] as any[],
  readonly = false,
  actions = {
    extractReferences: vi.fn().mockResolvedValue([extracted]),
    linkReferences: vi.fn().mockResolvedValue([linked]),
  } as Partial<ToolbarActions>,
} = {}) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  render(
    <ToolbarActionsContext.Provider
      value={{ extractAuthors: vi.fn(), ...actions } as ToolbarActions}
    >
      <ReferencesToolbarActions
        formData={formData}
        onChange={onChange}
        readonly={readonly}
        onReset={onReset}
      />
    </ToolbarActionsContext.Provider>
  );
  return { onChange, onReset, actions };
}

async function extract(source: string) {
  await userEvent.click(
    screen.getByRole('button', { name: 'Extract references' })
  );
  const textarea = await screen.findByPlaceholderText(/Text or URL/);
  await userEvent.type(textarea, source);
  return textarea;
}

describe('<ReferencesToolbarActions />', () => {
  it('throws when rendered outside of the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <ReferencesToolbarActions formData={[]} onChange={vi.fn()} readonly />
      )
    ).toThrow('useToolbarActions must be used within');
  });

  it('replaces existing references on extract by default', async () => {
    const { onChange, actions } = renderReferencesToolbarActions();
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(actions.extractReferences).toHaveBeenCalledWith('some text');
    expect(onChange).toHaveBeenCalledWith([extracted]);
  });

  it('appends extracted references when replace is unchecked', async () => {
    const { onChange } = renderReferencesToolbarActions();
    await extract('some text');
    await userEvent.click(screen.getByLabelText('Replace existing'));
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).toHaveBeenCalledWith([existing, extracted]);
  });

  it.each([true, false])(
    'calls onReset and resets the popover after a successful extraction (replace: %s)',
    async (replace) => {
      const { onChange, onReset } = renderReferencesToolbarActions();
      await extract('some text');
      if (!replace) {
        await userEvent.click(screen.getByLabelText('Replace existing'));
      }
      await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

      expect(onChange).toHaveBeenCalled();
      expect(onReset).toHaveBeenCalledTimes(1);

      await userEvent.click(
        screen.getByRole('button', { name: 'Extract references' })
      );
      expect(await screen.findByPlaceholderText(/Text or URL/)).toHaveValue('');
      expect(screen.getByLabelText('Replace existing')).toBeChecked();
    }
  );

  it('does not call onReset when extraction fails or on link', async () => {
    const { onReset } = renderReferencesToolbarActions({
      actions: {
        extractReferences: vi.fn().mockResolvedValue(undefined),
        linkReferences: vi.fn().mockResolvedValue([linked]),
      },
    });
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));
    expect(onReset).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Refresh to link' })
    );
    expect(onReset).not.toHaveBeenCalled();
  });

  it('does not change the references when extraction fails', async () => {
    const { onChange } = renderReferencesToolbarActions({
      actions: {
        extractReferences: vi.fn().mockResolvedValue(undefined),
        linkReferences: vi.fn(),
      },
    });
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables Extract until there is a source', async () => {
    renderReferencesToolbarActions();
    await userEvent.click(
      screen.getByRole('button', { name: 'Extract references' })
    );
    expect(
      await screen.findByRole('button', { name: 'Extract' })
    ).toBeDisabled();
  });

  it('links references and replaces the value', async () => {
    const { onChange, actions } = renderReferencesToolbarActions();
    await userEvent.click(
      screen.getByRole('button', { name: /Refresh to link/ })
    );

    expect(actions.linkReferences).toHaveBeenCalledWith([existing]);
    expect(onChange).toHaveBeenCalledWith([linked]);
  });

  it('strips empty values from references before sending them to the matcher', async () => {
    const { actions } = renderReferencesToolbarActions({
      formData: [
        { reference: { label: '1', title: { title: '' }, authors: [] }, x: {} },
      ] as any[],
    });
    await userEvent.click(
      screen.getByRole('button', { name: /Refresh to link/ })
    );

    expect(actions.linkReferences).toHaveBeenCalledWith([existing]);
  });

  it('strips empty values from extracted references', async () => {
    const { onChange } = renderReferencesToolbarActions({
      actions: {
        extractReferences: vi
          .fn()
          .mockResolvedValue([{ reference: { label: '2', texkey: '' } }]),
        linkReferences: vi.fn(),
      },
    });
    await extract('some text');
    await userEvent.click(screen.getByRole('button', { name: 'Extract' }));

    expect(onChange).toHaveBeenCalledWith([extracted]);
  });

  it('does not change the references when linking fails', async () => {
    const { onChange } = renderReferencesToolbarActions({
      actions: {
        extractReferences: vi.fn(),
        linkReferences: vi.fn().mockResolvedValue(undefined),
      },
    });
    await userEvent.click(
      screen.getByRole('button', { name: /Refresh to link/ })
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the buttons when readonly, and linking without references', () => {
    renderReferencesToolbarActions({ readonly: true });
    expect(
      screen.getByRole('button', { name: 'Extract references' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Refresh to link/ })
    ).toBeDisabled();
  });

  it('disables Refresh to link when there are no references', () => {
    renderReferencesToolbarActions({ formData: [] });
    expect(
      screen.getByRole('button', { name: /Refresh to link/ })
    ).toBeDisabled();
  });
});
