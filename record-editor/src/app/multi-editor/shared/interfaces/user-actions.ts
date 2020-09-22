import { Action } from './action';
import { Condition } from './condition';

export interface UserActions {
  actions: Action[];
  conditions: Condition[];
}
