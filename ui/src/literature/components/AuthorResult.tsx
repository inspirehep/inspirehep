import React from 'react';
import { Row, Col, Radio } from 'antd';

import Author from '../../common/components/Author';
import ResultItem from '../../common/components/ResultItem';
import { castPropToNumber, getRecordIdFromRef } from '../../common/utils';
import { IAuthorResult } from './AssignLiteratureItemDrawer';

const AuthorResult = ({
  item,
  page,
}: {
  item: IAuthorResult;
  page: string;
}) => {
  const getAuthorRecordIdFromRef = (item: IAuthorResult): number | undefined => {
    const recordRef = item.get('record')?.toJS().$ref;
    return recordRef ? castPropToNumber(getRecordIdFromRef(recordRef)) : undefined;
  };
  
  const isRadioButtonDisabled = (item: IAuthorResult): boolean => !getAuthorRecordIdFromRef(item);

  return (
    <Row>
      <Col flex="0 1 1px">
        <Radio
          value={getAuthorRecordIdFromRef(item)}
          disabled={isRadioButtonDisabled(item)}
          data-test-id={`literature-drawer-radio-${getAuthorRecordIdFromRef(item)}`}
        />
      </Col>
      <Col flex="1 1 1px" className="pb2">
        <ResultItem>
          <Author author={item} page={page} />
        </ResultItem>
      </Col>
    </Row>
  );
};

export default AuthorResult;
