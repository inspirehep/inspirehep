import React from 'react';
import { Field, Form } from 'formik';
import { Row, Col } from 'antd';

import SelectField from '../../common/components/SelectField';
import SubmitButton from '../../common/components/SubmitButton';
import SuggesterField from '../../common/components/SuggesterField';
import { EXPERIMENT_TYPE_OPTIONS } from '../schemas/constants';

const ExperimentForm = () => {
  const getSuggestionSourceLegacyName = (suggestion) => suggestion._source.legacy_name;

  return (
    <Form className="bg-white pa3">
      <Row className="pt3 bg-white">
        <Col span={24}>
          <Field
            name="project_type"
            label="* Experiment type"
            mode="multiple"
            options={EXPERIMENT_TYPE_OPTIONS}
            placeholder="Select types"
            component={SelectField}
          />
        </Col>
      </Row>

      <Row className="mb3 pt2 bg-white">
        <Col span={24}>
          <Field
            component={SuggesterField}
            extractItemCompletionValue={getSuggestionSourceLegacyName}
            label="* Legacy name"
            name="legacy_name"
            pidType="experiments"
            placeholder="Legacy name, type for suggestions"
            searchAsYouType
            suggesterName="experiment"
          />
        </Col>
      </Row>

      <Row type="flex" justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
};

export default ExperimentForm;
