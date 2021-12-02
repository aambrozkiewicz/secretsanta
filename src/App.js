import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import gift from "./gift.svg";
import Santas from "./routes/Santas";
import ThankYouPage from "./routes/ThankYouPage";
import Wishlist from "./routes/Wishlist";

function App() {
  return (
    <Router>
      <div className="container">
        <div className="App">
          <header className="App-header">
            <img src={gift} width="120" alt="Secret santa" />
            <div>
              <div>Ho ho ho, losowanie Św Mikołaja 👋</div>
              <small>Tak, to już niedługo</small>
            </div>
          </header>

          <Routes>
            <Route path="/" exact element={<Santas />} />
            <Route path="/thankyou" exact element={<ThankYouPage />} />
            <Route path="/wishlist/:hash" element={<Wishlist />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
