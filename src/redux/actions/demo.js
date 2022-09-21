import {
  DEMO_DATA
} from '../actionTypes';

//定义一个函数，让他返回一个action函数
const getAction = (data, type) => {
  return {
    type,
    data
  }
}

//改变demo数据方法
export const setDemoDataFun = (data) => getAction(data, DEMO_DATA)
