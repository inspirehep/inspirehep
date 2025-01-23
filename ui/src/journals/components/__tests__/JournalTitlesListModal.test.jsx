import React from 'react';
import { render, screen } from '@testing-library/react';
import { JournalTitlesListModal } from '../JournalTitlesListModal';

describe('JournalTitlesListModal', () => {
  const mockOnModalVisibilityChange = jest.fn();
  const titleVariants = [
    'Journal of High Energy Physics',
    'JOURNAL OF HIGH ENERGY PHYSICS',
    'J. High Energy Phys.',
  ];

  it('renders correctly when modal is visible', () => {
    render(
      <JournalTitlesListModal
        modalVisible
        onModalVisibilityChange={mockOnModalVisibilityChange}
        titleVariants={titleVariants}
      />
    );

    expect(screen.getByText('Title variants')).toBeInTheDocument();
    titleVariants.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('does not render when modal is not visible', () => {
    render(
      <JournalTitlesListModal
        modalVisible={false}
        onModalVisibilityChange={mockOnModalVisibilityChange}
        titleVariants={titleVariants}
      />
    );

    expect(screen.queryByText('Title variants')).not.toBeInTheDocument();
  });
});
