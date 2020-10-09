import { addCommasToNumber } from '../utils';

interface FormattedNumberProps {
  children: string | number;
}

function FormattedNumber({ children }: FormattedNumberProps) {
  return addCommasToNumber(children);
}

export default FormattedNumber;
