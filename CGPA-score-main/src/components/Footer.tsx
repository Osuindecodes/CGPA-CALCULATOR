
import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        <p>CGPA Tracker &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Easily track and calculate your academic performance</p>
      </div>
    </footer>
  );
};

export default Footer;
