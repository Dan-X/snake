import React from 'react';

import { SnakeBoard } from './components/SnakeBoard';

import './App.css';

function App() {

  return (
    <div className="App">
      <div className='Panel leftPanel'>
          <p>awds or arrow keys to control directions</p> 
          <p>space(or esc) to pause/restart. </p>
          <p>walls update every 30 sec</p>
      </div>
      <div className='Panel'>
        <SnakeBoard  />
      </div>
      
    </div>
  );
}

export default App;
