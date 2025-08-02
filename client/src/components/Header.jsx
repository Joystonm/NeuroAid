import React from 'react';
import './Header.css';

const Header = ({ title, subtitle }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;
