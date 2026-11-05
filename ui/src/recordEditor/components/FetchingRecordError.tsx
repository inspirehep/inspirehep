import { Result } from 'antd';

interface FetchingRecordErrorProps {
  controlNumber: string;
  errorStatus: number;
}

function FetchingRecordError({
  controlNumber,
  errorStatus,
}: FetchingRecordErrorProps) {
  if (errorStatus === 401) {
    return (
      <Result
        status="error"
        title={`Fetching record ${controlNumber} failed`}
        subTitle="You need to first login to InspireHep to edit the record, once you are logged in you can refresh the page."
      />
    );
  }
  return (
    <Result
      status="error"
      title={`Fetching record ${controlNumber} failed`}
      subTitle="Something went wrong while trying to fetch the record, check the url or try again later."
    />
  );
}

export default FetchingRecordError;
