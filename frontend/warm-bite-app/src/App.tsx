import { Routes, Route } from "react-router-dom";

// Import your page components
import Index from "./pages"; // Note: I assume 'Index' is your Menu page
import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    {/* Home page route */}
    <Route path="/" element={<Index />} />
    
    {/* Menu routes with and without QR code parameter */}
    <Route path="/menu/:qr" element={<Index />} />
    
    {/* Catch-all route for 404 pages */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;