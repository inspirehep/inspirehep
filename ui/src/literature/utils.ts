export function getPageDisplay(pagesInfo) {
  if (pagesInfo.has('page_start') && pagesInfo.has('page_end')) {
    return `${pagesInfo.get('page_start')}-${pagesInfo.get('page_end')}`;
  }

  if (pagesInfo.has('page_start')) {
    return pagesInfo.get('page_start');
  }

  return null;
}

export function getPapersQueryString(recordId) {
  return `refersto:recid:${recordId}`;
}
