import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import '@fontsource-variable/source-code-pro';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Home from './pages/Home/Home'
import Supported_Commands from './pages/Supported_Commands/Supported_Commands';
import ErrorCodes from './pages/Error_Codes/Error_Codes';

const App = function() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/supported_commands' element={<Supported_Commands />} />
        <Route path='/error_codes' element={<ErrorCodes />} />
      </Routes>
    </Router>
  )
}

const view = App('pywebview')

const element = document.getElementById('app')
ReactDOM.render(view, element)