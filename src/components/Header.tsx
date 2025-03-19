
import React, { useState, useEffect } from 'react';
import { Menu, ChefHat, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

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
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search recipes..."
              className="w-64 pl-10 pr-4 py-2 rounded-full border-primary/20 focus:border-primary transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
          
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
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="text"
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
          
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
