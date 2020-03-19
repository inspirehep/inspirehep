import PropTypes from 'prop-types';
import { addCommasToNumber } from '../utils';

function FormattedNumber({ children }) {
  return addCommasToNumber(children);
}

FormattedNumber.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default FormattedNumber;
