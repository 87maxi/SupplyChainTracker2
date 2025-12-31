import { useState, useEffect } from 'react';

// Define the stats interface
export interface NetbookStats {
  total: number;
  production: number;
  distribution: number;
  retail: number;
  sold: number;
}

// Custom hook to fetch netbook statistics from MongoDB
export function useNetbookStats() {
  const [stats, setStats] = useState<NetbookStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/fetch-netbooks');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch netbook stats');
        }
        
        // Process the data to get counts by status
        const statusCounts: Partial<NetbookStats> = {
          total: data.pagination.totalCount,
          production: 0,
          distribution: 0,
          retail: 0,
          sold: 0
        };
        
        // Count statuses
        data.data.forEach((netbook: any) => {
          switch (netbook.status) {
            case 'production':
              statusCounts.production = (statusCounts.production || 0) + 1;
              break;
            case 'distribution':
              statusCounts.distribution = (statusCounts.distribution || 0) + 1;
              break;
            case 'retail':
              statusCounts.retail = (statusCounts.retail || 0) + 1;
              break;
            case 'sold':
              statusCounts.sold = (statusCounts.sold || 0) + 1;
              break;
          }
        });
        
        setStats(statusCounts as NetbookStats);
      } catch (err) {
        console.error('Error fetching netbook stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { stats, isLoading, error };
}