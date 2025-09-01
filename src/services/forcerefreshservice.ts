import axios from "axios";

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance for force refresh
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for force refresh
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export interface ForceRefreshResponse {
  message: string;
  timestamp: number;
}

class ForceRefreshService {
  private intervalId: number | null = null;

  /**
   * Start automatic force refresh every 2 minutes
   */
  startAutoRefresh(): void {
    this.stopAutoRefresh(); // Clear any existing interval

    const refreshInterval = 2 * 60 * 1000; // 2 minutes in milliseconds

    this.intervalId = setInterval(async () => {
      try {
        await this.forceRefresh();
      } catch (error) {
        console.error("Auto force refresh failed:", error);
      }
    }, refreshInterval);

    console.log("Auto force refresh started - will refresh every 2 minutes (Service ID:", Math.random().toString(36).substr(2, 9), ")");
  }

  /**
   * Stop automatic force refresh
   */
  stopAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("Auto force refresh stopped");
  }

  /**
   * Trigger force refresh
   */
  private async forceRefresh(): Promise<ForceRefreshResponse> {
    try {
      console.log("Triggering automatic force refresh... (URL: force-refresh)");
      
      const response = await api.post<ForceRefreshResponse>("force-refresh");
      
      console.log("Auto force refresh successful:", response.data.message);
      return response.data;

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Force refresh failed";
      console.error("Auto force refresh failed:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if auto refresh is active
   */
  isAutoRefreshActive(): boolean {
    return this.intervalId !== null;
  }
}

// Create singleton instance
export const forceRefreshService = new ForceRefreshService();

// Auto-start the service when imported
if (typeof window !== 'undefined') {
  // Start auto refresh when the service is imported
  forceRefreshService.startAutoRefresh();
  
  // Stop auto refresh when page is unloaded
  window.addEventListener('beforeunload', () => {
    forceRefreshService.stopAutoRefresh();
  });
}

export default forceRefreshService;