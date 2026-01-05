# Recharts CSS/Sizing Bug Report

**Date**: 2026-01-04  
**Component**: `SectorialReportView.tsx`  
**Issue**: Persistent Recharts width(-1) and height(-1) errors  
**Status**: UNRESOLVED

## Problem Description

The Informes Sectoriales page displays Recharts console errors when rendering report charts:

```
The width(-1) and height(-1) of chart should be greater than 0,
please check the style of container, or the props width(100%) and height(100%),
or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
height and width.
```

### Error Frequency
- Occurs on initial page load
- Appears for both AreaChart and PieChart components
- Persists across multiple attempted fixes

## Affected Code

**File**: `lawflow_frontend/src/ui/SectorialReportView.tsx`

### AreaChart (Lines ~81-101)
```tsx
<div style={{ height: 300 }}>
    <h3>Evolución (Histórico)</h3>
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.priceData}>
            {/* chart configuration */}
        </AreaChart>
    </ResponsiveContainer>
</div>
```

### PieChart (Lines ~135-154)
```tsx
<div style={{ height: 350 }}>
    <h3>Distribución del Mercado</h3>
    <ResponsiveContainer width="100%" height="80%">
        <PieChart>
            {/* chart configuration */}
        </PieChart>
    </ResponsiveContainer>
</div>
```

### Parent Layout Context
Both charts are within a CSS Grid layout:
```tsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
    {/* AreaChart container */}
    {/* Other content */}
</div>

<div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
    {/* Table */}
    {/* PieChart container */}
</div>
```

## Root Cause Analysis

The issue appears to be a **timing problem** where `ResponsiveContainer` attempts to measure its parent container's dimensions before the CSS Grid has finished calculating the layout. This results in:

1. ResponsiveContainer queries parent dimensions
2. Parent container returns -1 (not yet calculated)
3. Recharts attempts to render with invalid dimensions
4. Error is logged to console

### Why This Happens
- CSS Grid uses fractional units (`1fr`, `1.5fr`) that require layout calculation
- ResponsiveContainer uses `ResizeObserver` or similar to detect parent size
- The measurement happens before the grid layout is finalized
- React's render cycle completes before browser layout is complete

## Attempted Solutions

### Attempt 1: Add minWidth/minHeight to ResponsiveContainer
**Status**: ❌ Failed

```tsx
<ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
```

**Result**: Errors persisted. The `minWidth`/`minHeight` props don't prevent the initial measurement from returning -1.

---

### Attempt 2: Nested Container with Explicit Dimensions
**Status**: ❌ Failed

```tsx
<div style={{ height: 300, minHeight: 300, width: '100%', position: 'relative', overflow: 'hidden' }}>
    <h3>Evolución (Histórico)</h3>
    <div style={{ width: '100%', height: 'calc(100% - 40px)', minHeight: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.priceData}>
```

**Rationale**: Provide explicit parent dimensions with nested wrapper using `calc()` to account for heading.

**Result**: Errors persisted. Even with explicit dimensions, the grid layout timing issue remained.

---

### Attempt 3: Fixed Pixel Dimensions (No ResponsiveContainer)
**Status**: ❌ Failed

```tsx
<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
    <AreaChart width={600} height={250} data={data.priceData}>
```

**Rationale**: Eliminate ResponsiveContainer entirely and use fixed pixel dimensions.

**Result**: Errors persisted. This suggests the issue may not be solely with ResponsiveContainer but potentially with how Recharts initializes within the grid layout.

---

## Technical Details

### Browser Environment
- Chrome (version not specified)
- Vite dev server on port 5173
- React with TypeScript

### Recharts Version
- Imported from `recharts` package
- Version: (check package.json)

### Component Hierarchy
```
App.tsx
└── SectorialReportView (when view === "Sectorial Report")
    └── report-container (ref for PDF export)
        └── section (grid layout)
            └── chart containers
                └── ResponsiveContainer
                    └── AreaChart/PieChart
```

## Potential Solutions to Explore

### 1. Debounced Rendering with useEffect
```tsx
const [isReady, setIsReady] = useState(false);

useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
}, []);

return isReady ? <ResponsiveContainer>...</ResponsiveContainer> : <div>Loading...</div>;
```

### 2. Use `aspect` Prop Instead of height
```tsx
<ResponsiveContainer width="100%" aspect={2.4}>
    <AreaChart data={data.priceData}>
```

### 3. CSS Grid with minmax()
```tsx
<div style={{ display: "grid", gridTemplateColumns: "minmax(400px, 1fr) minmax(300px, 1fr)", gap: 32 }}>
```

### 4. Flexbox Instead of Grid
```tsx
<div style={{ display: "flex", gap: 32 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
        {/* AreaChart */}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
        {/* Other content */}
    </div>
</div>
```

### 5. Upgrade/Downgrade Recharts
- Check if this is a known issue in the current version
- Try different Recharts versions
- Consider alternative charting libraries (Chart.js, Victory, Nivo)

### 6. Force Reflow Before Rendering
```tsx
useLayoutEffect(() => {
    if (reportRef.current) {
        // Force browser to calculate layout
        reportRef.current.offsetHeight;
    }
}, []);
```

### 7. IntersectionObserver Approach
Only render charts when they're visible in viewport:
```tsx
const [isVisible, setIsVisible] = useState(false);
const chartRef = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            setIsVisible(true);
        }
    });
    
    if (chartRef.current) {
        observer.observe(chartRef.current);
    }
    
    return () => observer.disconnect();
}, []);
```

## Impact Assessment

### User Experience
- ⚠️ Console errors visible in DevTools (developer concern)
- ✅ Charts appear to render correctly after initial error
- ✅ No visual glitches reported
- ✅ PDF export functionality unaffected

### Severity
**Low-Medium**: The errors are cosmetic (console warnings) and don't appear to break functionality, but they indicate a timing/initialization issue that could potentially cause problems in certain scenarios.

## Next Steps

1. **Verify Recharts version** in package.json
2. **Test with different browsers** (Firefox, Safari) to see if issue is browser-specific
3. **Try the debounced rendering approach** (Solution #1)
4. **Consider switching to `aspect` prop** (Solution #2)
5. **Investigate if this is a known Recharts issue** on GitHub
6. **Profile the component** to understand exact timing of dimension calculations

## References

- Recharts Documentation: https://recharts.org/
- ResponsiveContainer API: https://recharts.org/en-US/api/ResponsiveContainer
- Related GitHub Issues: (to be added after research)

## Notes

- The issue persists even with fixed pixel dimensions, suggesting it may be related to how Recharts initializes its internal state
- The charts DO eventually render correctly, indicating the error is during initial mount only
- May be related to React 18's concurrent rendering or Vite's HMR
