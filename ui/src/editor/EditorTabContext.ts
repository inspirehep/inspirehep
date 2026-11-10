import { createContext, useContext } from 'react';

export interface EditorTab {
  name: string;
  properties: string[];
}

export const DEFAULT_TAB_NAME = 'Main';

export interface EditorTabState {
  activeTab: string;
  setActiveTab: (name: string) => void;
}

export const EditorTabContext = createContext<EditorTabState>({
  activeTab: DEFAULT_TAB_NAME,
  setActiveTab: () => {},
});

export function useEditorTab(): EditorTabState {
  return useContext(EditorTabContext);
}

export function getTabNameForErrorPath(
  tabs: EditorTab[] = [],
  errorPath: string
): string {
  const topLevelName = errorPath.split(/[.[\]]/).find(Boolean) ?? '';
  return (
    tabs.find((tab) => tab.properties.includes(topLevelName))?.name ??
    DEFAULT_TAB_NAME
  );
}
