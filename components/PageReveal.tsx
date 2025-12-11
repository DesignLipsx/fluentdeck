import React from "react";

const PageReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="animate-fadeInSoft will-change-transform">
      {children}
    </div>
  );
};

export default PageReveal;
