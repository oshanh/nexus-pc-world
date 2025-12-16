# User API Reference (Cart · Wishlist · Orders)

**Summary**
This document describes the user-scoped API endpoints under `/api/user` used to manage a user's cart, wishlist, and orders. All routes require authentication (JWT via httpOnly cookie), and state-changing requests (POST/PUT/DELETE) require a valid CSRF token in the `X-CSRF-Token` header.

---

## Authentication & CSRF ✅
- Auth: requests must include the auth cookie set by the login flow (server verifies token and populates `req.user`).
- CSRF: For state-changing requests (POST / PUT / DELETE) the client must include the CSRF token obtained from `GET /api/csrf-token` in header `X-CSRF-Token`.
- Note: `GET` requests are read-only and do not require CSRF token, but still require authentication.

> Important: For guest users (no auth) the client maintains cart/wishlist in `localStorage` only — server endpoints are **only** for authenticated users.

---

## Endpoints

Base path: `/api/user`

### Cart

- GET /user/cart
  - Description: Return the server-side cart for the authenticated user.
  - Auth: Required
  - Query parameters: none
  - Response 200:
    ```json
    { "cart": [ { "id": "sku123", "name": "GPU X", "price": "Rs 24,999", "quantity": 2, "imageUrls": ["..."], ... } ] }
    ```
  - Errors: 401 if not authenticated; 500 on server error.

- PUT /user/cart
  - Description: Replace the user's cart with the provided `items` array (authoritative update).
  - Auth: Required
  - Headers: `X-CSRF-Token: <token>`
  - Body:
    ```json
    { "items": [ { "id": "sku123", "name": "GPU X", "price": "Rs 24,999", "quantity": 2 } ] }
    ```
  - Response 200:
    ```json
    { "cart": [ ... ] }
    ```
  - Validation: `items` should be an array; each item should have `id` and `quantity` at minimum.
  - Errors: 400 on malformed body, 401 unauthorized, 500 server error.

- POST /user/cart/items
  - Description: Add a single item to the cart or increase quantity if exists.
  - Auth: Required
  - Headers: `X-CSRF-Token`
  - Body:
    ```json
    { "item": { "id": "sku123", "name": "GPU X", "price": "Rs 24,999", "quantity": 1 } }
    ```
  - Response 200:
    ```json
    { "cart": [ ... ] }
    ```
  - Errors: 400 if item missing/invalid, 401, 500.

- DELETE /user/cart/items/:id
  - Description: Remove item with id from cart.
  - Auth: Required
  - Headers: `X-CSRF-Token`
  - Response 200:
    ```json
    { "cart": [ ... ] }
    ```

---

### Wishlist

- GET /user/wishlist
  - Description: Return the user's wishlist (server-side).
  - Auth: Required
  - Response 200:
    ```json
    { "wishlist": [ { "id": "sku123", "name": "GPU X", ... } ] }
    ```

- PUT /user/wishlist
  - Description: Replace the wishlist with provided `items` array.
  - Auth: Required
  - Headers: `X-CSRF-Token`
  - Body: `{ "items": [ { "id": "sku123" }, ... ] }`
  - Response 200: `{ "wishlist": [...] }`

- POST /user/wishlist
  - Description: Add a single product to the wishlist (if not exists).
  - Auth: Required
  - Headers: `X-CSRF-Token`
  - Body: `{ "item": { "id": "sku123", "name": "GPU X" } }`
  - Response 200: `{ "wishlist": [...] }`

- DELETE /user/wishlist/:id
  - Description: Remove item from wishlist.
  - Auth: Required
  - Headers: `X-CSRF-Token`

---

### Orders

- GET /user/orders
  - Description: Return user's orders (recent first).
  - Auth: Required
  - Response 200:
    ```json
    { "orders": [ { "id": "ORD-<timestamp>-<rand>", "items": [...], "total": 49999, "createdAt": "..." } ] }
    ```

- POST /user/orders
  - Description: Create a new order for the user. Server will persist the order and may clear the cart.
  - Auth: Required
  - Headers: `X-CSRF-Token`
  - Body: `{ "items": [...], "total": 12345 }
`  - Response 201:
    ```json
    { "order": { "id": "ORD-...", "items": [...], "total": 12345, "createdAt": "..." } }
    ```

---

## Errors & Response patterns
- 401 Unauthorized: missing or expired auth token. Client should redirect to login / reauthenticate.
- 403 Forbidden: CSRF token invalid or missing for state-changing requests.
- 400 Bad Request: malformed payload or validation failures.
- 500 Internal Server Error: database or server error.

All error responses follow `{ message: string }` shape.

---

## Client behavior / migration notes 💡
- Guests (not authenticated): client stores cart/wishlist in `localStorage` keys `nexusCart:guest` and `nexusWishlist:guest` and works offline.
- On login (client detects authenticated user): client will
  1. fetch server cart/wishlist, 2. merge guest local data into server data (cart: sum quantities; wishlist: union), 3. persist merged data via the corresponding PUT endpoints, and 4. remove the guest localStorage copies.
- This means server endpoints are the source of truth for authenticated users.

---

## Security & Validation Recommendations 🔒
- Validate incoming item shapes server-side (id present, quantity >= 1, max quantity limits).
- Limit cart payload size (max number of items) to prevent abuse.
- Rate limit write endpoints (POST/PUT/DELETE) per user.
- For orders, consider moving them to their own collection for scalability and to support admin order queries.

---

## cURL Examples

- Get cart:
```bash
curl -b cookiejar.txt -c cookiejar.txt -X GET "http://localhost:5000/api/user/cart"
```

- Update cart (requires CSRF token):
```bash
CSRF=$(curl -b cookiejar.txt -c cookiejar.txt http://localhost:5000/api/csrf-token | jq -r .csrfToken)
curl -b cookiejar.txt -H "X-CSRF-Token: $CSRF" -X PUT -H 'Content-Type: application/json' -d '{"items":[{"id":"sku1","quantity":2}]}' http://localhost:5000/api/user/cart
```

---

## Tests / E2E Checklist (quick)
- Login flow: authenticate user, call GET /user/cart and /user/wishlist — expect 200 and proper shapes.
- Migration: as guest add items to localStorage then login — verify server receives merged items and guest keys removed.
- Add/remove: POST/DELETE cart and wishlist items and verify server state.
- Orders: POST /user/orders should return 201 and create an order and clear user cart.

---

## Change Log
- 2025-12-16: Initial doc created describing cart/wishlist/orders endpoints and client migration behaviour.

---

For any changes or additional examples (TypeScript client samples, SDK snippets, or Postman collection), tell me which format you prefer and I’ll add it. 🎯
