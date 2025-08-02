import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary', disabled = false, ...props }) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
