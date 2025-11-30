# Swamy Hot Foods API Documentation

Base URL: `http://localhost:5001/api`

## Authentication

### Register User

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user123",
    "password": "password123",
    "role": "user", // Optional: 'user', 'admin', 'staff' (Default: 'user')
    "pic": "http://example.com/pic.jpg" // Optional
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "username": "user123",
    "role": "user",
    "pic": "...",
    "_id": "...",
    "createdAt": "..."
  }
  ```

### Login

Authenticate and receive a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "_id": "...",
      "username": "user123",
      "role": "user"
    }
  }
  ```

---

## Menu Management

### Get All Menu Items

Retrieve a list of all menu items.

- **URL**: `/menu`
- **Method**: `GET`
- **Success Response (200)**:
  ```json
  [
    {
      "_id": "...",
      "name": "Idli",
      "price": 50,
      "desc": "Steamed rice cakes",
      "morningTimings": {
        "startTime": "08:00",
        "endTime": "12:00"
      },
      "eveningTimings": null,
      "ingredients": "Rice, Urad Dal",
      "priority": 1,
      "imgSrc": "..."
    }
  ]
  ```

### Get Menu Item by ID

- **URL**: `/menu/:id`
- **Method**: `GET`

### Create Menu Item

**Requires Authentication**

- **URL**: `/menu`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Dosa",
    "price": 70,
    "desc": "Crispy crepe",
    "morningTimings": {
      "startTime": "08:00",
      "endTime": "12:00"
    },
    "eveningTimings": {
      "startTime": "17:45",
      "endTime": "21:30"
    },
    "ingredients": "Rice batter",
    "priority": 2,
    "imgSrc": "http://example.com/dosa.jpg"
  }
  ```
  **Note:** `morningTimings` and `eveningTimings` are optional. Omit them if the item is not available in that period.

### Update Menu Item

**Requires Authentication**

- **URL**: `/menu/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: (Partial object)
  ```json
  {
    "price": 80
  }
  ```

### Delete Menu Item

**Requires Authentication**

- **URL**: `/menu/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`

---

## Store Configuration

### Get Store Config

Get the current status of the shop (Open/Closed, Cooking, Holiday, etc.).

- **URL**: `/store-config`
- **Method**: `GET`
- **Success Response (200)**:
  ```json
  {
    "isShopOpen": true,
    "isCooking": false,
    "isHoliday": false,
    "holidayMessage": "Enter Holiday Text..!",
    "isNoticeActive": false,
    "noticeMessage": "Enter Notice Board Text..!",
    "description": "Swamy's Hot Foods...",
    "currentStatusMsg": "Closing soon..!" // Dynamic message based on time
  }
  ```

### Update Store Config

**Requires Authentication + Admin Role**

- **URL**: `/store-config`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "isShopOpen": true,
    "isCooking": false
  }
  ```

### Real-time Updates (SSE)

Stream real-time updates to the client.

- **URL**: `/store-config/sse`
- **Method**: `GET`
- **Format**: Server-Sent Events (text/event-stream)
- **Data**: JSON object of the Store Config.

---

## Swagger UI

Interactive API documentation is available at:
`http://localhost:5001/api-docs`
