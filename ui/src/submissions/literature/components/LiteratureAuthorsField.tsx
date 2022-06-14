import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';

import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import AuthorSuggesterField from '../../common/components/AuthorSuggesterField';

type Props = {
    values: {
        [key: string]: $TSFixMe;
    };
    name: string;
    label: string;
};

class LiteratureAuthorsField extends Component<Props> {

  static getSuggestionSourceLegacyICN(suggestion: $TSFixMe) {
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(itemName: $TSFixMe) => <Row type="flex" justify="space-between">
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

export default LiteratureAuthorsField;
