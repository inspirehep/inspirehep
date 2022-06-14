import React, { Component } from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { languageOptions } from '../schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';
import TextAreaField from '../../common/components/TextAreaField';
import SuggesterField from '../../common/components/SuggesterField';
import LiteratureAuthorsField from './LiteratureAuthorsField';
import { inspireCategoryOptions } from '../../common/schemas/constants';

class BasicInfoFields extends Component {
  static getSuggestionSourceLegacyName(suggestion: any) {
    return suggestion._source.legacy_name;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'withCollaborationField' does not exist o... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
        values={values}
        name="report_numbers"
        label="Report Numbers"
        emptyItem=""
        renderItem={(itemName: any) => <Field onlyChild name={itemName} component={TextField} />}
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
BasicInfoFields.propTypes = {
  withCollaborationField: PropTypes.bool,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
BasicInfoFields.defaultProps = {
  withCollaborationField: false,
};

export default BasicInfoFields;
