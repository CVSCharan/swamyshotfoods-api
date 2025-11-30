import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swamy Hot Foods API",
      version: "1.0.0",
      description: "API documentation for Swamy Hot Foods application",
      contact: {
        name: "API Support",
        email: "support@swamyshotfoods.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5001/api",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Menu: {
          type: "object",
          required: [
            "name",
            "price",
            "desc",
            "ingredients",
            "priority",
            "imgSrc",
          ],
          properties: {
            id: {
              type: "string",
              description: "The auto-generated id of the menu item",
            },
            name: { type: "string", description: "Name of the item" },
            price: { type: "number", description: "Price of the item" },
            desc: { type: "string", description: "Description" },
            morningTimings: {
              type: "object",
              properties: {
                startTime: { type: "string", example: "08:00" },
                endTime: { type: "string", example: "12:00" },
              },
            },
            eveningTimings: {
              type: "object",
              properties: {
                startTime: { type: "string", example: "17:45" },
                endTime: { type: "string", example: "21:30" },
              },
            },
            ingredients: { type: "string", description: "Ingredients list" },
            priority: { type: "number", description: "Display priority" },
            imgSrc: { type: "string", description: "Image URL" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          required: ["username", "password"],
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            password: { type: "string" },
            role: {
              type: "string",
              enum: ["user", "admin", "staff"],
              default: "user",
            },
            pic: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
