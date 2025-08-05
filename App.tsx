import React, { useEffect } from 'react';
import Routes from './app/routes';
import { Provider } from 'react-redux';
import store from './app/services/redux'
import { Helper } from './app/services/helper';

function App(){

  return(
    <Provider store={store}>
      <Routes/>
    </Provider>
  )

}

export default App;