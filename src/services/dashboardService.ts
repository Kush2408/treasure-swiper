import axios from "axios";

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Type definitions for the API response
export interface PerformanceMetrics {
  efficiency_performance_metrics: number[];
  power_output_trend: number[];
}

export interface Maintenance {
  next_service: string;
}

export interface MaintenanceUpdate {
  estimated_completion: string;
}

export interface DashboardData {
  engine_temperature: string;
  engine_rpm: string;
  power_output: string;
  load_sensor: string;
  depth_sensor: string;
  overall_health: number[];
  maintenance: Maintenance;
  maintenance_update: MaintenanceUpdate;
  performance_metrics: PerformanceMetrics;
}

export interface DashboardResponse {
  data: DashboardData[];
}

// Service functions
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardResponse>("/dashboard");
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error("No data received from API");
      }
      
      // Return the latest data entry
      return response.data.data[response.data.data.length - 1];
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  },

  // Method to test API connectivity
  // async testConnection(): Promise<boolean> {
  //   try {
  //     await api.get("/health");
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }
};

export default dashboardService;