import { render, screen } from '@testing-library/react';
import ViewRecordWidget from '../ViewRecordWidget';
import { buildWidgetProps } from './buildWidgetProps';

describe('<ViewRecordWidget />', () => {
  it('should render link to record', () => {
    render(
      <ViewRecordWidget
        {...buildWidgetProps()}
        value={`${window.location.origin}/api/institutions/902725`}
      />
    );

    expect(
      screen.getByRole('link', { name: 'View institution' })
    ).toHaveAttribute('href', `${window.location.origin}/institutions/902725`);
  });
});
