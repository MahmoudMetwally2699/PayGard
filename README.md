
---

# PayGuard - Payment Management System

PayGuard is a secure payment management system that allows users to create and manage payment requests. It integrates with Supabase for authentication and MongoDB for data storage.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [API Details](#api-details)
3. [Environment Variables](#environment-variables)
4. [Test Credentials](#test-credentials)

---

## Project Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account (for database)
- Supabase account (for authentication)

### Steps to Set Up
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/payguard.git
   cd payguard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the root directory.
   - Add the required environment variables (see [Environment Variables](#environment-variables)).

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`.

---

## API Details

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. **Create a Payment**
- **Method:** `POST`
- **URL:** `/payments`
- **Request Body:**
  ```json
  {
    "title": "Test Payment",
    "amount": 100,
    "userId": "82ba74cc-6996-4ae6-bc1a-38c5824efb09"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "64f1b2c8e4b0d8f9c8f1b2c8",
    "title": "Test Payment",
    "amount": 100,
    "userId": "82ba74cc-6996-4ae6-bc1a-38c5824efb09",
    "status": "pending",
    "createdAt": "2023-09-01T12:34:56.789Z",
    "__v": 0
  }
  ```

#### 2. **Get Payments**
- **Method:** `GET`
- **URL:** `/payments?userId=<userId>`
- **Query Parameters:**
  - `userId` (optional): Fetch payments for a specific user.
- **Response:**
  ```json
  [
    {
      "_id": "64f1b2c8e4b0d8f9c8f1b2c8",
      "title": "Test Payment",
      "amount": 100,
      "userId": "82ba74cc-6996-4ae6-bc1a-38c5824efb09",
      "status": "pending",
      "createdAt": "2023-09-01T12:34:56.789Z",
      "__v": 0
    }
  ]
  ```

#### 3. **Update Payment Status**
- **Method:** `PUT`
- **URL:** `/payments/:id`
- **Request Body:**
  ```json
  {
    "status": "approved"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "64f1b2c8e4b0d8f9c8f1b2c8",
    "title": "Test Payment",
    "amount": 100,
    "userId": "82ba74cc-6996-4ae6-bc1a-38c5824efb09",
    "status": "approved",
    "createdAt": "2023-09-01T12:34:56.789Z",
    "__v": 0
  }
  ```

#### 4. **Delete a Payment**
- **Method:** `DELETE`
- **URL:** `/payments/:id`
- **Response:**
  ```json
  {
    "message": "Payment deleted successfully"
  }
  ```

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env

```

---

## Test Credentials

### User Credentials
- **Email:** `mahmetwally99@gmail.com`
- **Password:** `mahmoud1234`

### Admin Credentials
- **Email:** `mahmetwally99@gmail.com`
- **Password:** `123456`

---

## Additional Notes
- Ensure that MongoDB and Supabase are properly configured before running the application.
- Use the provided test credentials to log in and test the application.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Let me know if you need further assistance! 🚀
