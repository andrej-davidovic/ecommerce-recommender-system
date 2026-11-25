import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import App from "./App";
import theme from "./theme";
import { queryClient } from "./lib/queryClient";
import GlobalSnackbar from "./components/common/GlobalSnackbar";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey?.startsWith("pk_") ? loadStripe(stripeKey) : null;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Elements stripe={stripePromise}>
          <BrowserRouter>
            <App />
            <GlobalSnackbar />
          </BrowserRouter>
        </Elements>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
