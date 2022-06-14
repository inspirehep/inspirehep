export function getPageDisplay(pagesInfo: $TSFixMe) {
  if (pagesInfo.has('page_start') && pagesInfo.has('page_end')) {
    return `${pagesInfo.get('page_start')}-${pagesInfo.get('page_end')}`;
  }

  if (pagesInfo.has('page_start')) {
    return pagesInfo.get('page_start');
  }

  return null;
}

export function getPapersQueryString(recordId: $TSFixMe) {
  return `refersto:recid:${recordId}`;
}
