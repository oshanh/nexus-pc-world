# 🚀 Frontend E2E Testing Guide - Quick Start

## **Status: ✅ READY FOR MANUAL END-TO-END TESTING**

All frontend improvements are complete. Run the end-to-end tests to validate everything works together.

---

## 🎯 Quick Test (5 minutes)

### Step 1: Start Servers
```powershell
# Terminal 1 - Backend
cd npw-backend
npm run dev

# Terminal 2 - Frontend  
cd npw-frontend
npm run dev
```

### Step 2: Open Browser
- Navigate to `http://localhost:3000`
- Open DevTools (F12) → Console tab (watch for errors)

### Step 3: Test These Flows

**✅ Routing (Clean URLs)**
- Click "Products" → URL shows `/products` (not `#/products`)
- Click "About" → URL shows `/about`
- Refresh page → still on `/about` (no 404)

**✅ Authentication**
- Click "Login"
- Enter admin credentials (from seed data)
- Refresh page → still logged in
- Console should show: `/auth/me` called on mount, response includes user data

**✅ Admin CRUD**
- Go to `/admin` (should be accessible if logged in as admin)
- Add a product: fill form → click "Deploy New System"
  - Button shows "Deploying..." with spinner
  - Success toast appears (green with checkmark)
  - Product appears in list
- Edit product: click "Edit" → change a field → click "Update Product"
  - Success toast: "Product updated successfully!"
- Delete product: click "Delete" → confirm in dialog
  - Loading spinner appears
  - Success toast: "Product deleted successfully!"
  - Product removed from list

**✅ Error Handling**
- Try adding product with empty name
- Error toast appears (red with X): "Product name is required"
- Form stays open (not reset) so you can fix it

**✅ No Console Errors**
- Check DevTools Console
- Should show NO red errors (warnings are OK)
- If any red errors appear, note them

---

## 📋 Full Test Checklist

For comprehensive testing, follow: **`E2E_TEST_CHECKLIST.md`**

Covers:
- Navigation & routing
- Session persistence
- Admin access control
- All CRUD operations
- Error scenarios
- Network edge cases
- Console validation

---

## 📊 What's Been Done

✅ **Auth Rehydration**
- Unconditional `/auth/me` call on app mount
- Admin users auto-initialize `adminMode = true`
- Session persists across page refresh

✅ **Clean URL Routing**
- Replaced hash history (`#/path`) with clean URLs (`/path`)
- SPA fallback configured for Netlify deployment
- All pages accessible via clean URLs

✅ **API Error Handling**
- JSON error message extraction
- CSRF token auto-reset on 403 responses
- Status-specific error messages (401, 403, 400, etc.)
- Form retention on error (user can retry)

✅ **Admin Mutations**
- Async operations (no double-submit)
- Per-action loading states
- Form validation with error feedback
- Success/error toast notifications (top-right, auto-dismiss)
- Delete confirmation dialogs

✅ **Project Structure**
- Clean `src/` organization
- Proper TypeScript types
- Environment variables configured
- Vite alias for cleaner imports

---

## 🔴 Common Issues & Fixes

### "Page Not Found" after refresh
**Cause**: SPA fallback not working  
**Fix**: Verify `public/_redirects` file exists with content: `/* /index.html 200`

### Not logged in after refresh
**Cause**: AuthContext not calling `/auth/me` unconditionally  
**Fix**: Check `src/contexts/AuthContext.tsx` has `useEffect` without token gate

### Admin page shows "Access Denied"
**Cause**: User role not "admin" or `adminMode` not initialized  
**Fix**: Login with admin account from seed data, check browser console for `/auth/me` response

### API calls return 403 CSRF error repeatedly
**Cause**: CSRF token not being reset and refetched  
**Fix**: Verify `src/api/client.ts` clears `client._csrfToken = ''` on 403 response

### Toast notifications not appearing
**Cause**: Toast component not mounted in AdminPage  
**Fix**: Check `<Toast ... />` component is rendered in AdminPage JSX

---

## 📈 Results Expected

After running E2E tests, you should see:

✅ **Frontend ready for production** if:
1. All routes load without 404
2. Auth persists on refresh
3. Admin CRUD operations succeed
4. Errors show helpful messages
5. No red console errors
6. Forms are responsive and load states visible

🔴 **Issues to fix** if:
1. 404 errors on route refresh
2. Session lost on page refresh
3. Admin mutations fail silently
4. Generic error messages ("Error occurred")
5. Red console errors or warnings
6. Loading spinners not showing

---

## 🎬 Next Steps

1. **Run E2E tests** using checklist above
2. **Document any issues** found
3. **Fix issues** using error handling patterns in codebase
4. **Re-test** until all items pass
5. **Commit changes**: `git add . && git commit -m "frontend ready for deployment"`
6. **Deploy to staging** on Netlify for team review

---

## 📞 Questions?

- See **`FRONTEND_READINESS_REPORT.md`** for detailed architecture
- See **`E2E_TEST_CHECKLIST.md`** for comprehensive test scenarios
- Check **`src/api/client.ts`** for error handling patterns
- Check **`src/contexts/AuthContext.tsx`** for session management logic

---

**Happy testing! 🎮**
