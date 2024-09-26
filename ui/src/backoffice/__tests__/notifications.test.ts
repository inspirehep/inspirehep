import { notification } from 'antd';

import {
  notifyLoginError,
  notifyActionSuccess,
  notifyActionError,
} from '../notifications';

describe('Notification Functions', () => {
  let errorSpy: jest.SpyInstance;
  let successSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(notification, 'error').mockImplementation(jest.fn());
    successSpy = jest
      .spyOn(notification, 'success')
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('notifyLoginError should trigger notification.error with the correct arguments', () => {
    const errorMessage = 'Invalid username or password';

    notifyLoginError(errorMessage);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith({
      message: 'Login unsuccessful',
      description: errorMessage,
      duration: 7,
    });
  });

  test('notifyActionSuccess should trigger notification.success with the correct arguments', () => {
    const action = 'delete';

    notifyActionSuccess(action);

    expect(successSpy).toHaveBeenCalledTimes(1);
    expect(successSpy).toHaveBeenCalledWith({
      message: 'Success',
      description: 'Delete performed successfully',
      duration: 10,
    });
  });

  test('notifyActionError should trigger notification.error with the correct arguments', () => {
    const errorMessage = 'Network error';

    notifyActionError(errorMessage);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith({
      message: 'Unable to perform action',
      description: errorMessage,
      duration: 10,
    });
  });
});
