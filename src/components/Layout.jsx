import React from 'react';

export function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}