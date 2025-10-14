import React from 'react';
import Navbar from '../layouts/Navbar';
import Content from '../layouts/Content';
import Footer from '../layouts/Footer';


const HomePage: React.FC = () => {
  return (
    <div className="leading-normal tracking-normal text-white gradient" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      <Navbar />
      <Content />
      <Footer />
    </div>
  );
};

export default HomePage;
