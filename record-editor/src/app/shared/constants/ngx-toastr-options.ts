import { IndividualConfig } from 'ngx-toastr';

export const DISMISSIBLE_INDEFINITE_TOAST: Partial<IndividualConfig> = {
  timeOut: 0,
  extendedTimeOut: 0,
  closeButton: true,
  onActivateTick: true
};

export const HOVER_TO_DISMISS_INDEFINITE_TOAST: Partial<IndividualConfig> = {
  timeOut: 0,
  onActivateTick: true
};
