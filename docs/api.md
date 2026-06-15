# Swamy Hot Foods API Documentation

Base URL: `http://localhost:5001/api`

Production URL: `https://api.swamyshotfoods.in/api` (if deployed)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Menu Management](#menu-management)
3. [Store Configuration](#store-configuration)
4. [Timing Templates (Admin)](#timing-templates-admin)

---

## Authentication

### Register User

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123",
    "role": "user",  // Optional: 'user', 'admin', 'staff' (Default: 'user')
    "pic": "http://example.com/pic.jpg"  // Optional
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "role": "user",
    "pic": "http://example.com/pic.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Error Response (500)**:
  ```json
  {
    "error": "Error message"
  }
  ```

### Login

Authenticate and receive a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "user123",
      "role": "user",
      "pic": "http://example.com/pic.jpg"
    }
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

---

## Menu Management

### Get All Menu Items

Retrieve a list of all menu items.

- **URL**: `/menu`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**:
  ```json
  [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Idli",
      "price": 50,
      "desc": "Steamed rice cakes served with chutney and sambar",
      "timingTemplate": "breakfast-only",
      "morningTimings": {
        "startTime": "08:00",
        "endTime": "12:00"
      },
      "eveningTimings": null,
      "ingredients": ["Rice", "Urad Dal", "Salt"],
      "allergens": [],
      "dietaryLabels": ["vegetarian", "vegan", "gluten-free"],
      "priority": 1,
      "imgSrc": "https://example.com/idli.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Menu Item by ID

Retrieve a specific menu item.

- **URL**: `/menu/:id`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**: Same as single menu item object above
- **Error Response (404)**:
  ```json
  {
    "message": "Menu not found"
  }
  ```

### Create Menu Item

Create a new menu item.

- **URL**: `/menu`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Dosa",
    "price": 70,
    "desc": "Crispy rice and lentil crepe",
    "timingTemplate": "all-day",  // Optional: references a template key
    "morningTimings": {  // Optional: custom timings
      "startTime": "08:00",
      "endTime": "12:00"
    },
    "eveningTimings": {  // Optional: custom timings
      "startTime": "17:45",
      "endTime": "21:30"
    },
    "ingredients": ["Rice batter", "Oil"],
    "allergens": [],  // Optional
    "dietaryLabels": ["vegetarian"],  // Optional, defaults to ["vegetarian"]
    "priority": 2,
    "imgSrc": "https://example.com/dosa.jpg"
  }
  ```
  **Note**: Either use `timingTemplate` OR custom `morningTimings`/`eveningTimings`. Template takes precedence if both are provided.
- **Success Response (201)**: Returns created menu item
- **Error Response (401)**: Unauthorized
- **Error Response (500)**: Server error

### Update Menu Item

Update an existing menu item.

- **URL**: `/menu/:id`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial menu object (any fields to update)
  ```json
  {
    "price": 80,
    "desc": "Updated description"
  }
  ```
- **Success Response (200)**: Returns updated menu item
- **Error Response (404)**: Menu not found
- **Error Response (401)**: Unauthorized

### Delete Menu Item

Delete a menu item.

- **URL**: `/menu/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (204)**: No content
- **Error Response (404)**: Menu not found
- **Error Response (401)**: Unauthorized

### Assign Timing Template to Menu Item

Assign a predefined timing template to a menu item.

- **URL**: `/menu/:id/assign-template`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "templateKey": "breakfast-only"
  }
  ```
- **Success Response (200)**: Returns updated menu item with template assigned
- **Error Response (404)**: Menu not found
- **Error Response (401)**: Unauthorized

### Bulk Assign Template

Assign a timing template to multiple menu items at once.

- **URL**: `/menu/bulk-assign-template`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "menuIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "templateKey": "all-day"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Updated 2 items",
    "count": 2
  }
  ```
- **Error Response (401)**: Unauthorized

### Set Custom Timings

Set custom timings for a specific menu item (overrides template).

- **URL**: `/menu/:id/custom-timings`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "morningTimings": {
      "startTime": "07:00",
      "endTime": "11:00"
    },
    "eveningTimings": {
      "startTime": "18:00",
      "endTime": "22:00"
    }
  }
  ```
  **Note**: Either timing can be `null` to remove that slot.
- **Success Response (200)**: Returns updated menu item
- **Error Response (404)**: Menu not found
- **Error Response (401)**: Unauthorized

### Get Available Menu Items (Now)

Get menu items currently available based on the current time.

- **URL**: `/menu/available/now`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**: Array of available menu items
- **Note**: Automatically determines if current time falls within morning or evening slots

### Get Menu Items by Time Slot

Get menu items available during a specific time slot.

- **URL**: `/menu/available/:slot`
- **Method**: `GET`
- **Authentication**: None
- **URL Parameters**: 
  - `slot`: `morning` or `evening`
- **Success Response (200)**: Array of menu items for the specified slot
- **Error Response (400)**:
  ```json
  {
    "message": "Invalid slot. Use 'morning' or 'evening'"
  }
  ```

---

## Store Configuration

### Get Store Config

Get the current status of the shop (Open/Closed, Cooking, Holiday, etc.).

- **URL**: `/store-config`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "isShopOpen": true,
    "isCooking": false,
    "isHoliday": false,
    "holidayMessage": "Enter Holiday Text..!",
    "isNoticeActive": false,
    "noticeMessage": "Enter Notice Board Text..!",
    "description": "Swamy's Hot Foods is a pure veg destination.",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Update Store Config

Update the store configuration.

- **URL**: `/store-config`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial config object (any fields to update)
  ```json
  {
    "isShopOpen": true,
    "isCooking": false,
    "isHoliday": false,
    "holidayMessage": "Closed for Diwali",
    "isNoticeActive": true,
    "noticeMessage": "Special discount today!",
    "description": "Updated description"
  }
  ```
- **Success Response (200)**: Returns updated configuration
- **Error Response (401)**: Unauthorized
- **Error Response (403)**: Forbidden (requires admin role)

### Real-time Updates (SSE)

Stream real-time updates to the client using Server-Sent Events.

- **URL**: `/store-config/sse`
- **Method**: `GET`
- **Authentication**: None
- **Response Format**: `text/event-stream`
- **Event Data**: JSON object of the Store Config
- **Usage Example**:
  ```javascript
  const eventSource = new EventSource('http://localhost:5001/api/store-config/sse');
  
  eventSource.onmessage = (event) => {
    const config = JSON.parse(event.data);
    console.log('Store config updated:', config);
  };
  ```

---

## Timing Templates (Admin)

Timing templates allow admins to create reusable timing configurations that can be assigned to multiple menu items.

**All endpoints in this section require authentication and admin role.**

### Create Timing Template

Create a new timing template.

- **URL**: `/admin/timing-templates`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Breakfast Only",
    "key": "breakfast-only",
    "morningTimings": {
      "startTime": "08:00",
      "endTime": "12:00"
    },
    "eveningTimings": null,
    "isActive": true
  }
  ```
  **Note**: `key` must be unique. Either timing slot can be `null`.
- **Success Response (201)**: Returns created template
- **Error Response (401)**: Unauthorized
- **Error Response (403)**: Forbidden (requires admin role)

### Get All Timing Templates

Retrieve all timing templates.

- **URL**: `/admin/timing-templates`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**:
  ```json
  [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "All Day",
      "key": "all-day",
      "morningTimings": {
        "startTime": "08:00",
        "endTime": "12:00"
      },
      "eveningTimings": {
        "startTime": "17:45",
        "endTime": "21:30"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Timing Template by ID

Retrieve a specific timing template.

- **URL**: `/admin/timing-templates/:id`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**: Returns template object
- **Error Response (404)**:
  ```json
  {
    "message": "Template not found"
  }
  ```

### Update Timing Template

Update an existing timing template.

- **URL**: `/admin/timing-templates/:id`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial template object (any fields to update)
  ```json
  {
    "name": "Updated Name",
    "morningTimings": {
      "startTime": "07:00",
      "endTime": "11:00"
    },
    "isActive": false
  }
  ```
- **Success Response (200)**: Returns updated template
- **Error Response (404)**: Template not found

### Delete Timing Template

Delete a timing template.

- **URL**: `/admin/timing-templates/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Bearer Token + Admin Role)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (204)**: No content
- **Error Response (404)**: Template not found

---

## Data Models

### Menu Item Schema

```typescript
{
  _id: string;
  name: string;
  price: number;
  desc: string;
  timingTemplate?: string;  // References TimingTemplate.key
  morningTimings?: {
    startTime: string;  // Format: "HH:MM"
    endTime: string;    // Format: "HH:MM"
  };
  eveningTimings?: {
    startTime: string;
    endTime: string;
  };
  ingredients: string[];
  allergens?: string[];
  dietaryLabels: string[];  // e.g., ["vegetarian", "vegan", "gluten-free"]
  priority: number;
  imgSrc: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Timing Template Schema

```typescript
{
  _id: string;
  name: string;
  key: string;  // Unique identifier
  morningTimings?: {
    startTime: string;
    endTime: string;
  };
  eveningTimings?: {
    startTime: string;
    endTime: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Schema

```typescript
{
  _id: string;
  username: string;
  password: string;  // Hashed
  role: "user" | "admin" | "staff";
  pic?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Store Config Schema

```typescript
{
  _id: string;
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  description: string;
  updatedAt: Date;
}
```

---

## Authentication & Authorization

### Bearer Token Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token by calling the `/auth/login` endpoint.

### Role-Based Access Control

- **Public**: No authentication required
  - `GET /menu`, `GET /menu/:id`, `GET /menu/available/*`
  - `GET /store-config`, `GET /store-config/sse`
  - `POST /auth/register`, `POST /auth/login`

- **Authenticated**: Requires valid JWT token
  - `POST /menu`, `PUT /menu/:id`, `DELETE /menu/:id`
  - `PUT /menu/:id/assign-template`, `POST /menu/bulk-assign-template`
  - `PUT /menu/:id/custom-timings`

- **Admin Only**: Requires JWT token + admin role
  - `PUT /store-config`
  - All `/admin/timing-templates` endpoints

---

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (wrong role)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error response format:
```json
{
  "error": "Error message description",
  "message": "Additional context"  // Optional
}
```

---

## Swagger UI

Interactive API documentation is available at:

**Development**: `http://localhost:5001/api-docs`

**Production**: `https://api.swamyshotfoods.in/api-docs` (if deployed)

---

## Notes

- All timestamps are in ISO 8601 format
- Time strings use 24-hour format: `"HH:MM"` (e.g., `"08:00"`, `"17:45"`)
- Menu items can use either timing templates OR custom timings
- When a template is assigned, it overrides custom timings
- The SSE endpoint maintains persistent connections for real-time updates
