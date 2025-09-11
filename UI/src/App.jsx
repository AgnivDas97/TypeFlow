import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import AuthForm from "./Components/AuthForm";
import PreviousTestResultDataList from "./Components/PreviousTestResultDataList";

export default function App() {
   const [user, setUser] = useState(null);


  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (<>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/previous-tests" element={<PreviousTestResultDataList/>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  </>
  );
}



