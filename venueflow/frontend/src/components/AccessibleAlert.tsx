import React from 'react';

interface AccessibleAlertProps {
  message: string;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({ message }) => {
  return (
    <div 
      role="alert" 
      aria-live="assertive" 
      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 rounded shadow-sm"
    >
      <p className="font-bold">Important Update</p>
      <p>{message}</p>
    </div>
  );
};

export default AccessibleAlert;
