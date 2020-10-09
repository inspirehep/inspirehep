import { string } from 'yup';
import React from 'react';
import { Link } from 'react-router-dom';

import http from '../../../common/http.ts';
import { SUBMISSIONS_AUTHOR } from '../../../common/routes';

const ONLY_CONTROL_NUMBER_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};

function fetchAuthorFromOrcid(orcid) {
  return http.get(
    `/orcid/${orcid}`,
    ONLY_CONTROL_NUMBER_SERIALIZER_REQUEST_OPTIONS
  );
}

function renderAuthorExistsMessageWithUpdateLink(authorId) {
  const authorUpdateLink = `${SUBMISSIONS_AUTHOR}/${authorId}`;
  return (
    <span>
      Author with this ORCID already exist, please submit an{' '}
      <Link to={authorUpdateLink}>update</Link>
    </span>
  );
}

async function isUniqueOrcid(orcid) {
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
  return string()
    .trim()
    .test('unique-orcid', null, isUniqueOrcid);
}
