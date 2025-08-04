import { Sparkles, Award, Users } from "lucide-react";

export default function SustainabilitySection() {
  const features = [
    {
      icon: Sparkles,
      title: "Miramar Technology",
      description: "Revolutionary printing technique that transforms any material"
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Built to last with premium materials and construction"
    },
    {
      icon: Users,
      title: "Expert Styling",
      description: "Personal stylists create customized looks for you"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold text-primary mb-6">Innovation by Design</h3>
            <p className="text-lg text-neutral mb-8 leading-relaxed">
              Every rag & bone piece is crafted with innovative techniques and premium materials,
              featuring our revolutionary Miramar technology and commitment to quality that
              defines modern urban fashion.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{feature.title}</h4>
                      <p className="text-neutral">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-6 bg-accent/10 rounded-lg border-l-4 border-accent">
              <h5 className="font-semibold text-primary mb-2">Our Promise</h5>
              <p className="text-neutral text-sm">
                We're committed to creating modern fashion that defines urban style while
                maintaining the highest standards of quality and craftsmanship. Every piece tells
                a story of innovation and contemporary design.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Modern fashion design process"
              className="rounded-xl shadow-lg w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">75+</div>
                <div className="text-xs text-neutral uppercase tracking-wide">
                  Countries Worldwide
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
