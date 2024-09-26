import React, { useCallback, useState } from 'react';
import { Radio, Button } from 'antd';

import SpiresExamples from './SpiresExamples';
import FreetextExamples from './FreetextExamples';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import { PAPER_SEARCH_URL } from '../../common/constants';

const SPIRES_RADIO = 'spires';
export const FREETEXT_RADIO = 'freetext';

function HowToSearch() {
  const [selectedRadio, setSelectedRadio] = useState(SPIRES_RADIO);
  const onRadioChange = useCallback(event => {
    setSelectedRadio(event.target.value);
  }, []);

  return (
    <div>
      <div className="mb3 tc">
        <Radio.Group value={selectedRadio} onChange={onRadioChange}>
          <Radio.Button value={SPIRES_RADIO}>SPIRES</Radio.Button>
          <Radio.Button value={FREETEXT_RADIO}>free text</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        {selectedRadio === SPIRES_RADIO ? (
          <SpiresExamples />
        ) : (
          <FreetextExamples />
        )}
      </div>
      <div className="tc">
        <LinkWithTargetBlank
          as={Button}
          href={PAPER_SEARCH_URL}
          type="primary"
          className="mt3"
        >
          Learn more
        </LinkWithTargetBlank>
      </div>
    </div>
  );
}

export default HowToSearch;
