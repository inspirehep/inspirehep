import { createContext, useContext } from 'react';

export interface DisplayAsListItemInfo {
  brief: string;
  href?: string;
  suffix?: string;
  flagged: boolean;
}

export interface DisplayAsListItem {
  getItemInfo: (index: number) => DisplayAsListItemInfo;
  isNewItem: (index: number) => boolean;
}

export const DisplayAsListItemContext = createContext<
  DisplayAsListItem | undefined
>(undefined);

export function useDisplayAsListItemInfo(
  index: number
): DisplayAsListItemInfo | undefined {
  return useContext(DisplayAsListItemContext)?.getItemInfo(index);
}

export function useIsNewDisplayAsListItem(index: number): boolean {
  return useContext(DisplayAsListItemContext)?.isNewItem(index) ?? false;
}
