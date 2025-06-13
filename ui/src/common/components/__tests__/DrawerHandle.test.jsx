import React from 'react';
import { render } from '@testing-library/react';

import DrawerHandle from '../DrawerHandle';

describe('DrawerHandle', () => {
  it('renders DrawerHandle with all props', async () => {
    const { getByTestId, getByText } = render(
      <DrawerHandle
        className="mt3"
        handleText="Handle"
        drawerTitle="Title"
        width={256}
      >
        <div>Content</div>
      </DrawerHandle>
    );
    expect(getByTestId('handle-button')).toBeInTheDocument();
    expect(getByText('Handle')).toBeInTheDocument();
  });

  it('renders DrawerHandle with default props', () => {
    const { getByTestId, getByText } = render(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );
    expect(getByTestId('handle-button')).toBeInTheDocument();
    expect(getByText('Open')).toBeInTheDocument();
  });

  it('makes drawer visible on handle click', () => {
    const { getByTestId, getByText } = render(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );
    const button = getByTestId('handle-button');
    button.click();
    expect(getByText('Open')).toBeInTheDocument();
    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
  });
});
