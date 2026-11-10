import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildObjectFieldTemplateProps } from './buildObjectFieldTemplateProps';
import TabsObjectFieldTemplate from '../TabsObjectFieldTemplate';
import {
  DEFAULT_TAB_NAME,
  EditorTabContext,
} from '../../../../EditorTabContext';

const buildProps = () =>
  buildObjectFieldTemplateProps({
    uiSchema: {
      'ui:options': {
        tabs: [
          { name: 'References', properties: ['references'] },
          { name: 'Authors', properties: ['authors', 'collaborations'] },
        ],
      },
    },
    properties: [
      { name: 'titles', content: <span>Titles field</span>, hidden: false },
      {
        name: 'references',
        content: <span>References field</span>,
        hidden: false,
      },
      { name: 'authors', content: <span>Authors field</span>, hidden: false },
    ] as any,
  });

function Wrapper({ initialTab = DEFAULT_TAB_NAME }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  return (
    <EditorTabContext.Provider value={{ activeTab, setActiveTab }}>
      <TabsObjectFieldTemplate {...buildProps()} />
    </EditorTabContext.Provider>
  );
}

describe('<TabsObjectFieldTemplate />', () => {
  it('should show unlisted properties in the Main tab by default', () => {
    render(<Wrapper />);

    expect(screen.getByRole('tab', { name: 'Main' })).toBeVisible();
    expect(screen.getByText('Titles field')).toBeVisible();
    expect(screen.getByText('References field')).not.toBeVisible();
  });

  it('should show listed properties in their own tab', async () => {
    render(<Wrapper />);

    await userEvent.click(screen.getByRole('tab', { name: 'Authors' }));

    expect(screen.getByText('Authors field')).toBeVisible();
    expect(screen.getByText('Titles field')).not.toBeVisible();
  });

  it('should not render a tab whose properties are all absent or hidden', () => {
    const props = buildProps();
    props.properties = props.properties.filter((p) => p.name !== 'references');
    render(<TabsObjectFieldTemplate {...props} />);

    expect(
      screen.queryByRole('tab', { name: 'References' })
    ).not.toBeInTheDocument();
  });

  it('should display the tab given by the context', () => {
    render(<Wrapper initialTab="Authors" />);

    expect(screen.getByText('Authors field')).toBeVisible();
    expect(screen.getByText('Titles field')).not.toBeVisible();
  });
});
