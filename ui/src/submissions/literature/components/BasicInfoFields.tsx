import React, { Component } from 'react';
import { Field } from 'formik';

import { languageOptions } from '../schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';
import TextAreaField from '../../common/components/TextAreaField';
import SuggesterField from '../../common/components/SuggesterField';
import LiteratureAuthorsField from './LiteratureAuthorsField';
import { inspireCategoryOptions } from '../../common/schemas/constants';

type OwnProps = {
    withCollaborationField?: boolean;
    values: {
        [key: string]: $TSFixMe;
    };
};

type Props = OwnProps & typeof BasicInfoFields.defaultProps;

class BasicInfoFields extends Component<Props> {

static defaultProps = {
    withCollaborationField: false,
};

  static getSuggestionSourceLegacyName(suggestion: $TSFixMe) {
    return suggestion._source.legacy_name;
  }

  render() {
    const { withCollaborationField, values } = this.props;

    return <>
      <Field name="title" label="* Title" component={TextField} />
      <Field
        name="language"
        label="* Language"
        options={languageOptions}
        component={SelectField}
      />
      <Field
        name="subjects"
        label="* Subjects"
        mode="multiple"
        options={inspireCategoryOptions}
        component={SelectField}
      />
      <LiteratureAuthorsField
        values={values}
        name="authors"
        label="* Authors"
      />
      {withCollaborationField && (
        <Field
          name="collaboration"
          label="Collaboration"
          component={TextField}
        />
      )}
      <Field
        label="Experiment"
        name="experiment"
        recordFieldPath="experiment_record"
        placeholder="Experiment, type for suggestions"
        pidType="experiments"
        suggesterName="experiment"
        searchAsYouType
        extractItemCompletionValue={
          BasicInfoFields.getSuggestionSourceLegacyName
        }
        component={SuggesterField}
      />
      <Field
        name="abstract"
        label="Abstract"
        rows={4}
        component={TextAreaField}
      />
      <ArrayOf
        values={values}
        name="report_numbers"
        label="Report Numbers"
        emptyItem=""
        renderItem={(itemName: $TSFixMe) => <Field onlyChild name={itemName} component={TextField} />}
      />
      <Field
        name="doi"
        label="DOI"
        placeholder="e.g. 10.1086/305772 or doi:10.1086/305772"
        component={TextField}
      />
    </>;
  }
}

export default BasicInfoFields;
