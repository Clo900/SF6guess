import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B69] to-[#1A0B4D] text-white overflow-hidden flex flex-col">
      {children}
    </div>
  );
};
