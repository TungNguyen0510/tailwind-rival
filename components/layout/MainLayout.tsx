import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />
        <div className="w-full flex flex-col min-h-[calc(100vh-48px-40px)]">
          {children}
        </div>
        <Footer />
      </div>
    </main>
  );
};

export default MainLayout;
