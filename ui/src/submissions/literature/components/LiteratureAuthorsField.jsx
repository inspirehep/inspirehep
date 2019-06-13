import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';

class LiteratureAuthorsField extends Component {
  static getSuggestionSourceNameValue(suggestion) {
    return suggestion._source.name.value;
  }

  static getSuggestionSourceLegacyICN(suggestion) {
    return suggestion._source.legacy_ICN;
  }

  render() {
    const { values, name, label } = this.props;

    return (
      <ArrayOf
        values={values}
        name={name}
        label={label}
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Field
                onlyChild
                recordFieldPath={`${itemName}.record`}
                name={`${itemName}.full_name`}
                placeholder="Family name, first name"
                pidType="authors"
                suggesterName="author"
                extractItemCompletionValue={
                  LiteratureAuthorsField.getSuggestionSourceNameValue
                }
                component={SuggesterField}
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
                extractItemCompletionValue={
                  LiteratureAuthorsField.getSuggestionSourceLegacyICN
                }
                component={SuggesterField}
              />
            </Col>
          </Row>
        )}
      />
    );
  }
}

LiteratureAuthorsField.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default LiteratureAuthorsField;
