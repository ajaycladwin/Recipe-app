import { Routes, Route } from "react-router-dom";
import Recepieapp from "./components/Recepieapp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Recepieapp />} />
    </Routes>
  );
}

export default App;
  