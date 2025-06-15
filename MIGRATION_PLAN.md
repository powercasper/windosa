# 🚀 Migration Plan: Client-Side to Server-Side Calculations

## ✅ **Completed Infrastructure**

1. **Server API Endpoints** - ✅ Added to `server/routes/quotes.js`
   - `/api/quotes/calculate-item` - Single item pricing
   - `/api/quotes/calculate-quote-totals` - Quote totals with margins
   - `/api/quotes/calculate-type-metrics` - System type metrics
   - `/api/quotes/calculate-item-final-prices` - Final prices for PDF

2. **Client Service Layer** - ✅ Created `client/src/services/pricingService.js`
   - Abstracted all server API calls
   - Error handling and response parsing

3. **React Hooks** - ✅ Created `client/src/hooks/usePricing.js`
   - `usePricing()` - General purpose hook
   - `useItemPricing()` - Real-time item pricing with debouncing
   - `useQuoteTotals()` - Real-time quote totals

## 🎯 **Migration Steps (Safe & Incremental)**

### **Step 1: Add Server-Side Support (Dual Mode)**

**Goal**: Add server-side calculations alongside existing client logic
**Risk**: Low - No breaking changes

```javascript
// Example: Update PricingSummary.jsx to support both modes
const useDualModePricing = (items, additionalCosts) => {
  const [useServerCalculations] = useState(true); // Feature flag
  
  // Server-side calculation
  const { totals: serverTotals, loading } = useQuoteTotals(
    useServerCalculations ? items : null, 
    additionalCosts
  );
  
  // Client-side calculation (existing)
  const clientTotals = useMemo(() => {
    if (useServerCalculations) return null;
    return calculateClientTotals(items, additionalCosts);
  }, [items, additionalCosts, useServerCalculations]);
  
  return {
    totals: useServerCalculations ? serverTotals : clientTotals,
    loading,
    mode: useServerCalculations ? 'server' : 'client'
  };
};
```

### **Step 2: Migrate Real-Time Pricing**

**Goal**: Replace current item pricing with server calls
**Risk**: Low - Improved accuracy

```javascript
// Replace in PricingSummary.jsx
const PricingSummary = ({ configuration, ...props }) => {
  // OLD: Local calculation
  // const currentItemPrice = calculateItemPrice(configuration);
  
  // NEW: Server-side calculation with debouncing
  const { pricing: currentItemPrice, loading } = useItemPricing(configuration);
  
  return (
    <Box>
      {/* Show loading indicator during calculation */}
      {loading && <CircularProgress size={16} />}
      
      {/* Display price with server data */}
      <Typography variant="h6">
        {currentItemPrice ? formatCurrency(currentItemPrice.pricing.total) : '-'}
      </Typography>
    </Box>
  );
};
```

### **Step 3: Migrate Quote Totals**

**Goal**: Replace local quote calculations with server API
**Risk**: Low - Better consistency

```javascript
// Update quote totals calculation
const PricingSummary = ({ quoteItems, tariff, margin, shipping, delivery }) => {
  const additionalCosts = { tariff, shipping, delivery, margin };
  
  // NEW: Server-side totals
  const { totals, loading, error } = useQuoteTotals(quoteItems, additionalCosts);
  
  if (error) {
    console.warn('Server calculation failed, using fallback:', error);
    // Could fallback to client calculation if needed
  }
  
  return (
    <Box>
      {loading ? (
        <Skeleton variant="text" />
      ) : (
        <Typography>Total: ${totals?.totals.grandTotal || 0}</Typography>
      )}
    </Box>
  );
};
```

### **Step 4: Migrate Type Metrics**

**Goal**: Replace `calculateTypeMetrics` with server calls
**Risk**: Medium - Multiple components affected

```javascript
// Update Cost Order Details section
const CostOrderDetails = ({ items, additionalCosts }) => {
  const [typeMetrics, setTypeMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAllMetrics = async () => {
      setLoading(true);
      try {
        const metrics = await PricingService.calculateAllTypeMetrics(items, additionalCosts);
        setTypeMetrics(metrics);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (items.length > 0) {
      fetchAllMetrics();
    }
  }, [items, additionalCosts]);
  
  return (
    <Grid container spacing={3}>
      {['Windows', 'Sliding Doors', 'Entrance Doors'].map(type => (
        <Grid item xs={12} md={4} key={type}>
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <TypeMetricsCard metrics={typeMetrics[type]} />
          )}
        </Grid>
      ))}
    </Grid>
  );
};
```

### **Step 5: Migrate PDF Generation**

**Goal**: Use server calculations for PDF data
**Risk**: Medium - Complex data flow

```javascript
// Update PDF generation
const handleDownloadPDF = async () => {
  try {
    setIsGeneratingPDF(true);
    
    // NEW: Get final prices from server
    const result = await PricingService.calculateItemFinalPrices(
      pricing.items.map(({ item }) => item),
      { tariff, shipping, delivery, margin }
    );
    
    // Use server-calculated data for PDF
    await generateHybridPDF({
      ...quoteDialog.quote,
      items: result.items,
      totalArea: result.totalArea,
      additionalCosts: result.additionalCosts,
      // Server provides all calculated values
    });
    
  } catch (error) {
    console.error('PDF generation failed:', error);
  } finally {
    setIsGeneratingPDF(false);
  }
};
```

### **Step 6: Remove Client Calculations**

**Goal**: Clean up duplicate code
**Risk**: Low - All functionality moved to server

```javascript
// Remove these functions from PricingSummary.jsx:
// - calculateItemPrice()
// - calculateTypeMetrics()
// - calculateDistributedCosts()
// - All local pricing logic

// Keep only:
// - Server API calls
// - UI rendering
// - State management
```

## 🔧 **Implementation Steps**

### **Phase A: Preparation (0 Breaking Changes)**
```bash
# 1. Test server endpoints
curl -X POST http://localhost:5001/api/quotes/calculate-item \
  -H "Content-Type: application/json" \
  -d '{"item": {...}}'

# 2. Verify hooks work
import { useItemPricing } from './hooks/usePricing';
```

### **Phase B: Gradual Migration (1 Component at a Time)**
```javascript
// 1. Start with current item pricing (real-time updates)
const { pricing, loading } = useItemPricing(configuration);

// 2. Move to quote totals
const { totals } = useQuoteTotals(items, additionalCosts);

// 3. Update type metrics
const { calculateAllTypeMetrics } = usePricing();
```

### **Phase C: Full Migration (Remove Duplicate Code)**
```javascript
// Remove from PricingSummary.jsx:
// - calculateItemPrice function
// - calculateTypeMetrics function  
// - All local math operations

// Result: ~500 lines of code removed from client
// All calculations now server-side
```

## 🧪 **Testing Strategy**

### **Verification Steps**
1. **Before Migration**: Record all calculated values
2. **During Migration**: Compare server vs client results
3. **After Migration**: Verify identical outputs

### **Test Cases**
```javascript
// Test identical results
const testConfiguration = {
  systemType: 'Sliding Doors',
  systemModel: 'SMARTIA S650',
  operationType: 'OXXX',
  dimensions: { width: 216, height: 108 },
  glassType: 'XTREME 70/33 Maximum Light'
};

// Should produce identical results:
const serverResult = await PricingService.calculateItem(testConfiguration);
const clientResult = calculateItemPrice(testConfiguration);

console.assert(
  Math.abs(serverResult.pricing.total - clientResult.total) < 0.01,
  'Server and client calculations should match'
);
```

## 📊 **Benefits After Migration**

### **Immediate Benefits**
- ✅ **Single Source of Truth**: All calculations in one place
- ✅ **Consistency**: Identical results across all views
- ✅ **Maintainability**: Update logic in one location
- ✅ **Performance**: Reduced client bundle size

### **Long-term Benefits**
- ✅ **Caching**: Server can cache expensive calculations
- ✅ **Validation**: Server-side data validation
- ✅ **Monitoring**: Track calculation performance
- ✅ **Scalability**: Database-backed pricing rules

## 🚨 **Risk Mitigation**

### **Fallback Strategy**
```javascript
const useResilientPricing = (item) => {
  const [useServer, setUseServer] = useState(true);
  
  const serverResult = useItemPricing(item);
  const clientResult = useMemo(() => 
    useServer ? null : calculateItemPrice(item), [item, useServer]
  );
  
  // Auto-fallback on server error
  useEffect(() => {
    if (serverResult.error && useServer) {
      console.warn('Falling back to client calculation');
      setUseServer(false);
    }
  }, [serverResult.error, useServer]);
  
  return useServer ? serverResult : { pricing: clientResult };
};
```

## 🎯 **Next Steps**

1. **Test server endpoints** (5 minutes)
2. **Migrate current item pricing** (15 minutes)
3. **Migrate quote totals** (30 minutes)
4. **Migrate type metrics** (45 minutes)
5. **Update PDF generation** (30 minutes)
6. **Remove client calculations** (15 minutes)

**Total estimated time: ~2.5 hours**
**Risk level: Low** (incremental with fallbacks) 