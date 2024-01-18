/// <reference types="chrome"/>
import { useState } from "react";
import "./App.css"

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'tabRemoved':
      console.log(message.tabInfo);
      break;
  }
});

function App() {
  return (
    <div className="App">
      <Text>{"Hello World!"}</Text>
    </div>
  );
}

export default App;
