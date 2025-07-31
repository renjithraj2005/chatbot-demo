import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import CheckoutModal from "./checkout-modal";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isOpen
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  });



  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const cartItems = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const total = cart?.total || "0.00";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 flex flex-col">
        <SheetHeader className="bg-primary text-white p-6 -mx-6 -mt-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <SheetTitle className="text-xl font-semibold text-white">Shopping Cart</SheetTitle>
              <p className="text-gray-300 text-sm mt-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral">Loading cart...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-neutral/40 mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Your cart is empty</h3>
            <p className="text-neutral mb-6">Add some items to get started</p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-border">
                  <img 
                    src={item.product?.image} 
                    alt={item.product?.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.product?.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{item.color}</Badge>
                      <Badge variant="outline" className="text-xs">Size {item.size}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm">
                          ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cart Footer */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-semibold"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white py-3 font-semibold"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">💰 Cash on Delivery Available</p>
                  <p className="text-xs text-neutral">Pay when your order arrives at your door</p>
                </div>
                <p className="text-xs text-neutral">
                  Free shipping on orders over $150 • Easy returns within 30 days
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
      
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartTotal={total}
        itemCount={itemCount}
      />
    </Sheet>
  );
}
