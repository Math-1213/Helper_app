import { combineReducers } from 'redux';
import { language } from './modules/language/reducer.js';

const Reducers = combineReducers({
    language
});

export default Reducers;