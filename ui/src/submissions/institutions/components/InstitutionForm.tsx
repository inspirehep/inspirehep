import React from 'react';
import { Field, Form } from 'formik';
import { Row, Col } from 'antd';

import SubmitButton from '../../common/components/SubmitButton';
import SuggesterField from '../../common/components/SuggesterField';

const InstitutionsForm = () => {
  const getSuggestionSourceLegacyICN = (suggestion) => suggestion._source.legacy_ICN;

  return (
    <Form className="bg-white pa3">
      <Row className="mb3 pt2 bg-white">
        <Col span={24}>
          <Field
            component={SuggesterField}
            extractItemCompletionValue={getSuggestionSourceLegacyICN}
            label="* Institution name"
            name="identifier"
            pidType="institutions"
            placeholder="Institution, type for suggestions"
            searchAsYouType
            suggesterName="affiliation"
          />
        </Col>
      </Row>

      <Row type="flex" justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
};

export default InstitutionsForm;
