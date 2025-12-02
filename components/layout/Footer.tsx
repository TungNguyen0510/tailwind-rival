function Footer() {
  return (
    <footer className="h-10 w-full flex items-center justify-end border-t text-xs p-4 md:px-10 bg-background antialiased">
      <p>© {new Date().getFullYear()} Tailwind Rival</p>
    </footer>
  );
}

export default Footer;
