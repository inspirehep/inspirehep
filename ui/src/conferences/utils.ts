export function getContributionsQueryString(recordId: any) {
  return `publication_info.conference_record.$ref:${recordId}`;
}
