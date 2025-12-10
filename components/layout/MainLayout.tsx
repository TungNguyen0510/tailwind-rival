import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppSidebar from "@/components/layout/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />
        <AppSidebar>{children}</AppSidebar>
        <Footer />
      </div>
    </main>
  );
};

export default MainLayout;
