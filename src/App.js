import React, { useState } from "react";
import RandomJoke from "./RandomJoke";

function App() {
  const [more, setMore] = useState(false);
  return <RandomJoke more={more} loadMore={() => setMore(!more)} />;
}

export default App;
