import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";


const stripePromise = loadStripe("pk_test_51RSsuTH4navrl4Ps2zYUpo0thsMvStogeeJgBdnI1LcZZfGHp4OOIN4qUuBD6mb2KWnajmgKgqHd8Q1PeP87X6oq00tYb03ZqZ");

createRoot(document.getElementById('root')).render(

  
   <Elements  stripe={stripePromise}>
  <BrowserRouter>
   <App />
  </BrowserRouter> 
    </Elements>
);

