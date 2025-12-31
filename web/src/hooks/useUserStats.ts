import { useState, useEffect } from 'react';

// Define the stats interface
export interface UserStats {
  total: number;
  admin: number;
  manufacturer: number;
  distributor: number;
  retailer: number;
  consumer: number;
  logistics: number;
  qualityControl: number;
  regulatoryCompliance: number;
}

// Custom hook to fetch user statistics from MongoDB
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/fetch-users');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch user stats');
        }
        
        // Process the data to get counts by role
        const roleCounts: Partial<UserStats> = {
          total: data.pagination.totalCount,
          admin: 0,
          manufacturer: 0,
          distributor: 0,
          retailer: 0,
          consumer: 0,
          logistics: 0,
          qualityControl: 0,
          regulatoryCompliance: 0
        };
        
        // Count roles
        data.data.forEach((user) => {
          switch (user.role) {
            case 'ADMIN_ROLE':
              roleCounts.admin = (roleCounts.admin || 0) + 1;
              break;
            case 'MANUFACTURER_ROLE':
              roleCounts.manufacturer = (roleCounts.manufacturer || 0) + 1;
              break;
            case 'DISTRIBUTOR_ROLE':
              roleCounts.distributor = (roleCounts.distributor || 0) + 1;
              break;
            case 'RETAILER_ROLE':
              roleCounts.retailer = (roleCounts.retailer || 0) + 1;
              break;
            case 'CONSUMER_ROLE':
              roleCounts.consumer = (roleCounts.consumer || 0) + 1;
              break;
            case 'LOGISTICS_ROLE':
              roleCounts.logistics = (roleCounts.logistics || 0) + 1;
              break;
            case 'QUALITY_CONTROL_ROLE':
              roleCounts.qualityControl = (roleCounts.qualityControl || 0) + 1;
              break;
            case 'REGULATORY_COMPLIANCE_ROLE':
              roleCounts.regulatoryCompliance = (roleCounts.regulatoryCompliance || 0) + 1;
              break;
          }
        });
        
        setStats(roleCounts as UserStats);
      } catch (err) {
        console.error('Error fetching user stats:', err);
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