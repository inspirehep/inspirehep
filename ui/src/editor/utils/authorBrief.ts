export function authorNeedsEdit(author: unknown): boolean {
  return !(author as any)?.record?.$ref;
}

export function authorHref(author: unknown): string | undefined {
  const $ref = (author as any)?.record?.$ref;
  return typeof $ref === 'string' && $ref
    ? $ref.replace('/api/', '/')
    : undefined;
}

export function authorBrief(author: unknown): string {
  const fullName = (author as any)?.full_name;
  return typeof fullName === 'string' && fullName ? fullName : 'Empty author';
}

export function authorSuffix(author: unknown): string | undefined {
  const affiliations = (author as any)?.affiliations;
  if (!Array.isArray(affiliations)) {
    return undefined;
  }
  const values = affiliations
    .map((affiliation) => affiliation?.value)
    .filter((value) => typeof value === 'string' && value);
  return values.length > 0 ? values.join(' and ') : undefined;
}
