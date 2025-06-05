import React from 'react';
import { render } from '@testing-library/react';

import EditRecordAction from '../EditRecordAction';
import {
  INSTITUTIONS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
  SEMINARS_PID_TYPE,
} from '../../constants';

describe('EditRecordAction', () => {
  it('renders edit button with pidType literature and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={LITERATURE_PID_TYPE}
        pidValue={1}
        page="Literature"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/editor/record/literature/1'
    );
  });

  it('renders edit button with pidType authors and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={AUTHORS_PID_TYPE}
        pidValue={1}
        page="Authors"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/submissions/authors/1');
  });

  it('renders edit button with pidType authors and pidValue for catalogers', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={AUTHORS_PID_TYPE}
        pidValue={1}
        isCatalogerLoggedIn
        page="Authors"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/editor/record/authors/1'
    );
  });

  it('renders edit button with pidType conferences and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={CONFERENCES_PID_TYPE}
        pidValue={1}
        page="Conferences"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/editor/record/conferences/1'
    );
  });

  it('renders edit button with pidType jobs and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction pidType={JOBS_PID_TYPE} pidValue={1} page="Jobs" />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/submissions/jobs/1');
  });

  it('renders edit button with pidType institutions and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={INSTITUTIONS_PID_TYPE}
        pidValue={1}
        page="Institutions"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/editor/record/institutions/1'
    );
  });

  it('renders edit button with pidType seminars and pidValue', () => {
    const { getByRole } = render(
      <EditRecordAction
        pidType={SEMINARS_PID_TYPE}
        pidValue={1}
        page="Seminars"
      />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/submissions/seminars/1'
    );
  });
});
