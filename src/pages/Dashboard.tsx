import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Loader, Skeleton, ChartSkeleton, MetricCardSkeleton, Spinner } from "../components";
import { dashboardService, type DashboardData } from "../services/dashboardService";
import "../services/forcerefreshservice";
import "../styles/dashboard.css";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const portLocationChartRef = useRef<HTMLCanvasElement | null>(null);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const gaugeValueRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<SVGTextElement | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching dashboard data...");
      const dashboardData = await dashboardService.getDashboardData();
      
      console.log("Dashboard data received:", dashboardData);
      setData(dashboardData);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Still set data to null and loading to false to show skeletons
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    let chart: Chart | null = null;
    let portLocationChart: Chart | null = null;

    // Performance Metrics Chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [
              { 
                label: 'Efficiency', 
                data: data.performance_metrics.efficiency_performance_metrics, 
                borderColor: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderWidth: 2, 
                tension: 0.4, 
                fill: true 
              },
              { 
                label: 'Power Output', 
                data: data.performance_metrics.power_output_trend, 
                borderColor: '#3b82f6', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                borderWidth: 2, 
                tension: 0.4, 
                fill: true 
              }
            ]
          },
          options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
              legend: { 
                position: 'top', 
                labels: { 
                  color: '#e5e7eb', 
                  font: { family: 'Roboto Mono' } 
                } 
              } 
            },
            scales: {
              x: { 
                grid: { color: 'rgba(75, 85, 99, 0.3)' }, 
                ticks: { color: '#9ca3af' } 
              },
              y: { 
                grid: { color: 'rgba(75, 85, 99, 0.3)' }, 
                ticks: { color: '#9ca3af' } 
              }
            }
          }
        });
      }
    }

    // Port Location Chart
    if (portLocationChartRef.current) {
      const ctx = portLocationChartRef.current.getContext("2d");
      if (ctx) {
        const generateVesselData = () => {
          const baseLat = 51.8875;
          const baseLon = 4.3575;
          const positions = [];
          
          const healthData = data.overall_health || [85, 87, 89, 88, 90, 92, 91];
          
          for (let i = 0; i < healthData.length; i++) {
            const health = healthData[i];
            const stability = health / 100;
            const latVariation = (Math.random() - 0.5) * 0.001 * (1 - stability);
            const lonVariation = (Math.random() - 0.5) * 0.001 * (1 - stability);
            
            positions.push({
              lat: baseLat + latVariation,
              lon: baseLon + lonVariation,
              timestamp: `${i * 4}:00`
            });
          }
          
          return positions;
        };

        const vesselData = generateVesselData();
        
        portLocationChart = new Chart(ctx, {
          type: "scatter",
          data: {
            datasets: [
              {
                label: 'Vessel Position',
                data: vesselData.map((pos) => ({
                  x: pos.lon,
                  y: pos.lat
                })),
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
              },
              {
                label: 'Port Location',
                data: [{
                  x: 4.3575,
                  y: 51.8875
                }],
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointStyle: 'rect'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#e5e7eb',
                  font: { family: 'Roboto Mono' }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const dataIndex = context.dataIndex;
                    if (context.datasetIndex === 0 && vesselData[dataIndex]) {
                      return `Vessel: ${vesselData[dataIndex].timestamp}`;
                    }
                    return 'Port Location';
                  }
                }
              }
            },
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: 'Longitude',
                  color: '#9ca3af'
                },
                grid: { color: 'rgba(75, 85, 99, 0.3)' },
                ticks: { color: '#9ca3af' }
              },
              y: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Latitude',
                  color: '#9ca3af'
                },
                grid: { color: 'rgba(75, 85, 99, 0.3)' },
                ticks: { color: '#9ca3af' }
              }
            }
          }
        });
      }
    }

    const interval = setInterval(() => {
      if (gaugeValueRef.current) {
        const healthValue = data.overall_health && data.overall_health.length > 0 
          ? data.overall_health[data.overall_health.length - 1] 
          : 85;
        gaugeValueRef.current.textContent = `${healthValue}%`;
      }
      if (progressCircleRef.current && progressTextRef.current) {
        const progress = parseInt(data.maintenance.next_service) || 72;
        const circumference = 251.2;
        const offset = circumference - (progress / 100) * circumference;
        progressCircleRef.current.style.strokeDashoffset = `${offset}`;
        progressTextRef.current.textContent = `${progress}%`;
      }
    }, 5000);

    return () => { 
      clearInterval(interval); 
      if (chart) chart.destroy(); 
      if (portLocationChart) portLocationChart.destroy();
    };
  }, [data]);

  return (
    <div className="min-h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">
        {/* Loading Banner */}
        {loading && (
          <div className="bg-gray-600 text-white px-4 py-2 flex items-center justify-center space-x-2 mb-4 rounded-lg">
            <Loader variant="dots" size="sm" color="secondary" />
            <span className="text-sm font-medium">Loading dashboard data...</span>
          </div>
        )}

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 relative z-10">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : data ? (
            <>
              <div className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-temperature-low text-green-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">ENGINE TEMP</div>
                  <div className="text-xl font-bold text-green-400">{data.engine_temperature}°C</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-tachometer-alt text-blue-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">RPM</div>
                  <div className="text-xl font-bold text-blue-400">{data.engine_rpm}</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-battery-three-quarters text-yellow-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">POWER</div>
                  <div className="text-xl font-bold text-yellow-400">{data.power_output}%</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-weight-hanging text-purple-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">LOAD</div>
                  <div className="text-xl font-bold text-purple-400">{data.load_sensor}%</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-water text-blue-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">DEPTH</div>
                  <div className="text-xl font-bold text-blue-400">{data.depth_sensor}m</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          )}
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Overall Health Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Overall Health</h3>
              <i className="fas fa-ship text-green-400"></i>
            </div>

            <div className="flex justify-center">
              {!data ? (
                <div className="flex items-center justify-center w-32 h-32">
                  <Spinner variant="dual-ring" size="xl" color="success" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-gray-700"
                      fill="transparent"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      className="text-green-500"
                      strokeDasharray="282.6"
                      strokeDashoffset={data.overall_health && data.overall_health.length > 0 ? 282.6 - (data.overall_health[data.overall_health.length - 1] / 100) * 282.6 : 50}
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-green-400">
                    {data.overall_health && data.overall_health.length > 0 ? `${data.overall_health[data.overall_health.length - 1]}%` : '82%'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-sm">
              <div className="flex justify-between">
                <span className="text-green-400">Optimal</span>
                <span className="text-yellow-400">Warning</span>
                <span className="text-red-400">Critical</span>
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Alerts</h3>
              <div className="relative">
                <i className="fas fa-bell text-yellow-400"></i>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold pulse">3</span>
              </div>
            </div>
            <div className="space-y-3">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton variant="avatar" className="w-2 h-2 rounded-full mt-1.5 mr-2" />
                      <div className="flex-1">
                        <Skeleton variant="text" className="w-24 mb-1" />
                        <Skeleton variant="text" className="w-16" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-100">Engine Temp High</div>
                      <div className="text-xs text-gray-400">2 min ago</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-100">Fuel Level Low</div>
                      <div className="text-xs text-gray-400">15 min ago</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-100">Pressure Fluctuation</div>
                      <div className="text-xs text-gray-400">42 min ago</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Maintenance</h3>
              <i className="fas fa-tools text-blue-400"></i>
            </div>
            {loading ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton variant="text" className="w-20" />
                    <Skeleton variant="text" className="w-8" />
                  </div>
                  <Skeleton variant="card" className="h-2 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-700 rounded p-2">
                      <Skeleton variant="text" className="w-16 mb-1" />
                      <Skeleton variant="text" className="w-12" />
                    </div>
                  ))}
                </div>
              </>
            ) : data ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1 text-gray-300">
                    <span>Next Service</span>
                    <span>{data.maintenance.next_service}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.maintenance.next_service}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-300">Oil Change</div>
                    <div className="font-bold text-gray-100">Due in 14d</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-300">Filter Check</div>
                    <div className="font-bold text-gray-100">Due in 7d</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-300">System Scan</div>
                    <div className="font-bold text-gray-100">Running</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-300">Hull Inspect</div>
                    <div className="font-bold text-gray-100">OK</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton variant="text" className="w-20" />
                    <Skeleton variant="text" className="w-8" />
                  </div>
                  <Skeleton variant="card" className="h-2 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-700 rounded p-2">
                      <Skeleton variant="text" className="w-16 mb-1" />
                      <Skeleton variant="text" className="w-12" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Maintenance Update Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Maintenance Update</h3>
              <i className="fas fa-sync-alt text-green-400"></i>
            </div>
            <div className="flex justify-center mb-4">
              {!data ? (
                <div className="flex items-center justify-center w-24 h-24">
                  <Spinner variant="dual-ring" size="lg" color="success" />
                </div>
              ) : (
                <svg className="progress-ring" viewBox="0 0 100 100">
                  <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <circle 
                    ref={progressCircleRef} 
                    className="progress-ring-circle text-green-500" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={parseInt(data.maintenance.next_service) ? 251.2 - (parseInt(data.maintenance.next_service) / 100) * 251.2 : 75.36} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <text 
                    ref={progressTextRef as any} 
                    x="50" 
                    y="50" 
                    textAnchor="middle" 
                    dy=".3em" 
                    className="text-xl font-bold fill-current text-green-400"
                  >
                    {data.maintenance.next_service}%
                  </text>
                </svg>
              )}
            </div>
            <div className="text-center text-sm">
              {!data ? (
                <div className="flex flex-col items-center space-y-2">
                  <Spinner variant="pulse-dots" size="sm" color="success" />
                  <div className="text-gray-400 text-xs">Loading update status...</div>
                </div>
              ) : (
                <>
                  <div className="mb-1 text-gray-100">System Update in Progress</div>
                  <div className="text-gray-400">Estimated completion: {data.maintenance_update.estimated_completion}min</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-64">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Performance Metrics</h3>
              <i className="fas fa-chart-bar text-blue-400"></i>
            </div>
            <div className="relative h-48">
              {loading ? (
                <ChartSkeleton type="line" height="h-40" />
              ) : data ? (
                <canvas ref={chartRef} />
              ) : (
                <ChartSkeleton type="line" height="h-40" />
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-64">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Port Location</h3>
              <i className="fas fa-map-marked-alt text-green-400"></i>
            </div>
            <div className="relative h-48">
              {loading ? (
                <ChartSkeleton type="line" height="h-40" />
              ) : data && data.overall_health && data.overall_health.length > 0 ? (
                <canvas ref={portLocationChartRef} />
              ) : (
                <ChartSkeleton type="line" height="h-40" />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center h-28 border border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-cogs text-green-400"></i>
            </div>
            <div className="text-xs text-center font-medium text-gray-100">Engine & Propulsion</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center h-28 border border-gray-700">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-arrow-down text-blue-400"></i>
            </div>
            <div className="text-xs text-center font-medium text-gray-100">Suction System</div>
          </div>
        </div>
      </div>
    </div>
  );
}