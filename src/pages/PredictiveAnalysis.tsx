import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import "../styles/predictive.css";
import { predictiveAnalysisService } from "../services/predictiveAnalysisService";

////////////////////////

type SSEOptions<T> = {
  onOpen?: () => void;
  onMessage?: (data: T) => void;
  onError?: (err: any) => void;
  onClose?: () => void;
  setData: (data: T) => void;
  setIsConnected: (state: boolean) => void;
  setIsConnecting: (state: boolean) => void;
  setError: (err: string | null) => void;
  eventSourceRef: React.MutableRefObject<EventSource | null>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
};

export function connectToSSE<T = any>(
  url: string,
  options: SSEOptions<T>
): EventSource {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    setData,
    setIsConnected,
    setIsConnecting,
    setError,
    eventSourceRef,
    reconnectAttemptsRef
  } = options;

  const eventSource = new EventSource(url);
  eventSourceRef.current = eventSource;

  eventSource.onopen = () => {
    console.log(`✅ SSE connection opened: ${url}`);
    setIsConnected(true);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
    onOpen?.();
  };

  eventSource.onmessage = (event: MessageEvent) => {
    console.log(`📨 SSE message:`, event.data);
    try {
      const parsedData: T = JSON.parse(event.data);
      setData(normalizeApiData(parsedData) as T);
      onMessage?.(parsedData);
    } catch (err) {
      console.error("❌ Failed to parse SSE:", err, "Raw:", event.data);
      setError("Failed to parse server message");
      onError?.(err);
    }
  };

  eventSource.onerror = (err) => {
    console.error(`❌ SSE error:`, err);
    setError("Connection error");
    setIsConnected(false);
    onError?.(err);
    eventSource.close();
    onClose?.();
  };

  return eventSource;
}



///////////////////////


// TypeScript interfaces for API response sections
interface SystemOverview {
  engine_health: number;
  suction_efficiency: number;
  dredging_efficiency: number;
}

interface EngineHealthTrend {
  engine_health_trend: number[];
}

interface SuctionEfficiencyTrend {
  suction_efficiency_trend: number[];
}

interface DredgingPerformance {
  dredging_performance: number[];
}

interface EnginePropulsionHealth {
  thermal_stress_index: number;
  mechanical_efficiency: number;
  cooling_efficiency: number;
  propulsion_alignment: number;
}

interface SuctionSystemPerformance {
  pressure_fluctuation: number;
  cutter_resistance: number;
  turbidity_to_torque: number;
  flow_stability_factor: number;
}

interface PredictiveMaintenanceForecast {
  engine_health_score: number[];
}

interface PerformancePredictiveTrends {
  dredging_efficiency: number[];
  turbidity_efficiency: number[];
}

interface SystemDetailedMetrics {
  shaft_rpm: number[];
  engine_rpm: number[];
  bearing_temp: number[];
  pressure: number[];
  turbidity: number[];
  cutter_torque: number[];
}

interface PredictiveAnalysisData {
  system_overview: SystemOverview;
  engine_health_trend: EngineHealthTrend;
  suction_efficiency_trend: SuctionEfficiencyTrend;
  dredging_performance: DredgingPerformance;
  engine_propulsion_health: EnginePropulsionHealth;
  suction_system_performance: SuctionSystemPerformance;
  predictive_maintenance_forecast: PredictiveMaintenanceForecast;
  performance_predictive_trends: PerformancePredictiveTrends;
  system_detailed_metrics: SystemDetailedMetrics;
}


// Data normalization utility
const normalizeApiData = (raw: any): PredictiveAnalysisData | null => {
  if (!raw) return null;

  // If response is wrapped in a data array, take the first element
  if (Array.isArray(raw.data)) {
    return raw.data[0] || null;
  }

  // If response has a data property, use it
  if (raw.data) {
    return raw.data;
  }

  // If response is the data itself
  return raw;
};

export default function PredictiveAnalysis() {
  const [currentTime, setCurrentTime] = useState("00:00:00");

  // Initialize with dummy data
  const [data, setData] = useState<PredictiveAnalysisData | null>({
    "system_overview": {
      "engine_health": 0.00,
      "suction_efficiency": 0.00,
      "dredging_efficiency": 0.00
    },
    "engine_health_trend": {
      "engine_health_trend": [0.00]
    },
    "suction_efficiency_trend": {
      "suction_efficiency_trend": [0.00]
    },
    "dredging_performance": {
      "dredging_performance": [0.00]
    },
    "engine_propulsion_health": {
      "thermal_stress_index": 0.00,
      "mechanical_efficiency": 0.00,
      "cooling_efficiency": 0.00,
      "propulsion_alignment": 0.00
    },
    "suction_system_performance": {
      "pressure_fluctuation": 0.00,
      "cutter_resistance": 0.00,
      "turbidity_to_torque": 0.00,
      "flow_stability_factor": 0.00
    },
    "predictive_maintenance_forecast": {
      "engine_health_score": [0.00]
    },
    "performance_predictive_trends": {
      "dredging_efficiency": [0.00],
      "turbidity_efficiency": [0.00]
    },
    "system_detailed_metrics": {
      "shaft_rpm": [0.00],
      "engine_rpm": [0.00],
      "bearing_temp": [0.00],
      "pressure": [0.00],
      "turbidity": [0.00],
      "cutter_torque": [0.00]
    }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const handleConnect = () => {
    if (eventSourceRef.current) {
      console.log("⚠️ Already connected");
      return;
    }
    setIsConnecting(true);

    connectToSSE<PredictiveAnalysisData>(predictiveAnalysisService.getSSEUrl(), {
      onOpen: () => console.log("✅ Connected"),
      onMessage: (msg: PredictiveAnalysisData) => console.log("📩 Message:", msg),
      onError: (err: any) => console.log("❌ Error:", err),
      onClose: () => console.log("🔒 Closed"),
      setData,
      setIsConnected,
      setIsConnecting,
      setError,
      eventSourceRef,
      reconnectAttemptsRef
    });
  };


  //////////////////////////////




  // Chart registry for cleanup
  const charts: Record<string, ChartJS> = {};
  const reg = (id: string, ch: ChartJS): ChartJS => {
    charts[id]?.destroy();
    charts[id] = ch;
    return ch;
  };
  const destroyAll = () => Object.values(charts).forEach(c => c.destroy());

  console.log(data);

  useEffect(() => {
    // Update current time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    const timeInterval = setInterval(updateTime, 1000);
    updateTime();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    if (!data) return;

    // Initialize gauges with real API data
    const updateGauge = (gaugeElementId: string, value: number, valueElementId: string) => {
      const gauge = document.querySelector(`#${gaugeElementId} .gauge-fill`);
      const valueElement = document.getElementById(valueElementId);

      if (gauge && valueElement) {
        // Ensure value is between 0 and 1 for gauge rotation
        const safeValue = Math.max(0, Math.min(1, value));
        const rotation = 0.5 + (safeValue * 0.5);
        (gauge as HTMLElement).style.transform = `rotate(${rotation}turn)`;

        // Set the value display
        valueElement.textContent = safeValue.toFixed(3);
      }
    };

    // Update gauges with real API data
    if (data?.system_overview) {
      updateGauge('engine-health-gauge', data.system_overview.engine_health, 'engine-health-value');
      updateGauge('suction-efficiency-gauge', data.system_overview.suction_efficiency, 'suction-efficiency-value');
      updateGauge('overall-efficiency-gauge', data.system_overview.dredging_efficiency, 'overall-efficiency-value');
    }

    // Create trend charts with real API data
    const createTrendChart = (canvasId: string, _title: string, data: number[], color: string, predictionData: number[]) => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas element not found: ${canvasId}`);
        return;
      }

      const ctx = canvas.getContext('2d')!;
      const labels = Array.from({ length: data.length }, (_, i) => i);

      console.log(`Creating chart for ${canvasId} with data:`, data);

      return reg(canvasId, new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Actual',
              data: data,
              borderColor: color,
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 0
            },
            {
              label: 'Prediction',
              data: [...Array(data.length).fill(null), ...predictionData],
              borderColor: '#6B7280',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.3,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              min: 0,
              max: 1,
              ticks: {
                stepSize: 0.2
              }
            },
            x: {
              display: false
            }
          }
        }
      }));
    };

    const createMaintenanceForecastChart = (canvasId: string) => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      // Use real API data for maintenance forecast
      const forecastData = data?.predictive_maintenance_forecast?.engine_health_score || [0.8, 0.85, 0.9, 0.88, 0.92];

      return reg(canvasId, new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: forecastData.length }, (_, i) => i),
          datasets: [{
            label: 'Engine Health Score',
            data: forecastData,
            backgroundColor: gradient,
            borderColor: '#3B82F6',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              min: 0,
              max: 1,
              ticks: {
                stepSize: 0.2
              }
            }
          }
        }
      }));
    };

    const createPerformanceForecastChart = (canvasId: string) => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

      // Use real API data for performance trends
      const dredgingData = data?.performance_predictive_trends?.dredging_efficiency || [0.04, 0.045, 0.05, 0.048, 0.052];
      const turbidityData = data?.performance_predictive_trends?.turbidity_efficiency || [0.03, 0.035, 0.04, 0.038, 0.042];

      return reg(canvasId, new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: dredgingData.length }, (_, i) => i),
          datasets: [
            {
              label: 'Dredging Efficiency',
              data: dredgingData,
              backgroundColor: gradient,
              borderColor: '#10B981',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            },
            {
              label: 'Turbidity Efficiency',
              data: turbidityData,
              borderColor: '#F59E0B',
              borderWidth: 2,
              tension: 0.4,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              min: 0,
              max: 0.1,
              ticks: {
                stepSize: 0.02
              }
            }
          }
        }
      }));
    };

    const createDetailedChart = (canvasId: string, _title: string, datasets: any[]) => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;

      return reg(canvasId, new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 50 }, (_, i) => i),
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            x: {
              display: false
            }
          }
        }
      }));
    };

    // Create charts with real API data only
    // Engine Health Trend Chart
    let engineData: number[] = [];
    if (data?.engine_health_trend?.engine_health_trend && data.engine_health_trend.engine_health_trend.length > 0) {
      engineData = data.engine_health_trend.engine_health_trend;
    } else if (data?.system_overview?.engine_health) {
      engineData = [data.system_overview.engine_health];
    }

    if (engineData.length > 0) {
      createTrendChart(
        'engineHealthTrend',
        'Engine Health Trend',
        engineData,
        '#3B82F6',
        engineData.slice(-Math.min(15, engineData.length))
      );
    }

    // Suction Efficiency Trend Chart
    let suctionData: number[] = [];
    if (data?.suction_efficiency_trend?.suction_efficiency_trend && data.suction_efficiency_trend.suction_efficiency_trend.length > 0) {
      suctionData = data.suction_efficiency_trend.suction_efficiency_trend;
    } else if (data?.system_overview?.suction_efficiency) {
      suctionData = [data.system_overview.suction_efficiency];
    }

    if (suctionData.length > 0) {
      createTrendChart(
        'suctionEfficiencyTrend',
        'Suction Efficiency Trend',
        suctionData,
        '#10B981',
        suctionData.slice(-Math.min(15, suctionData.length))
      );
    }

    // Dredging Performance Chart
    let dredgingData: number[] = [];
    if (data?.dredging_performance?.dredging_performance && data.dredging_performance.dredging_performance.length > 0) {
      dredgingData = data.dredging_performance.dredging_performance;
    } else if (data?.system_overview?.dredging_efficiency) {
      dredgingData = [data.system_overview.dredging_efficiency];
    }

    if (dredgingData.length > 0) {
      createTrendChart(
        'dredgingPerformance',
        'Dredging Performance',
        dredgingData,
        '#8B5CF6',
        dredgingData.slice(-Math.min(15, dredgingData.length))
      );
    }

    // Create forecast charts
    createMaintenanceForecastChart('engineMaintenanceForecast');
    createPerformanceForecastChart('suctionPerformanceForecast');

    // Create detailed charts with real API data
    if (data?.system_detailed_metrics) {
      createDetailedChart('propulsionDetailedChart', 'Propulsion Metrics', [
        {
          label: 'Shaft RPM',
          data: data.system_detailed_metrics.shaft_rpm || [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: 'Engine RPM',
          data: data.system_detailed_metrics.engine_rpm || [],
          borderColor: '#10B981',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: 'Bearing Temp',
          data: data.system_detailed_metrics.bearing_temp || [],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        }
      ]);

      createDetailedChart('suctionDetailedChart', 'Suction Metrics', [
        {
          label: 'Pressure',
          data: data.system_detailed_metrics.pressure || [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: 'Turbidity',
          data: data.system_detailed_metrics.turbidity || [],
          borderColor: '#10B981',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: 'Cutter Torque',
          data: data.system_detailed_metrics.cutter_torque || [],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          pointRadius: 0
        }
      ]);
    }

    // No more random simulation - only use real API data
    // Gauges are updated once when data is received

    const onThemeChange = () => {
      destroyAll();
      // Charts will be rebuilt when data changes via SSE
      console.log('Theme changed, charts will update automatically');
    };
    window.addEventListener('themechange', onThemeChange);

    return () => {
      destroyAll();
      window.removeEventListener('themechange', onThemeChange);
    };
  }, [data]);
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <i className="fas fa-ship text-3xl"></i>
              <h1 className="text-2xl font-bold">Dredger Predictive Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleConnect} className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">Live</button>
              <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
              <span className="font-medium">{currentTime}</span>
            </div>
          </div>
        </header>

        {/* Connection Status Banner */}
        {error && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-sm font-medium">Connection Error: {error}</span>
          </div>
        )}


        {/* Main Content */}

        <main className="container mx-auto px-4 py-6">
          {/* System Overview */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark">System Overview</h2>
              <div className="flex space-x-2">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">Settings</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Engine Health Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-200">Engine Health</h3>
                  <i className="fas fa-engine text-blue-400"></i>
                </div>
                <div className="mt-2 text-center">
                  <div id="engine-health-gauge" className="gauge-container">
                    <div className="gauge-body">
                      <div className="gauge-fill"></div>
                      <div className="gauge-cover bg-gray-800">
                        <div id="engine-health-value" className="gauge-value text-gray-100">0.85</div>
                        <div className="text-xs font-medium text-gray-400">Score</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="bg-green-900 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Suction Efficiency Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-200">Suction Efficiency</h3>
                  <i className="fas fa-water text-green-400"></i>
                </div>
                <div className="mt-2 text-center">
                  <div id="suction-efficiency-gauge" className="gauge-container">
                    <div className="gauge-body">
                      <div className="gauge-fill"></div>
                      <div className="gauge-cover bg-gray-800">
                        <div id="suction-efficiency-value" className="gauge-value text-gray-100">0.72</div>
                        <div className="text-xs font-medium text-gray-400">Index</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="bg-green-900 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Overall Efficiency Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-200">Dredging Efficiency</h3>
                  <i className="fas fa-tachometer-alt text-purple-400"></i>
                </div>
                <div className="mt-2 text-center">
                  <div id="overall-efficiency-gauge" className="gauge-container">
                    <div className="gauge-body">
                      <div className="gauge-fill"></div>
                      <div className="gauge-cover bg-gray-800">
                        <div id="overall-efficiency-value" className="gauge-value text-gray-100">0.68</div>
                        <div className="text-xs font-medium text-gray-400">Index</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="bg-yellow-900 text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded">Good</span>
                  </div>
                </div>
              </div>

              {/* Alerts Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-200">System Alerts</h3>
                  <i className="fas fa-exclamation-triangle text-red-400"></i>
                </div>
                <div className="mt-4">
                  <div className="space-y-2">
                    {/* Warning Alert */}
                    <div className="flex items-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-yellow-500 rounded-full w-3 h-3"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 truncate">Thermal Stress Increasing</p>
                      </div>
                    </div>

                    {/* Normal Alert */}
                    <div className="flex items-center p-2 bg-green-900/20 rounded border border-green-700/30">
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-green-500 rounded-full w-3 h-3"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-500 truncate">Suction Flow Stable</p>
                      </div>
                    </div>

                    {/* Critical Alert */}
                    <div className="flex items-center p-2 bg-red-900/20 rounded border border-gray-700/30 alert-pulse">
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-red-500 rounded-full w-3 h-3"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-500 truncate">High Bearing Temperature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-200">Engine Health Trend</h3>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="chart-container" style={{ height: '200px', width: '100%' }}>
                  <canvas id="engineHealthTrend"></canvas>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-200">Suction Efficiency Trend</h3>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="chart-container" style={{ height: '200px', width: '100%' }}>
                  <canvas id="suctionEfficiencyTrend"></canvas>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-200">Dredging Performance</h3>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                </div>
                <div className="chart-container" style={{ height: '200px', width: '100%' }}>
                  <canvas id="dredgingPerformance"></canvas>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engine & Propulsion Health Section */}
            <section className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-200">Engine & Propulsion Health</h2>
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Last update: <span id="engine-update-time">2 sec ago</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Thermal Stress Index</span>
                    <span className="text-xs font-medium bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded">Warning</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.engine_propulsion_health?.thermal_stress_index?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-up text-yellow-400 mr-1"></i> 12%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-yellow-500 h-1 rounded-full" style={{ width: "62%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Mechanical Efficiency</span>
                    <span className="text-xs font-medium bg-green-900 text-green-300 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.engine_propulsion_health?.mechanical_efficiency?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-down text-green-400 mr-1"></i> 2%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "91%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Cooling Efficiency</span>
                    <span className="text-xs font-medium bg-green-900 text-green-300 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.engine_propulsion_health?.cooling_efficiency?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-equals text-gray-400 mr-1"></i> 0%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Propulsion Alignment</span>
                    <span className="text-xs font-medium bg-red-900 text-red-300 px-2 py-0.5 rounded">Critical</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.engine_propulsion_health?.propulsion_alignment?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-down text-red-400 mr-1"></i> 18%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-red-500 h-1 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Predictive Maintenance Forecast</h3>
                <div className="chart-container" style={{ height: '200px', width: '100%' }}>
                  <canvas id="engineMaintenanceForecast"></canvas>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center">
                  <i className="fas fa-cogs mr-2"></i> Optimize Engine
                </button>
                <button className="bg-gray-600 hover:bg-gray-300 text-gray-500 py-2 px-4 rounded flex items-center justify-center">
                  <i className="fas fa-file-alt mr-2"></i> Generate Report
                </button>
              </div>
            </section>

            {/* Suction System Performance Section */}
            <section className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-200">Suction System Performance</h2>
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Last update: <span id="suction-update-time">2 sec ago</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Pressure Fluctuation</span>
                    <span className="text-xs font-medium bg-green-900 text-green-300 px-2 py-0.5 rounded">Stable</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.suction_system_performance?.pressure_fluctuation?.toFixed(6) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-down text-green-400 mr-1"></i> 5%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Cutter Resistance</span>
                    <span className="text-xs font-medium bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded">Medium</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.suction_system_performance?.cutter_resistance?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-up text-yellow-400 mr-1"></i> 8%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-yellow-500 h-1 rounded-full" style={{ width: "47%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Turbidity to Torque</span>
                    <span className="text-xs font-medium bg-green-900 text-green-300 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.suction_system_performance?.turbidity_to_torque?.toFixed(6) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-caret-up text-green-400 mr-1"></i> 3%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Flow Stability Factor</span>
                    <span className="text-xs font-medium bg-green-900 text-green-300 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-100">
                      {data?.suction_system_performance?.flow_stability_factor?.toFixed(6) || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <i className="fas fa-equals text-gray-400 mr-1"></i> 0%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Performance & Predictive Trends</h3>
                <div className="chart-container" style={{ height: '200px', width: '100%' }}>
                  <canvas id="suctionPerformanceForecast"></canvas>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center">
                  <i className="fas fa-tint-slash mr-2"></i> Adjust Flow
                </button>
                <button className="bg-gray-600 hover:bg-gray-300 text-gray-500 py-2 px-4 rounded flex items-center justify-center">
                  <i className="fas fa-file-alt mr-2"></i> Generate Report
                </button>
              </div>
            </section>
          </div>

          {/* Detailed Charts Section */}
          <section className="mt-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-200">System Detailed Metrics</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select className="appearance-none bg-gray-700 border border-gray-600 rounded py-1 px-3 pr-8 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Last 1 Hour</option>
                      <option selected>Last 6 Hours</option>
                      <option>Last 24 Hours</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="chart-container" style={{ height: '300px', width: '100%' }}>
                  <canvas id="propulsionDetailedChart"></canvas>
                </div>
                <div className="chart-container" style={{ height: '300px', width: '100%' }}>
                  <canvas id="suctionDetailedChart"></canvas>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
