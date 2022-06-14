export function getContributionsQueryString(recordId) {
  return `publication_info.conference_record.$ref:${recordId}`;
}
