// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import React from "react";
import { persistor, store } from "./reduxStore/store.ts";
import { PersistGate } from "redux-persist/lib/integration/react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <StrictMode> */}
      <ThemeProvider>
        <AppWrapper>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </AppWrapper>
      </ThemeProvider>
      {/* </StrictMode> */}
    </Provider>
  </React.StrictMode>,
);

