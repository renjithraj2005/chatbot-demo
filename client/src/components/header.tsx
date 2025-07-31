import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  User, 
  ShoppingBag, 
  Menu,
  MessageSquare
} from "lucide-react";

interface HeaderProps {
  onCartToggle: () => void;
  onChatbotToggle: () => void;
}

export default function Header({ onCartToggle, onChatbotToggle }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
  });

  const navigationItems = [
    { name: "Women", href: "/?category=jeans&gender=women" },
    { name: "Men", href: "/?category=jeans&gender=men" },
    { name: "Kids", href: "/?category=jeans&gender=kids" },
    { name: "Sustainability", href: "/?section=sustainability" },
    { name: "Sale", href: "/?sale=true" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-primary">DL1961</h1>
              <p className="text-xs text-neutral -mt-1">Sustainable Denim</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
              >
                <span className="text-primary hover:text-accent transition-colors font-medium cursor-pointer">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex"
              onClick={onChatbotToggle}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onCartToggle}
            >
              <ShoppingBag className="h-5 w-5" />
              {cart?.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <div>
                      <h2 className="text-xl font-bold text-primary">DL1961</h2>
                      <p className="text-xs text-neutral">Sustainable Denim</p>
                    </div>
                  </Link>
                  
                  <nav className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link 
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-primary hover:text-accent transition-colors font-medium block py-2 cursor-pointer">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </nav>
                  
                  <hr className="border-border" />
                  
                  <div className="flex flex-col space-y-4">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => {
                        onChatbotToggle();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat Assistant
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
