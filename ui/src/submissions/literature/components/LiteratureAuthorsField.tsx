import React from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';

import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import AuthorSuggesterField from '../../common/components/AuthorSuggesterField';

function LiteratureAuthorsField({
  values,
  name,
  label,
}: {
  values: any;
  name: string;
  label: string;
}) {
  function getSuggestionSourceLegacyICN(suggestion: {
    _source: { legacy_ICN: string };
  }) {
    return suggestion._source.legacy_ICN;
  }

  return (
    <ArrayOf
      values={values}
      name={name}
      label={label}
      emptyItem={{}}
      renderItem={(itemName: { record: number }) => (
        <Row justify="space-between">
          <Col span={11}>
            <AuthorSuggesterField
              onlyChild
              name={`${itemName}.full_name`}
              recordFieldPath={`${itemName}.record`}
              placeholder="Family name, first name"
            />
          </Col>
          <Col span={11}>
            <Field
              onlyChild
              name={`${itemName}.affiliation`}
              recordFieldPath={`${itemName}.affiliation_record`}
              placeholder="Affiliation, type for suggestions"
              pidType="institutions"
              suggesterName="affiliation"
              searchasyoutype="true"
              extractItemCompletionValue={getSuggestionSourceLegacyICN}
              component={SuggesterField}
            />
          </Col>
        </Row>
      )}
    />
  );
}

export default LiteratureAuthorsField;
