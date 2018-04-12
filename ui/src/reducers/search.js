import * as types from '../actions/actionTypes';

const initialState = {
  searching: false,
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SEARCHING:
      return {
        ...state,
        searching: true,
      };
    default:
      return state;
  }
};

export default searchReducer;
