import { isPlainObject } from 'lodash';

export function referenceNeedsEdit(reference: unknown): boolean {
  return !(reference as any)?.record?.$ref;
}

function formatAuthors(authors: any[] | undefined): string | undefined {
  if (!Array.isArray(authors) || authors.length === 0) {
    return undefined;
  }
  const firstAuthor = authors[0]?.full_name;

  return firstAuthor
    ? `${firstAuthor}${authors.length > 1 ? ' et al.' : ''}`
    : undefined;
}

function formatPublicationInfo(info: any): string | undefined {
  if (!isPlainObject(info)) {
    return undefined;
  }
  const parts = [
    info.journal_title,
    info.journal_volume,
    info.year && `(${info.year})`,
    info.page_start || info.artid,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

const firstString = (values: unknown): string | undefined => {
  const first = Array.isArray(values) ? values[0] : undefined;
  return typeof first === 'string' && first ? first : undefined;
};

export function referenceHref(reference: unknown): string | undefined {
  const $ref = (reference as any)?.record?.$ref;
  return typeof $ref === 'string' && $ref
    ? $ref.replace('/api/', '/')
    : undefined;
}

export function referenceBrief(reference: unknown): string {
  const ref = (reference as any)?.reference;
  if (!ref) {
    return 'Empty reference';
  }
  const isLinked = !referenceNeedsEdit(reference);
  const parts = [
    ref.label && `[${ref.label}]`,
    formatAuthors(ref.authors) ?? firstString(ref.collaborations),
    formatPublicationInfo(ref.publication_info),
    typeof ref.arxiv_eprint === 'string' && ref.arxiv_eprint,
    firstString(ref.report_numbers),
    !isLinked && firstString(ref.misc),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Empty reference';
}
