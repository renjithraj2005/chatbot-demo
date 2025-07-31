import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onChatbotToggle: () => void;
}

export default function HeroSection({ onChatbotToggle }: HeroSectionProps) {
  const scrollToProducts = () => {
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Premium Denim.<br />
          <span className="text-accent">Sustainable Future.</span>
        </h2>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
          Experience personalized shopping with our AI assistant and discover 
          the perfect fit for your sustainable lifestyle
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4"
            onClick={scrollToProducts}
          >
            Shop Now
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-4"
            onClick={onChatbotToggle}
          >
            Chat with AI Assistant
          </Button>
        </div>
        
        {/* Sustainability highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-accent mb-2">89%</div>
            <div className="text-sm uppercase tracking-wide">Less Water Used</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <div className="text-sm uppercase tracking-wide">Vertical Integration</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-accent mb-2">60%</div>
            <div className="text-sm uppercase tracking-wide">Reduced Impact</div>
          </div>
        </div>
      </div>
    </section>
  );
}
