# rag & bone E-commerce Application

## Overview

This is a modern full-stack e-commerce application for rag & bone, a premium contemporary fashion brand. The application features an AI-powered shopping assistant, product catalog management, shopping cart functionality, and an admin dashboard. Built with React, TypeScript, Express.js, and Drizzle ORM with PostgreSQL database support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Component System**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Custom session handling with UUID-based session IDs
- **API Design**: RESTful API with JSON responses
- **External Services**: OpenAI integration for AI-powered chatbot

### Build System
- **Development**: Vite dev server with HMR (Hot Module Replacement)
- **Production**: Vite build for frontend, esbuild for backend bundling
- **Type Checking**: TypeScript with strict mode enabled

## Key Components

### E-commerce Features
- **Product Catalog**: Browse products by category, gender, and other filters
- **Shopping Cart**: Add, update, and remove items with size/color selection
- **Product Details**: Modal-based product viewing with specifications
- **Order Management**: Order creation and tracking

### AI Shopping Assistant
- **Chatbot Interface**: Real-time conversation with OpenAI-powered assistant
- **Product Recommendations**: AI-driven product suggestions based on user queries
- **Context Awareness**: Maintains conversation history and session context
- **Quick Actions**: Predefined responses for common queries

### Admin Dashboard
- **Analytics Overview**: Dashboard with key metrics and conversation insights
- **Conversation Management**: View and analyze customer interactions
- **Performance Metrics**: Track chatbot effectiveness and user engagement

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using TanStack Query for caching and state management
2. Express.js server handles routing and business logic
3. Drizzle ORM provides type-safe database operations
4. Session management maintains user context across requests

### Database Schema
- **Products**: Store product information including pricing, categories, and specifications
- **Cart Items**: Track user shopping cart contents with session-based storage
- **Conversations**: Store chatbot interactions for analytics and improvement
- **Orders**: Manage order processing and fulfillment
- **Analytics**: Track application performance and user behavior

### AI Integration
- OpenAI GPT-4o model processes user queries and generates responses
- Custom system prompts provide brand-specific context and personality
- Conversation history maintained for context-aware responses

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL database connection
- **openai**: AI chatbot integration
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **esbuild**: Backend bundling
- **drizzle-kit**: Database migrations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- File watching and auto-restart capabilities

### Production Build
1. Frontend: Vite builds optimized static assets
2. Backend: esbuild bundles server code for Node.js
3. Database: Drizzle migrations handle schema updates
4. Environment: Supports Replit deployment with specific configurations

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- OpenAI API key for chatbot functionality
- Session management with secure random UUID generation
- Replit-specific optimizations and integrations

The application is designed to be easily deployable on Replit while maintaining flexibility for other hosting platforms. The modular architecture allows for easy scaling and feature additions.

## Recent Updates (January 31, 2025)

### Product Catalog Enhancement
- Updated products with authentic DL1961 data from official website
- Added real product names: Florence Skinny, Russell Slim Straight, Brady Slim, Emma Low Rise, Nick Slim, Hawke Skinny
- Updated pricing to match current market rates ($179-$248 for adults, $59-$69 for kids)
- Enhanced product descriptions with DL1961 technologies (Instasculpt™, DL Ultimate™)
- Added sustainability features and authentic sizing information

### Cash on Delivery (COD) Implementation
- Added COD payment method as primary checkout option
- Implemented comprehensive checkout modal with shipping form
- Added COD convenience fee ($2.99) and clear payment instructions
- Enhanced order schema to support payment method tracking
- Created user-friendly checkout flow with validation

### AI Chatbot Integration
- Configured OpenAI GPT-4o integration with brand-specific prompts
- Implemented conversation history and product recommendation system
- Added real-time chat interface with quick actions
- Enhanced chatbot with DL1961 brand knowledge and sustainability focus
- Integrated cart recovery and order assistance capabilities

### User Interface Improvements
- Enhanced shopping cart with COD payment indication
- Added professional checkout modal with comprehensive form validation
- Improved product displays with authentic DL1961 imagery placeholders
- Enhanced mobile responsiveness and user experience

### Technical Architecture
- Maintained in-memory storage for development efficiency
- Implemented proper error handling and loading states
- Added comprehensive product and order management
- Enhanced session management for cart and conversation tracking