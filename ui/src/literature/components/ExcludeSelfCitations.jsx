import React, { useEffect } from 'react';
import { Checkbox } from 'antd';
import PropTypes from 'prop-types';

import LabelWithHelp from '../../common/components/LabelWithHelp';

const EXCLUDE_SELF_CITATIONS_HELP = (
  <p>
    Self-citations are citations from the same collaboration or any of the
    authors of the paper being cited.{' '}
    <a href="https://inspirehep.net/help/knowledge-base/citation-metrics/">
      Learn More
    </a>
  </p>
);

function ExcludeSelfCitations({
  onChange,
  excluded,
  preference,
  onPreferenceChange,
}) {
  useEffect(
    () => {
      onPreferenceChange(preference);
    },
    [onPreferenceChange, preference]
  );
  return (
    <Checkbox
      onChange={event => onChange(event.target.checked)}
      checked={excluded}
    >
      <LabelWithHelp
        label="Exclude self-citations"
        help={EXCLUDE_SELF_CITATIONS_HELP}
      />
    </Checkbox>
  );
}

ExcludeSelfCitations.propTypes = {
  onChange: PropTypes.func.isRequired,
  excluded: PropTypes.bool,
  preference: PropTypes.bool.isRequired,
  onPreferenceChange: PropTypes.bool,
};

export default ExcludeSelfCitations;
