import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { X, Check, Heart, ShoppingBag } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product || !selectedSize || !selectedColor) {
        throw new Error("Please select size and color");
      }
      
      const response = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart!",
        description: `${product?.name} has been added to your cart.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedColor) {
      toast({
        title: "Color required", 
        description: "Please select a color before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const colorMap: Record<string, string> = {
    "Dark Wash": "bg-blue-900",
    "Medium Wash": "bg-blue-600", 
    "Light Wash": "bg-blue-300",
    "Indigo": "bg-indigo-600",
    "Dark Blue": "bg-blue-800",
    "Black": "bg-black",
    "Classic Blue": "bg-blue-700",
    "White": "bg-white border-2 border-gray-300",
    "Navy": "bg-navy-900"
  };

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg object-cover aspect-[3/4]"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/400x600/6366f1/ffffff?text=${encodeURIComponent(product.name.split(' ')[0] || 'Product')}`;
              }}
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-primary mb-2">${product.price}</p>
              <p className="text-neutral leading-relaxed">{product.description}</p>
            </div>
            
            {/* Size Selection */}
            <div>
              <h4 className="font-semibold mb-3">Size</h4>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`py-2 px-3 ${
                      selectedSize === size 
                        ? 'bg-accent text-white hover:bg-accent/90' 
                        : 'hover:border-accent hover:text-accent'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Color Options */}
            <div>
              <h4 className="font-semibold mb-3">Color</h4>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <div key={color} className="text-center">
                    <button
                      className={`w-10 h-10 rounded-full ${colorMap[color] || 'bg-gray-400'} ${
                        selectedColor === color 
                          ? 'ring-2 ring-accent ring-offset-2' 
                          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                      } transition-all`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check className="h-5 w-5 text-white mx-auto" />
                      )}
                    </button>
                    <p className="text-xs mt-1 text-neutral">{color}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to Cart...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-3 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Heart className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </div>
            
            {/* Product Features */}
            <div className="pt-6 border-t border-border">
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-neutral">
                    <Check className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Product Info */}
            <div className="space-y-2 text-sm text-neutral">
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  {product.category}
                </Badge>
                <Badge variant="outline">
                  {product.gender}
                </Badge>
              </div>
              <p>Free shipping on orders over $150</p>
              <p>Easy returns within 30 days</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
