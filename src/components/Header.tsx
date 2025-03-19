
import React, { useState, useEffect } from 'react';
import { Menu, ChefHat, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3 shadow-md' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary animate-float" />
          <span className="font-display text-xl sm:text-2xl tracking-tight">RecipeAI</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Home</a>
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Discover</a>
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Support</a>
          </nav>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>

        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass animate-slide-in p-4 shadow-lg">
          <nav className="flex flex-col space-y-4 mb-4">
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Home</a>
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Discover</a>
            <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Support</a>
          </nav>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" className="w-full">Sign In</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
