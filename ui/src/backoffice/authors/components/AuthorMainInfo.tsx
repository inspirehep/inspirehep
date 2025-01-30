import React from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import ContentBox from '../../../common/components/ContentBox';
import { Ids } from '../../common/components/Links/Links';
import { filterByProperty } from '../../utils/utils';

type AuthorMainInfoProps = {
  data: any; // TODO: define proper type for data
};

const AuthorMainInfo = ({ data }: AuthorMainInfoProps) => {
  const name = data.getIn(['name', 'value']);
  const preferredName = data.getIn(['name', 'preferred_name']);
  const nativeNames = data.getIn(['name', 'native_names']);
  const nameVariants = data.getIn(['name', 'name_variants']);
  const status = data.get('status');
  const orcidIds = filterByProperty(data, 'ids', 'schema', 'ORCID');
  const orcidIdExists = orcidIds && orcidIds.size > 0;

  return (
    <ContentBox fullHeight={false} className="md-pb3 mb3">
      <h2>{name}</h2>
      {preferredName && (
        <p className="mb0">
          <b>Preferred name:</b> {preferredName}
        </p>
      )}
      {nativeNames && (
        <p className="mb0">
          <b>Native names:</b> {nativeNames.join('; ')}
        </p>
      )}
      {nameVariants && (
        <p className="mb0">
          <b>Name variants:</b> {nameVariants.join('; ')}
        </p>
      )}
      {status && (
        <p className={classNames({ mb0: orcidIdExists })}>
          <b>Status:</b> {status}
        </p>
      )}
      {orcidIdExists && <Ids ids={orcidIds} noIcon />}
    </ContentBox>
  );
};

export default AuthorMainInfo;
