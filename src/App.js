import './App.css';
import 'swiper/css';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Address from './pages/Address';
import OrderSummary from './pages/OrderSummary';
import Payment from './pages/Payment';
import Details from './pages/Details';
import Cart from './pages/Cart';
import ShippingPolicy from './policies/shipping-policy';
import AffiliateDisclosure from './policies/affiliate-disclosure';
import CancellationPolicy from './policies/cancellation-policy';
import ContactUs from './policies/contact-us';
import PaymentSecurity from './policies/payment-security';
import PrivacyPolicy from './policies/privacy-policy';
import ReturnRefundPolicy from './policies/return-refund-policy';
import TermsConditions from './policies/terms-and-conditions';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product-details" element={<ProductDetails />} />
      <Route path="/address" element={<Address />} />
      <Route path="/order-summary" element={<OrderSummary />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/details" element={<Details />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/policies/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/policies/affiliate-disclosure" element={<AffiliateDisclosure />} />
      <Route path="/policies/cancellation-policy" element={<CancellationPolicy />} />
      <Route path="/policies/contact-us" element={<ContactUs />} />
      <Route path="/policies/payment-security" element={<PaymentSecurity />} />
      <Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/policies/return-refund-policy" element={<ReturnRefundPolicy />} />
      <Route path="/policies/terms-and-conditions" element={<TermsConditions />} />


    </Routes>
  );
}

export default App;



// import { Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import About from './pages/Address';
// import ProductDetails from './pages/ProductDetails';

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//        <Route path="/product-details" element={<ProductDetails />} />
//       <Route path="/address" element={<About />} />
//     </Routes>
//   );
// }

// export default App;