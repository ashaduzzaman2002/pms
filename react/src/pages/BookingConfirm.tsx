import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { mockProperties } from "@/data/mockData";
import { ArrowLeft, Calendar, Users, CreditCard, Shield, CheckCircle } from "lucide-react";

export default function BookingConfirm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const property = mockProperties.find(p => p.id === id);
  
  const checkIn = searchParams.get("checkin") || "";
  const checkOut = searchParams.get("checkout") || "";
  const guests = parseInt(searchParams.get("guests") || "2");

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button asChild>
            <Link to="/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const calculateStay = () => {
    if (!checkIn || !checkOut) return { nights: 0, total: 0 };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = nights * property.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.05);
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + serviceFee + taxes;
    
    return { nights, subtotal, serviceFee, taxes, total };
  };

  const { nights, subtotal, serviceFee, taxes, total } = calculateStay();

  const handlePayment = async () => {
    setIsProcessing(true);
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsConfirmed(true);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your reservation has been successfully processed.
              </p>
            </div>
            
            <div className="space-y-3 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono">BK-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span>{checkIn} to {checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-bold text-green-600">${total}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/user/bookings">View My Bookings</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/properties">Book Another Property</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to={`/property/${id}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Property
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Confirm and Pay</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dates</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-sm text-muted-foreground">{guests} guest{guests > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="apple">Apple Pay</SelectItem>
                    </SelectContent>
                  </Select>

                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry">MM/YY</Label>
                          <Input
                            id="expiry"
                            placeholder="12/25"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                      <Badge variant="secondary" className="mt-1">{property.type}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>${property.pricePerNight} × {nights} nights</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>${taxes}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total (USD)</span>
                      <span>${total}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-primary hover:bg-primary-hover"
                  >
                    {isProcessing ? "Processing..." : `Pay $${total}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By selecting the button above, I agree to the Host's House Rules, 
                    Ground rules for guests, and the Terms of Service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}