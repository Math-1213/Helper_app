import { addHours } from 'date-fns';
import { ToastAndroid } from 'react-native';
import store from '../redux';

export const Helper = {};

Helper.getLocalDateTime = () =>{
  let d = new Date();
  d = addHours(d, -(d.getTimezoneOffset()/60));

  return d;
}
