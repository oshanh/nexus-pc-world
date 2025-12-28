# Frontend End-to-End Test Checklist

## ✅ Pre-Test Setup

### Prerequisites
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend dev server running on `http://localhost:3000` (via `npm run dev`)
- [ ] MongoDB connected and seeded with test data
- [ ] Browser DevTools open (F12) to check for console errors

### Starting Servers

**Terminal 1 - Backend:**
```powershell
cd npw-backend
npm run dev
# Should output: "Server running on port 5000"
```

**Terminal 2 - Frontend:**
```powershell
cd npw-frontend
npm run dev
# Should output: "VITE v5.x.x ready in XXX ms" and local URL
```

---

## 📋 Test Scenarios

### 1. **Routing & Navigation (Clean URLs)**
- [ ] Navigate to `http://localhost:3000/` → Home page loads
- [ ] Click "Products" nav link → URL becomes `/products` (not `#/products`)
- [ ] Click "About" → URL becomes `/about` (clean URL)
- [ ] Click "Contact" → URL becomes `/contact`
- [ ] Back/Forward buttons work correctly
- [ ] Direct URL entry works (e.g., paste `/admin` in address bar)
- [ ] Refresh page maintains current route (no 404)

**Expected:** All routes use clean URLs (no `#`), navigation smooth, page scroll resets to top.

---

### 2. **Authentication & Session**

#### Login Flow
- [ ] Click "Login" nav link → `/login` page loads
- [ ] Enter invalid credentials → Error toast shown
- [ ] Enter valid admin credentials (from seed data) → Redirected to home
- [ ] Check browser cookies: `connect.sid` present (HttpOnly, Secure flags set by backend)
- [ ] Refresh page → Still logged in, navbar shows admin username

#### Session Persistence
- [ ] After login, refresh page (Cmd+R or F5) → Still logged in
- [ ] Open DevTools → Check Network tab: `/auth/me` called on page load (unconditional rehydrate)
- [ ] Response shows: `{ user: {...}, role: "admin" }`
- [ ] AdminMode should auto-initialize for admin users

#### Admin Mode Initialization
- [ ] Check browser console: No errors
- [ ] Check in AdminPage: Only appears if user role is "admin" AND `adminMode` is true

---

### 3. **Admin Page Access & Protection**

#### Access Control
- [ ] Login as admin → Can access `/admin` page
- [ ] Logout → Try accessing `/admin` directly → See "Access Denied" message
- [ ] Error message: "You do not have clearance to access the Command Center."
- [ ] Button "Return to Base" redirects to home

#### Admin Features Visible
- [ ] After login as admin, go to `/admin`
- [ ] See "Command Center" header
- [ ] Two tabs: "Products List" and "Add New Product"
- [ ] List tab shows all products with "Edit" and "Delete" buttons

---

### 4. **Product CRUD Operations (Admin Mutations)**

#### Create Product
- [ ] Click "Add New Product" tab
- [ ] Fill form:
  - [ ] Name: "Test Gaming PC"
  - [ ] Category: "Desktop"
  - [ ] Sub-Category: "High-End PC"
  - [ ] Price: "Rs 150000"
  - [ ] Stock: "5"
  - [ ] Short Description: "Test product"
  - [ ] Description: "Test gaming PC description"
  - [ ] Image URLs: Paste at least one valid image URL
  - [ ] Add a spec: Name: "CPU", Value: "Intel i9"
- [ ] Click "Deploy New System" button
- [ ] Observe:
  - [ ] Button text changes to "Deploying..." with spinner
  - [ ] Button is disabled during submission
  - [ ] **Success toast** appears (green with checkmark): "Product added successfully!"
  - [ ] Toast disappears after 4 seconds
  - [ ] Form resets to empty
  - [ ] New product appears in "Products List" tab
- [ ] Check Network tab: POST to `/api/products` succeeds (201 or 200)

#### Edit Product
- [ ] In "Products List", click "Edit" on any product
- [ ] Form populates with product data
- [ ] Change a field (e.g., price)
- [ ] Click "Update Product" (button label changed from "Deploy")
- [ ] Observe:
  - [ ] Button shows "Updating..." with spinner
  - [ ] Form is disabled
  - [ ] Success toast: "Product updated successfully!"
  - [ ] Product list updates immediately
- [ ] Check Network tab: PUT to `/api/products/{id}` succeeds

#### Delete Product
- [ ] Click "Delete" button on any product
- [ ] Confirm dialog appears: "Are you sure? This cannot be undone."
- [ ] Click "Cancel" → Dialog closes, nothing deleted
- [ ] Click "Delete" again → Dialog appears again
- [ ] Click "Confirm" (or "Delete" button)
- [ ] Observe:
  - [ ] Delete button shows spinner
  - [ ] After deletion: Success toast "Product deleted successfully!"
  - [ ] Product removed from list
- [ ] Check Network tab: DELETE to `/api/products/{id}` succeeds (204 or 200)

---

### 5. **Error Handling & User Feedback**

#### Form Validation
- [ ] In "Add New Product" form:
  - [ ] Try submitting with empty "Name" field
  - [ ] **Error toast** appears (red with X): "Product name is required"
  - [ ] Form stays open (not reset)
  - [ ] User can fix and retry
- [ ] Try with invalid price format:
  - [ ] Error toast: "API Error (400): Invalid price format"
  - [ ] Form retained for correction

#### API Errors (Testing with Backend)
- [ ] With backend running, try creating product with duplicate name (if unique constraint exists):
  - [ ] Error toast (red): "API Error (409): Product already exists" (or backend message)
  - [ ] Form retained for retry

#### Network Errors
- [ ] Stop backend server (simulating network failure)
- [ ] Try adding product in admin form
- [ ] **Error toast** appears: "Failed to fetch..." or descriptive error
- [ ] Form retained (not reset)
- [ ] Start backend again
- [ ] Retry form submission
- [ ] Should succeed (rehydration + recovery)

#### 403 Forbidden (CSRF Token Expiry)
- [ ] In browser DevTools, go to Application → Cookies
- [ ] Delete `connect.sid` cookie (simulate session expiry)
- [ ] Try adding product
- [ ] First request fails with 403 (no valid session)
- [ ] Expected error toast: "CSRF token invalid. Please retry: ..."
- [ ] **Automatic retry**: Client refetches CSRF token and retries
- [ ] If configured correctly, request should succeed on retry
- [ ] OR user sees helpful error message to retry manually

#### 401 Unauthorized
- [ ] Manually edit API client to send invalid auth
- [ ] Try mutation
- [ ] **Error toast**: "Unauthorized: ..." 
- [ ] Check that user is NOT logged out automatically (or is, depending on backend behavior)

---

### 6. **Product Browsing & Display**

#### Products Page
- [ ] Go to `/products`
- [ ] Products load and display in grid
- [ ] Each card shows: image, name, price, category
- [ ] Search/filter works (if implemented)
- [ ] Click product card → Modal opens with details
- [ ] Modal shows: full description, specs, images

#### Home Page
- [ ] Featured products section loads
- [ ] Images load correctly
- [ ] "Shop Now" buttons link to `/products`

#### Cart & Wishlist
- [ ] From product modal, click "Add to Cart"
- [ ] Toast: "Added to cart!"
- [ ] Go to `/cart` → Product visible
- [ ] Click "Add to Wishlist" → Toast: "Added to wishlist!"
- [ ] Go to `/wishlist` → Product visible

---

### 7. **Navigation & Layout**

#### Header/Nav
- [ ] Logo is clickable → Goes to home
- [ ] All nav links work (Products, About, Contact, Custom Build, etc.)
- [ ] Login/Logout buttons work
- [ ] Cart & Wishlist icons show counts

#### Footer
- [ ] Footer visible on all pages
- [ ] Links clickable
- [ ] Social links present

#### Responsive Design
- [ ] Resize browser window
- [ ] Mobile menu appears on small screens
- [ ] Layout remains clean and usable

---

### 8. **Edge Cases & Recovery**

#### Refresh After Action
- [ ] Add a product (successfully)
- [ ] Refresh page (Cmd+R)
- [ ] Product still exists in list (data persisted on backend)
- [ ] No duplicate created

#### Multiple Tab Sync
- [ ] Open admin in two browser tabs
- [ ] Delete product in Tab 1
- [ ] Refresh Tab 2
- [ ] Product gone (reflects backend state)

#### Long-Running Operations
- [ ] Slow network (throttle in DevTools to "Slow 3G")
- [ ] Add product
- [ ] Button shows spinner for several seconds
- [ ] Submission completes without double-submit
- [ ] Success toast shown

---

### 9. **Console & Performance**

#### No Errors
- [ ] Open DevTools (F12)
- [ ] Go through all test scenarios
- [ ] **Error Console** shows NO red errors (warnings OK)
- [ ] Check for:
  - [ ] CORS errors (should not occur, backend allows frontend origin)
  - [ ] "undefined is not a function" errors
  - [ ] Fetch/Network errors in console

#### Network Requests
- [ ] Network tab shows all requests are to `http://localhost:5000/api/*`
- [ ] CSRF token fetched once, then cached (check `/csrf-token` call)
- [ ] Auth rehydrate happens on mount (`GET /auth/me`)
- [ ] Product operations use correct HTTP methods:
  - [ ] POST for create
  - [ ] PUT for update
  - [ ] DELETE for delete
  - [ ] GET for read
- [ ] All requests include `credentials: include` (cookies sent)

---

## 🎯 Final Assessment

### ✅ Frontend Ready If:
1. **Routing**: Clean URLs, SPA fallback works, back/forward work
2. **Auth**: Session persists on refresh, admin auto-initializes
3. **Mutations**: All CRUD ops async, loading states visible, form retained on error
4. **Errors**: JSON error parsing works, 403 CSRF reset functional, user sees helpful messages
5. **No Console Errors**: Clean console, no unhandled rejections
6. **Responsive**: Layout works on mobile, desktop, and tablets

### 🔴 Issues Found - Actions:
- **Issue**: [Description]
  - [ ] Root cause identified
  - [ ] Fix implemented
  - [ ] Re-tested

---

## 📝 Notes
- Run this checklist multiple times (different browsers, incognito mode)
- Capture screenshots of errors for documentation
- Test with both Chrome and Firefox (different CORS/cookie behaviors possible)
- Check mobile responsiveness on actual device or via DevTools device mode

---

**Test Date**: ___________  
**Tester Name**: ___________  
**Result**: [ ] PASS [ ] FAIL [ ] PARTIAL
