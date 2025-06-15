import React from 'react';

// Performance monitoring and analytics for the pricing system
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: {},
      cacheHits: 0,
      cacheMisses: 0,
      userActions: {},
      errors: [],
      loadTimes: {}
    };
    this.startTime = Date.now();
  }

  // Track API call performance
  trackApiCall(endpoint, duration, success = true) {
    if (!this.metrics.apiCalls[endpoint]) {
      this.metrics.apiCalls[endpoint] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        successCount: 0,
        errorCount: 0
      };
    }

    const metric = this.metrics.apiCalls[endpoint];
    metric.count++;
    metric.totalDuration += duration;
    metric.averageDuration = metric.totalDuration / metric.count;
    
    if (success) {
      metric.successCount++;
    } else {
      metric.errorCount++;
    }

    console.log(`📊 API Performance: ${endpoint} took ${duration}ms (avg: ${metric.averageDuration.toFixed(1)}ms)`);
  }

  // Track cache performance
  trackCacheHit(key) {
    this.metrics.cacheHits++;
    console.log(`🎯 Cache HIT for ${key} (total hits: ${this.metrics.cacheHits})`);
  }

  trackCacheMiss(key) {
    this.metrics.cacheMisses++;
    console.log(`❌ Cache MISS for ${key} (total misses: ${this.metrics.cacheMisses})`);
  }

  // Track user actions
  trackUserAction(action, details = {}) {
    if (!this.metrics.userActions[action]) {
      this.metrics.userActions[action] = 0;
    }
    this.metrics.userActions[action]++;
    
    console.log(`👤 User Action: ${action}`, details);
  }

  // Track errors
  trackError(error, context) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.errors.push(errorData);
    console.error('🚨 Error Tracked:', errorData);
  }

  // Track component load times
  trackLoadTime(component, duration) {
    this.metrics.loadTimes[component] = duration;
    console.log(`⏱️ ${component} loaded in ${duration}ms`);
  }

  // Get performance summary
  getSummary() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    const totalApiCalls = Object.values(this.metrics.apiCalls).reduce((sum, api) => sum + api.count, 0);
    const averageApiTime = Object.values(this.metrics.apiCalls).reduce((sum, api) => sum + api.averageDuration, 0) / Object.keys(this.metrics.apiCalls).length;

    return {
      sessionDuration: Date.now() - this.startTime,
      totalApiCalls,
      averageApiTime: averageApiTime || 0,
      cacheHitRate: cacheHitRate || 0,
      totalErrors: this.metrics.errors.length,
      topUserActions: Object.entries(this.metrics.userActions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      apiPerformance: this.metrics.apiCalls
    };
  }

  // Export metrics for analysis
  exportMetrics() {
    const summary = this.getSummary();
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-performance-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance monitoring decorator for API calls
export const withPerformanceMonitoring = (apiCall, endpoint) => {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await apiCall(...args);
      const duration = Date.now() - startTime;
      performanceMonitor.trackApiCall(endpoint, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.trackApiCall(endpoint, duration, false);
      performanceMonitor.trackError(error, { endpoint, args });
      throw error;
    }
  };
};

// Performance hooks for React components
export const usePerformanceTracking = (componentName) => {
  const startTime = React.useRef(Date.now());
  
  React.useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    performanceMonitor.trackLoadTime(componentName, loadTime);
  }, [componentName]);

  const trackAction = (action, details) => {
    performanceMonitor.trackUserAction(`${componentName}.${action}`, details);
  };

  return { trackAction };
}; 