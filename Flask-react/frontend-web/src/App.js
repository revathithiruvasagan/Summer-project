// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { AuthProvider } from "./context/authContext";
import AppRoutes from "./routes/Approutes";
import GameRoutes from "./routes/gameroutes";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <GameRoutes />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
