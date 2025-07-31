import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star, 
  ArrowLeft,
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Admin() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const recentConversations = conversations?.slice(0, 5) || [];

  const topFAQs = [
    { question: "What's your return policy?", category: "Returns & Exchanges", count: 89 },
    { question: "How do I find my size?", category: "Sizing", count: 76 },
    { question: "Are your jeans sustainable?", category: "Sustainability", count: 63 },
    { question: "How long does shipping take?", category: "Shipping", count: 54 },
    { question: "Do you offer alterations?", category: "Services", count: 41 }
  ];

  if (analyticsLoading || conversationsLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-neutral">Monitor chatbot performance and customer interactions</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral text-sm font-medium">Total Conversations</p>
                  <p className="text-2xl font-bold text-primary">
                    {analytics?.totalConversations || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-success text-sm mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral text-sm font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {analytics?.conversionRate || 0}%
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-success text-sm mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.2% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral text-sm font-medium">Avg Response Time</p>
                  <p className="text-2xl font-bold text-primary">
                    {analytics?.avgResponseTime || 0}s
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-success text-sm mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                0.3s faster
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral text-sm font-medium">Customer Satisfaction</p>
                  <p className="text-2xl font-bold text-primary">
                    {analytics?.customerSatisfaction || 0}%
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-success text-sm mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.2% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversations and Top FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-neutral mx-auto mb-4" />
                    <p className="text-neutral">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Customer conversations will appear here
                    </p>
                  </div>
                ) : (
                  recentConversations.map((conversation: any) => (
                    <div 
                      key={conversation.id} 
                      className="flex items-start space-x-3 p-3 hover:bg-secondary rounded transition-colors"
                    >
                      <div className="w-8 h-8 bg-neutral/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-neutral" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">
                            {conversation.customerName || "Anonymous Customer"}
                          </p>
                          <span className="text-xs text-neutral">
                            {new Date(conversation.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral mt-1">
                          {conversation.messages?.length > 0 
                            ? conversation.messages[0].content.slice(0, 60) + "..."
                            : "New conversation"
                          }
                        </p>
                        <div className="flex items-center mt-2">
                          {conversation.status === "resolved" ? (
                            <span className="bg-success text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </span>
                          ) : (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Most Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topFAQs.map((faq, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 hover:bg-secondary rounded transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{faq.question}</p>
                      <p className="text-xs text-neutral">{faq.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{faq.count}</p>
                      <p className="text-xs text-neutral">asks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
