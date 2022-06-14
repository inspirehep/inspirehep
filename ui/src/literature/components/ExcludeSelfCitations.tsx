import React, { useEffect } from 'react';
import { Checkbox } from 'antd';

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

type Props = {
    onChange: $TSFixMeFunction;
    excluded?: boolean;
    preference: boolean;
    onPreferenceChange?: $TSFixMeFunction;
};

function ExcludeSelfCitations({ onChange, excluded, preference, onPreferenceChange, }: Props) {
  useEffect(
    () => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
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

export default ExcludeSelfCitations;
