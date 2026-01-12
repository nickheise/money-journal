# Status Page Features

## Overview

The `/status` page provides comprehensive insights into app performance, benchmarks, and system health. Accessible via the new Activity icon (⚡) in the bottom navigation bar.

## Tabs

### 1. Overview Tab
Real-time app statistics and performance monitoring:

**Quick Stats Cards:**
- Total Users
- Total Transactions
- Active Goals

**Performance Metrics (Live):**
- Frame Rate (FPS) - Updates every 5 seconds
- Memory Usage - Chrome DevTools memory API
- Animation Response Time - Target vs actual metrics

**System Information:**
- Browser details
- Platform
- Screen resolution
- Language

### 2. Benchmarks Tab
Detailed performance benchmarks across 6 categories:

#### Performance
- Target Frame Rate: 60 FPS
- Animation Response Time: < 33ms
- Transaction List Click Response: < 50ms  
- Page Transition Duration: 200-300ms

#### Mobile Optimization
- Hardware Acceleration: Enabled (CSS)
- Spring Animation Complexity: Stiffness ≤ 500
- Concurrent Animations: < 5 simultaneous
- List Animation Strategy: CSS-based

#### Bundle Size
- Motion Library: ~50KB gzipped
- Animation Code: ~2KB
- Total Animation Overhead: ~52KB

#### Accessibility
- Reduced Motion Support: WCAG 2.1 AA compliant
- Motion Sickness Prevention
- Focus Indicators

#### Data Persistence
- Storage Method: localStorage
- Storage Limit tracking
- Data Validation: Zod schemas

#### User Experience
- Multi-user Support: Unlimited
- Offline Functionality: 100%
- Age Target: 8-15 years optimized

### 3. Storage Tab
localStorage usage and data integrity:

**Storage Usage:**
- Visual progress bar showing KB used
- Real-time storage calculation
- Warning thresholds (1MB/5MB/10MB)

**Current User:**
- Active user name
- Transaction count
- Goal count

**All Users:**
- List of all users
- Emoji passwords displayed
- Per-user statistics

**Data Integrity Checks:**
✅ Zod schema validation  
✅ Offline-first architecture  
✅ No external dependencies  
✅ Session persistence  

## Status Indicators

### Performance Metrics
- 🟢 **Good**: Meeting or exceeding targets
- 🟡 **Warning**: Approaching limits
- 🔴 **Error**: Below acceptable threshold

### Benchmarks
- ✅ **Pass**: Meeting requirements
- ❌ **Fail**: Not meeting requirements
- ℹ️ **Unknown**: Status unavailable

## Technical Implementation

### Real-time Monitoring
- Performance metrics update every 5 seconds
- localStorage size recalculates on transaction/goal changes
- Memory usage tracked via Chrome Performance API

### Mobile-Optimized
- Responsive tabs for small screens
- Touch-friendly interactive elements
- Horizontal scroll for tab overflow

### Accessibility
- Color-coded status indicators
- Icon + text for all states
- Semantic HTML structure
- WCAG compliant color contrast

## Use Cases

### For Developers
- Monitor app performance in production
- Verify optimization efforts
- Track bundle size impact
- Debug storage issues

### For Users/Parents
- Understand data storage
- View system health
- Verify offline functionality
- Check multi-user setup

### For QA/Testing
- Performance regression testing
- Mobile performance validation
- Accessibility compliance verification
- Storage limit testing

## Future Enhancements

Potential additions:
- [ ] Export metrics as JSON
- [ ] Performance history/trends
- [ ] Network status monitoring
- [ ] Custom benchmark thresholds
- [ ] Performance alerts
- [ ] Detailed animation profiling
- [ ] A/B testing metrics
