import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Shop",
      links: [
        { name: "Women's Jeans", href: "/?category=jeans&gender=women" },
        { name: "Men's Jeans", href: "/?category=jeans&gender=men" },
        { name: "Kids' Jeans", href: "/?category=jeans&gender=kids" },
        { name: "Jackets", href: "/?category=jackets" },
        { name: "Sale", href: "/?sale=true" },
      ]
    },
    {
      title: "Help",
      links: [
        { name: "Size Guide", href: "/size-guide" },
        { name: "Returns", href: "/returns" },
        { name: "Shipping", href: "/shipping" },
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
      ]
    },
    {
      title: "About",
      links: [
        { name: "Our Story", href: "/story" },
        { name: "Sustainability", href: "/sustainability" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Admin", href: "/admin" },
      ]
    }
  ];

  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DL1961</h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Premium sustainable denim crafted with care for people and planet. 
              Every jean tells a story of innovation and responsibility.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href}>
                      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">© 2024 DL1961. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy">
              <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                Privacy Policy
              </span>
            </Link>
            <Link href="/terms">
              <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer">
                Terms of Service
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
