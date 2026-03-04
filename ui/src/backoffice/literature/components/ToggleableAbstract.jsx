import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import Abstract from '../../../literature/components/Abstract';

const { Paragraph } = Typography;

const ToggleableAbstract = ({ abstract }) => {
  const [showAbstract, setShowAbstract] = useState(false);

  if (!abstract) {
    return null;
  }

  const handleToggleAbstract = (event) => {
    event.preventDefault();
    setShowAbstract((prev) => !prev);
  };

  return (
    <>
      <Button type="link" onClick={handleToggleAbstract} style={{ padding: 0 }}>
        {showAbstract ? 'Hide abstract' : 'Show abstract'}
      </Button>
      {showAbstract && (
        <Paragraph style={{ marginTop: 4 }}>
          <Abstract abstract={abstract} />
        </Paragraph>
      )}
    </>
  );
};

export default ToggleableAbstract;
