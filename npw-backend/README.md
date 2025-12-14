# NPW Backend

Express.js backend service with MongoDB integration.

## Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/npw
PORT=5000
NODE_ENV=development
```

## Running the Server

```bash
npm start
```

## Project Structure

```
src/
├── models/      # MongoDB schemas
├── routes/      # API endpoints
├── controllers/ # Business logic
├── middleware/  # Custom middleware
└── config/      # Configuration files
```

## API Endpoints

- `GET /api/` - Health check

## Technologies

- Express.js
- MongoDB
- Mongoose (ODM)

## License

MIT