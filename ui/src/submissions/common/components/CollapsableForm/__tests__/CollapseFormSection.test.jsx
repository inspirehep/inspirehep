import { render } from '@testing-library/react';

import CollapsableForm from '..';

describe('CollapsableForm.Section', () => {
  it('renders the section header and content inside the collapse', () => {
    const { asFragment, getByText } = render(
      <CollapsableForm openSections={['some_key']}>
        <CollapsableForm.Section header="header" key="some_key">
          <p>content</p>
        </CollapsableForm.Section>
      </CollapsableForm>
    );

    expect(getByText('header')).toBeInTheDocument();
    expect(getByText('content')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
