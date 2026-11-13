import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Tabs } from 'antd';
import {
  DEFAULT_TAB_NAME,
  EditorTab,
  useEditorTab,
} from '../../../EditorTabContext';

function TabsObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const tabs: EditorTab[] = props.uiSchema?.['ui:options']?.tabs ?? [];
  const { activeTab, setActiveTab } = useEditorTab();
  const inlineNames = (props.uiSchema?.['ui:options']?.inlineProperties ??
    []) as string[];
  const tabbedNames = new Set(tabs.flatMap((tab) => tab.properties));

  const renderProperty = (
    element: ObjectFieldTemplateProps['properties'][0]
  ) => (
    <div className="property-wrapper" key={element.name}>
      {element.content}
    </div>
  );

  const renderProperties = (isInTab: (name: string) => boolean) => {
    const visible = props.properties.filter(
      (element) => !element.hidden && isInTab(element.name)
    );
    const inline = visible.filter((element) =>
      inlineNames.includes(element.name)
    );
    const others = visible.filter(
      (element) => !inlineNames.includes(element.name)
    );
    return [
      inline.length > 0 && (
        <div className="flex flex-wrap justify-end" key="inline-properties">
          {inline.map(renderProperty)}
        </div>
      ),
      ...others.map(renderProperty),
    ];
  };

  const items = [
    {
      key: DEFAULT_TAB_NAME,
      label: DEFAULT_TAB_NAME,
      forceRender: true,
      children: renderProperties((name) => !tabbedNames.has(name)),
    },
    ...tabs
      .filter((tab) =>
        props.properties.some(
          (element) => !element.hidden && tab.properties.includes(element.name)
        )
      )
      .map((tab) => ({
        key: tab.name,
        label: tab.name,
        forceRender: true,
        children: renderProperties((name) => tab.properties.includes(name)),
      })),
  ];

  return (
    <Tabs
      className="editor-tabs"
      items={items}
      activeKey={activeTab}
      onChange={setActiveTab}
      tabBarStyle={{ paddingLeft: '30px' }}
    />
  );
}

export default TabsObjectFieldTemplate;
