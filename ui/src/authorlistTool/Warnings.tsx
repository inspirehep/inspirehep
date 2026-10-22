import { Alert } from 'antd';

interface WarningsProps {
  warnings: string[];
}

function Warnings({ warnings }: WarningsProps) {
  const renderDescription = () => (
    <>
      <p>
        There are some problems with the input. Please check the following
        warnings:
      </p>
      <ul>
        {warnings.map((warning, index) => (
          // eslint-disable-next-line react/no-array-index-key -- it's ok since we will never delete/reorder warnings
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </>
  );
  return <Alert type="warning" description={renderDescription()} />;
}

export default Warnings;
