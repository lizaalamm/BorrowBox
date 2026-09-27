import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BorrowBox API',
      version: '1.0.0',
      description: `
# BorrowBox - Community Lending Platform API

**A complete, production-ready API for peer-to-peer item lending.**

### Features:
- 🔐 JWT Authentication & Authorization
- 📦 Item Management (CRUD, Search, Filter, Categories)
- 🤝 Borrow Request Workflow (Request → Approve → Borrowed → Return → Completed)
- ⭐ Reviews & Ratings System
- 🔔 Notifications System
- ❤️ Wishlist / Favorites
- 💬 Messaging System
- 📊 Dashboard Analytics
- 👑 Admin Panel

### Authentication:
Use \`Bearer <token>\` in Authorization header after login.

### Demo Accounts:
- Admin: admin@borrowbox.com / Admin@123
- User: demo@borrowbox.com / Demo@123
      `,
      contact: {
        name: 'BorrowBox Team',
        email: 'support@borrowbox.com',
        url: 'https://borrowbox.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      },
      {
        url: 'https://api.borrowbox.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-v4' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            avatar: { type: 'string', example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            bio: { type: 'string', example: 'Loves sharing tools and books' },
            location: { type: 'string', example: 'San Francisco, CA' },
            rating: { type: 'number', example: 4.8 },
            totalLends: { type: 'integer', example: 24 },
            totalBorrows: { type: 'integer', example: 18 },
            verified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Tools' },
            slug: { type: 'string', example: 'tools' },
            icon: { type: 'string', example: '🔧' },
            color: { type: 'string', example: '#8B5CF6' },
            itemCount: { type: 'integer', example: 45 }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', example: 'DeWalt Cordless Drill' },
            description: { type: 'string', example: 'Powerful 20V drill, barely used. Includes 2 batteries.' },
            category: { type: 'string', example: 'Tools' },
            categoryId: { type: 'string' },
            images: { type: 'array', items: { type: 'string' }, example: ['https://images.unsplash.com/photo-1504148455328-c376907d081c'] },
            owner: { $ref: '#/components/schemas/User' },
            ownerId: { type: 'string' },
            condition: { type: 'string', enum: ['New', 'Like New', 'Good', 'Fair'], example: 'Like New' },
            value: { type: 'number', example: 120 },
            lendingFee: { type: 'number', example: 0, description: '0 = free, >0 = fee per day' },
            availability: { type: 'string', enum: ['available', 'borrowed', 'reserved', 'unavailable'], example: 'available' },
            location: { type: 'string', example: 'Downtown, SF - 0.5 miles away' },
            tags: { type: 'array', items: { type: 'string' }, example: ['power-tools', 'diy'] },
            rating: { type: 'number', example: 4.9 },
            reviewCount: { type: 'integer', example: 12 },
            borrowCount: { type: 'integer', example: 8 },
            featured: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        BorrowRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            item: { $ref: '#/components/schemas/Item' },
            itemId: { type: 'string' },
            borrower: { $ref: '#/components/schemas/User' },
            borrowerId: { type: 'string' },
            ownerId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'completed', 'cancelled', 'overdue'], example: 'pending' },
            startDate: { type: 'string', format: 'date', example: '2024-01-15' },
            endDate: { type: 'string', format: 'date', example: '2024-01-20' },
            message: { type: 'string', example: 'Need it for weekend project' },
            ownerMessage: { type: 'string', example: 'Sure, pickup anytime after 5pm' },
            totalFee: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            itemId: { type: 'string' },
            reviewerId: { type: 'string' },
            revieweeId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Great lender, item was exactly as described!' },
            type: { type: 'string', enum: ['item', 'user'], example: 'item' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['borrow_request', 'request_approved', 'request_rejected', 'item_returned', 'new_review', 'system'], example: 'borrow_request' },
            title: { type: 'string', example: 'New borrow request' },
            message: { type: 'string', example: 'John wants to borrow your DeWalt Drill' },
            relatedId: { type: 'string' },
            read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
