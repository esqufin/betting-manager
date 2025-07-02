import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Bets from "./pages/Bets";
import Transactions from "./pages/Transactions";
import Channels from "./pages/Channels";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/bets" element={<Bets />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Bets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
