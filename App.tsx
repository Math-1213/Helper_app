import React from "react";
import Router from "./src/system/navigation/Router";
import { Provider } from 'react-redux';
import store from './src/core/redux/Store';

export default function App() {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  )
}
