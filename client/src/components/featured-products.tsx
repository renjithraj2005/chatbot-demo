import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Product } from "@shared/schema";

interface FeaturedProductsProps {
  onProductSelect: (product: Product) => void;
}

export default function FeaturedProducts({ onProductSelect }: FeaturedProductsProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <section id="featured-products" className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Featured Collections</h3>
            <p className="text-neutral text-lg">Discover our most popular sustainable denim pieces</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 animate-pulse">
                  <div className="w-full h-96 bg-gray-300"></div>
                </div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-16 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-primary mb-4">Featured Collections</h3>
          <p className="text-neutral text-lg">Discover our most popular sustainable denim pieces</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product: Product) => (
            <Card 
              key={product.id} 
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => onProductSelect(product)}
            >
              <div className="aspect-w-3 aspect-h-4 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-neutral mb-3 text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-lg">${product.price}</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < Math.floor(parseFloat(product.rating || "0")) 
                              ? 'fill-current' 
                              : ''
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-neutral text-sm ml-2">
                      ({product.reviewCount})
                    </span>
                  </div>
                </div>
                
                {/* Quick add to cart button */}
                <Button 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductSelect(product);
                  }}
                >
                  Quick View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {featuredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral text-lg">No products available at the moment.</p>
            <p className="text-muted-foreground">Please check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
}
