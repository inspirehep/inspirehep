// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';
import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../../common/http.ts';
import { SUBMISSIONS_AUTHOR } from '../../../common/routes';

const ONLY_CONTROL_NUMBER_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};

function fetchAuthorFromOrcid(orcid: $TSFixMe) {
  return http.get(
    `/orcid/${orcid}`,
    ONLY_CONTROL_NUMBER_SERIALIZER_REQUEST_OPTIONS
  );
}

function renderAuthorExistsMessageWithUpdateLink(authorId: $TSFixMe) {
  const authorUpdateLink = `${SUBMISSIONS_AUTHOR}/${authorId}`;
  return (
    <span>
      Author with this ORCID already exist, please submit an{' '}
      <Link to={authorUpdateLink}>update</Link>
    </span>
  );
}

async function isUniqueOrcid(this: $TSFixMe, orcid: $TSFixMe) {
  if (!orcid) {
    return true;
  }

  try {
    const { data } = await fetchAuthorFromOrcid(orcid);
    const id = data.metadata.control_number;
    const message = renderAuthorExistsMessageWithUpdateLink(id);
    return this.createError({ message });
  } catch (error) {
    // TODO: only return `true` if 404, and handle other errors
    return true;
  }
}

export default function uniqueOrcid() {
  return string().trim().test('unique-orcid', null, isUniqueOrcid);
}
