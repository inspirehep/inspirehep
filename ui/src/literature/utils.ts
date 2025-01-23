import { Map } from 'immutable';

export function getPageDisplay(pagesInfo: Map<string, any>) {
  if (pagesInfo.has('page_start') && pagesInfo.has('page_end')) {
    return `${pagesInfo.get('page_start')}-${pagesInfo.get('page_end')}`;
  }

  if (pagesInfo.has('page_start')) {
    return pagesInfo.get('page_start');
  }

  return null;
}

export function getPapersQueryString(recordId: number) {
  return `refersto:recid:${recordId}`;
}

export function scrollToElement(element: string) {
  const scrollElement = document.getElementById(element);
  if (scrollElement) {
    scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
