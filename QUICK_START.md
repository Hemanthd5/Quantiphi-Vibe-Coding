# 🚀 Quick Start Guide

Get your E-Commerce Multi-Filter System running in **3 minutes**.

---

## ⚡ Super Fast Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/Hemanthd5/Quantiphi-Vibe-Coding.git
cd Quantiphi-Vibe-Coding
```

### Step 2: Start Backend (Terminal 1)
```bash
python app.py
```
**Expected output**:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 3: Start Frontend (Terminal 2)
```bash
npm install  # First time only
npm run dev
```
**Expected output**:
```
  ➜  Local:   http://localhost:5173/
```

### Step 4: Open Browser
Navigate to **http://localhost:5173**

---

## ✅ Verify It Works

### Test 1: Filter by Category
1. Click **"Electronics"** checkbox
2. Products should filter instantly
3. Badge shows "1 active"

### Test 2: Adjust Price Range
1. Drag **Min Price** slider to $50
2. Drag **Max Price** slider to $150
3. Only products in range $50-$150 show

### Test 3: Filter by Rating
1. Select **"4.5+ stars"** radio button
2. Only highly rated products appear
3. Badge shows "4.5+"

### Test 4: Combine All Filters
1. Select **"Footwear"** + **"Apparel"**
2. Set price range **$30-$100**
3. Choose **"4+ stars"**
4. Products must match ALL criteria

### Test 5: Sort Results
1. Click **"Sort by"** dropdown
2. Select **"Price: Low to High"**
3. Products rearrange (cheapest first)

### Test 6: Reset Everything
1. Click **"Reset"** button in sidebar
2. All 100 products should return
3. All filters clear

---

## 🧪 Run Tests

```bash
python tests/test_filter_integration.py
```

**Expected output**:
```
test_combinatorial_intersect_filtering ... ok
test_data_type_normalization ... ok
test_multiple_categories_union ... ok
test_null_filters_return_full_dataset ... ok
test_server_side_sorting_pipeline ... ok
test_tight_limit_conditions ... ok
test_zero_results_scenario ... ok

Tests Run: 7
Successes: 7
```

---

## 🎨 UI Features to Explore

### Theme Toggle
- Click **🌙/☀️** button in header
- Dark/Light mode switches smoothly
- Theme persists across page reloads

### Active Filter Badges
- Look for **cyan glowing badges** on selected filters
- Checkmarks appear next to active categories
- Progress bars show slider positions

### Empty State
1. Select **"Electronics"**
2. Set min price to **$200**
3. Set max price to **$250**
4. Set rating to **"5 stars"**
5. If no matches, see custom "No items match" screen
6. Click **"Reset filters"** to return

### URL Sharing
1. Apply some filters
2. Copy URL from address bar (includes filter params)
3. Paste in new tab → filters restore automatically

---

## 📊 What to Check

### Backend Verification
✅ Flask server running on port 5000  
✅ No CORS errors in browser console  
✅ API returns JSON with `products`, `count`, `filters` keys  
✅ Empty filters return all 100 products  

### Frontend Verification
✅ Vite dev server running on port 5173  
✅ All images loading from Unsplash  
✅ Filter changes trigger instant API calls  
✅ Product grid updates without page refresh  
✅ Dark/light theme toggle works  

### Test Verification
✅ All 7 integration tests pass  
✅ Runtime under 1 second  
✅ No errors or failures  

---

## 🐛 Troubleshooting

### Backend won't start
**Error**: `ModuleNotFoundError: No module named 'flask'`  
**Fix**: `pip install flask flask-cors`

### Frontend won't start
**Error**: `npm: command not found`  
**Fix**: Install Node.js from https://nodejs.org

### CORS errors in browser
**Error**: `Access-Control-Allow-Origin`  
**Fix**: Ensure Flask server is running (should see CORS headers in `app.py`)

### Port already in use
**Error**: `Port 5000 is already in use`  
**Fix**: Change port in `app.py` → `app.run(port=5001)`

### No products showing
**Problem**: Empty grid on load  
**Fix**: Check browser console for API errors; verify Flask server running

---

## 📱 Mobile Testing

1. Open http://localhost:5173 on your phone
2. Or use browser dev tools → Device toolbar
3. Verify:
   - Sidebar stacks vertically on mobile
   - Product grid becomes 1 column
   - All filters remain functional
   - Touch interactions work smoothly

---

## 🎯 Key Interactions to Test

| Action | Expected Result |
|--------|----------------|
| Check category | Products filter instantly, badge updates |
| Move price slider | Results filter in real-time |
| Select rating | Only matching products show |
| Change sort order | Products rearrange (no reload) |
| Apply impossible filters | "No items match" screen appears |
| Click reset | All 100 products return |
| Toggle theme | Dark↔Light switch smoothly |
| Copy URL | Filters encoded in query params |

---

## 📚 Documentation Index

After verifying the system works, explore:

1. **README.md** → Complete architecture guide
2. **ARCHITECTURE_VERIFICATION.md** → Requirements proof
3. **EXECUTION_SUMMARY.md** → Project overview
4. **tests/test_filter_integration.py** → Test suite details

---

## 🎊 Success Criteria

You've successfully set up the system if:

✅ Backend responds to http://127.0.0.1:5000/api/products  
✅ Frontend loads at http://localhost:5173  
✅ Filtering works instantly (no submit button needed)  
✅ All 7 integration tests pass  
✅ Dark/light theme toggle works  
✅ Empty state appears with impossible filters  

---

## 🚀 Next Steps

**For Development**:
- Modify product data in `app.py` → `_generate_products()`
- Tweak UI colors in `ProductCatalog.jsx` → theme classes
- Add new filter types following existing pattern

**For Production**:
- Change Flask `debug=False` in `app.py`
- Build frontend: `npm run build`
- Serve `dist/` folder with production server
- Configure environment variables

---

## 💡 Pro Tips

1. **Browser DevTools** (F12) → Network tab → See filter API calls
2. **React DevTools** → Components tab → Inspect state changes
3. **URL Params** → Copy/paste to share filter combinations
4. **Theme Persistence** → Check localStorage for `marketplace-theme`
5. **Test Suite** → Read test cases to understand edge case handling

---

## 🎓 Learning Path

1. ✅ Run the app (you're here!)
2. → Explore README.md for architecture
3. → Read test suite to understand logic
4. → Review ARCHITECTURE_VERIFICATION.md for compliance proof
5. → Modify code to add custom features

---

**Ready to explore? Open http://localhost:5173 and start filtering! 🎉**

---

**Need help?** Check the **Troubleshooting** section above or review test cases in `tests/test_filter_integration.py` to understand expected behavior.
