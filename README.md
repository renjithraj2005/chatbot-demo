# DL1961 DenimBot - AI-Powered E-commerce Application

A modern full-stack e-commerce application for DL1961, featuring an AI-powered shopping assistant, product catalog management, and comprehensive shopping experience.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- OpenAI API key

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd DenimBot
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5000
   - The app runs on a single port with Express serving both API and static files

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push database schema changes

# Type Checking
npm run check        # Run TypeScript type checking
```

## 🏗️ Project Structure

```
DenimBot/
├── client/                 # Frontend React application
│   ├── src/               # React components and pages
│   └── index.html         # Main HTML template
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data storage layer
│   └── services/         # Business logic services
│       └── openai.ts     # AI chatbot service
├── shared/               # Shared types and schemas
│   └── schema.ts        # Zod validation schemas
├── .env                 # Environment variables
├── .replit             # Replit configuration
└── package.json        # Dependencies and scripts
```

## 🤖 AI Features

### Chatbot Capabilities
- **Product Recommendations**: AI-powered suggestions based on user preferences
- **Order Assistance**: Help with order tracking and status
- **Size Guide**: Intelligent sizing recommendations
- **Brand Knowledge**: Deep understanding of DL1961 products and sustainability
- **Conversation Memory**: Maintains context throughout the session

### OpenAI Integration
- Uses GPT-4o model for advanced natural language processing
- Custom system prompts for brand-specific responses
- JSON-structured responses for consistent UI integration
- Sentiment analysis for customer service insights

## 🛍️ E-commerce Features

### Product Catalog
- Browse by category (Jeans, Jackets, Casual Wear)
- Filter by gender (Men, Women, Kids)
- Detailed product information with authentic DL1961 data
- Real pricing and product descriptions

### Shopping Cart
- Add/remove items with size and color selection
- Session-based cart persistence
- Cash on Delivery (COD) payment option
- Comprehensive checkout flow

### Order Management
- Order creation and tracking
- Email-based order lookup
- Order history and status updates

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for chatbot | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No* |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

*Uses in-memory storage for development

### Replit Deployment

This project is optimized for Replit deployment:

1. **Fork the Repl** or import from GitHub
2. **Set Environment Variables** in Replit Secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. **Run the Project**: Click the "Run" button

The `.replit` file configures:
- Node.js 20 runtime
- PostgreSQL 16 (for production)
- Auto-deployment settings
- Port configuration (5000 → 80)

## 🎨 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **OpenAI API** for AI features
- **Express Session** for session management
- **Zod** for validation

### Development Tools
- **TypeScript** for type safety
- **ESBuild** for fast bundling
- **tsx** for TypeScript execution
- **Drizzle Kit** for database migrations

## 🚀 Deployment

### Development
```bash
npm run dev
```
Starts the development server with hot reload on port 5000.

### Production
```bash
npm run build  # Build frontend and backend
npm run start  # Start production server
```

### Replit
The project includes Replit-specific configurations:
- Automatic dependency installation
- Environment variable management
- One-click deployment
- Built-in PostgreSQL support

## 🔒 Security

- Environment variables for sensitive data
- Session-based authentication
- Input validation with Zod schemas
- CORS configuration for API security
- Secure session management

## 📝 API Documentation

### Main Endpoints
- `GET /api/products` - Get product catalog
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart contents
- `POST /api/chat` - Send message to AI chatbot
- `POST /api/orders` - Create new order

### Chatbot API
```typescript
POST /api/chat
{
  "message": "I'm looking for skinny jeans",
  "sessionId": "uuid"
}
```

Response:
```typescript
{
  "message": "I'd be happy to help you find the perfect skinny jeans!",
  "actionType": "product_search",
  "recommendations": [
    {
      "productId": "uuid",
      "reason": "Perfect fit for skinny style",
      "confidence": 0.9
    }
  ],
  "quickActions": ["View Size Guide", "See All Jeans"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include environment details and error messages

---

**Built with ❤️ for sustainable fashion and AI-powered shopping experiences**
