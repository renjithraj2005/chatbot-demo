import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturedProducts from "@/components/featured-products";
import SustainabilitySection from "@/components/sustainability-section";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";
import ProductModal from "@/components/product-modal";
import ShoppingCart from "@/components/shopping-cart";
import { useState } from "react";
import { Product } from "@shared/schema";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onChatbotToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
      <HeroSection onChatbotToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
      <FeaturedProducts onProductSelect={setSelectedProduct} />
      <SustainabilitySection />
      <Footer />
      
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)} 
      />
      
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
      
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}
