
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-4 px-4 border-b">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <h1 className="text-xl font-bold">SaaSInsight</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm hover:text-primary transition-colors">How It Works</a>
          <a href="#" className="text-sm hover:text-primary transition-colors">About</a>
          <a href="#" className="text-sm hover:text-primary transition-colors">Pricing</a>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
