import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Banknote, MapPin, User, Phone, Mail } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: string;
  itemCount: number;
}

export default function CheckoutModal({ isOpen, onClose, cartTotal, itemCount }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingForm, setShippingForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {
        paymentMethod,
        shippingAddress: shippingForm
      });
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id.slice(0, 8)} has been created. ${paymentMethod === 'cod' ? 'Pay when your order arrives!' : ''}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const required = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !shippingForm[field as keyof typeof shippingForm]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    orderMutation.mutate();
  };

  const codFee = paymentMethod === "cod" ? 2.99 : 0;
  const finalTotal = (parseFloat(cartTotal) + codFee).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
          <p className="text-neutral">Complete your order for {itemCount} items</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Method
            </h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-secondary transition-colors">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Banknote className="h-5 w-5 mr-2 text-accent" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-neutral">Pay when your order arrives</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                <RadioGroupItem value="card" id="card" disabled />
                <Label htmlFor="card" className="flex-1 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-neutral" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-neutral">Coming soon</p>
                      </div>
                    </div>
                    <Badge variant="outline">Soon</Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {paymentMethod === "cod" && (
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                <h4 className="font-medium text-accent mb-2">Cash on Delivery Details</h4>
                <ul className="text-sm text-neutral space-y-1">
                  <li>• Pay in cash when your order is delivered</li>
                  <li>• Small convenience fee of $2.99 applies</li>
                  <li>• Have exact change ready for smooth delivery</li>
                  <li>• Delivery person will provide receipt</li>
                </ul>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Shipping Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={shippingForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={shippingForm.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={shippingForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="New York"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={shippingForm.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="NY"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={shippingForm.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="10001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={shippingForm.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="USA"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({itemCount} items)</span>
                <span>${cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-sm">
                  <span>COD Fee</span>
                  <span>${codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={orderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - $${finalTotal}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}