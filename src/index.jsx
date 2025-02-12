import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import '@fontsource-variable/source-code-pro';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Home from './pages/Home/Home'
import Header from './components/Header/Header'
import Editor from './components/Editor/Editor'
import Ticker from './components/Ticker/Ticker'
import Supported_Commands from './pages/Supported_Commands/Supported_Commands';
import Command from './pages/Supported_Commands/Command';

const App = function() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/supported_commands' element={<Supported_Commands />} />
      </Routes>
    </Router>
  )
}

const view = App('pywebview')

const element = document.getElementById('app')
ReactDOM.render(view, element)