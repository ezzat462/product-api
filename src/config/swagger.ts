import { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Product Management RESTful API',
    version: '1.0.0',
    description:
      'A professional, production-grade RESTful API for Product and User management built with Node.js, Express.js, TypeScript, MongoDB, and JWT authentication.',
    contact: {
      name: 'Ezzat Sobhi',
      url: 'https://github.com/ezzat462'
    }
  },
  servers: [
    {
      url: 'http://localhost:{port}/api',
      description: 'Local development server',
      variables: {
        port: {
          default: '5000'
        }
      }
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /auth/login or /auth/register'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6741b2f4a5c9d23e8e123456' },
          name: { type: 'string', example: 'Wireless Mechanical Keyboard' },
          price: { type: 'number', example: 89.99 },
          description: { type: 'string', example: 'Compact Bluetooth mechanical keyboard' },
          category: { type: 'string', example: 'Electronics' },
          stock: { type: 'number', example: 25 },
          createdBy: { type: 'string', example: '6741b2f4a5c9d23e8e111111' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateProductInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Wireless Mechanical Keyboard' },
          price: { type: 'number', minimum: 0, example: 89.99 },
          description: { type: 'string', example: 'Compact Bluetooth mechanical keyboard' },
          category: { type: 'string', example: 'Electronics' },
          stock: { type: 'number', minimum: 0, example: 25 }
        }
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Updated Keyboard Name' },
          price: { type: 'number', minimum: 0, example: 79.99 },
          description: { type: 'string', example: 'Updated description' },
          category: { type: 'string', example: 'Electronics' },
          stock: { type: 'number', minimum: 0, example: 10 }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Ezzat Sobhi' },
          email: { type: 'string', format: 'email', example: 'ezzat@example.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ezzat@example.com' },
          password: { type: 'string', example: 'secret123' }
        }
      },
      JSendSuccess: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { type: 'object' }
        }
      },
      JSendFail: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          data: { type: 'object' }
        }
      },
      JSendError: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Error message details' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } }
          }
        },
        responses: {
          '201': { description: 'User successfully created' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log into an existing account',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } }
          }
        },
        responses: {
          '200': { description: 'Successfully authenticated, returns JWT token' },
          '401': { description: 'Incorrect credentials' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Current authenticated user profile' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with filtering, sorting, and pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          '200': { description: 'List of paginated products' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product (Authenticated)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateProductInput' } }
          }
        },
        responses: {
          '201': { description: 'Product created' },
          '400': { description: 'Validation failure' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product details' },
          '404': { description: 'Product not found' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update product by ID (Authenticated)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateProductInput' } }
          }
        },
        responses: {
          '200': { description: 'Product updated' },
          '404': { description: 'Product not found' }
        }
      },
      patch: {
        tags: ['Products'],
        summary: 'Partially update product by ID (Authenticated)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateProductInput' } }
          }
        },
        responses: {
          '200': { description: 'Product updated' },
          '404': { description: 'Product not found' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product by ID (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product deleted' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden (Admins only)' },
          '404': { description: 'Product not found' }
        }
      }
    }
  }
};

export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerSpec);
