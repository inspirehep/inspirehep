import React from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import ContentBox from '../../../common/components/ContentBox';
import { Ids } from '../Links';

type AuthorMainInfoProps = {
  data: any; // TODO: define proper type for data
};

const hasOrcidId = (data: any): boolean => {
  return data
    .get('ids')
    ?.find(
      (id: { get: (arg0: string) => string }) => id.get('schema') === 'ORCID'
    );
};

const filterOrcidIds = (data: any) => {
  return data
    .get('ids')
    ?.filter((id: Map<string, any>) => id.get('schema') === 'ORCID');
};

const AuthorMainInfo = ({ data }: AuthorMainInfoProps) => {
  const name = data.getIn(['name', 'value']);
  const prefferedName = data.getIn(['name', 'preferred_name']);
  const nativeNames = data.getIn(['name', 'native_names']);
  const nameVariants = data.getIn(['name', 'name_variants']);
  const status = data.get('status');
  const orcidIdExists = hasOrcidId(data);
  const orcidIds = filterOrcidIds(data);

  return (
    <ContentBox fullHeight={false} className="md-pb3 mb3">
      <h2>{name}</h2>
      {prefferedName && (
        <p>
          <b>Preferred name:</b> {prefferedName}
        </p>
      )}
      {nativeNames && (
        <p>
          <b>Native names:</b> {nativeNames.join('; ')}
        </p>
      )}
      {nameVariants && (
        <p>
          <b>Name variants:</b> {nameVariants.join('; ')}
        </p>
      )}
      {status && (
        <p className={classNames({ mb0: !orcidIdExists })}>
          <b>Status:</b> {status}
        </p>
      )}
      {orcidIdExists && <Ids ids={orcidIds} noIcon />}
    </ContentBox>
  );
};

export default AuthorMainInfo;
