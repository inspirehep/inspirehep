import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import AuthorSuggesterField from '../../common/components/AuthorSuggesterField';

class LiteratureAuthorsField extends Component {
  static getSuggestionSourceLegacyICN(suggestion: any) {
    return suggestion._source.legacy_ICN;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values, name, label } = this.props;

    return (
      <ArrayOf
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: any; label: any; emptyI... Remove this comment to see the full error message
        values={values}
        name={name}
        label={label}
        emptyItem={{}}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(itemName: any) => <Row type="flex" justify="space-between">
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
              searchAsYouType
              extractItemCompletionValue={
                LiteratureAuthorsField.getSuggestionSourceLegacyICN
              }
              component={SuggesterField}
            />
          </Col>
        </Row>}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LiteratureAuthorsField.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default LiteratureAuthorsField;
