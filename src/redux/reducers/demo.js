import {
  DEMO_DATA
} from '../actionTypes';

const initialState = {
  //定义demo数据
  demoData: {},
}
export default function testReducer(state = initialState, action) {
  switch (action.type) {
    case DEMO_DATA:
      return { ...state, demoData: action.data }
    default:
      return state;
  }
}
