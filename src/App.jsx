/// <reference types="chrome"/>
import { useEffect, useState } from "react";
import "./App.css"
import { Text } from "@chakra-ui/react";
import MainApp from "./MainApp";


function App() {
  const [rerender, setRerender] = useState(false);

  const startRerender = () => {
    setRerender(!rerender);
  }

  return (
    <div className="App">
      <MainApp rerender={startRerender} />
    </div>
  );
}

export default App;
