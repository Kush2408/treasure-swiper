import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Skeleton, ChartSkeleton, MetricCardSkeleton } from "../components";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type SuctionSystemData, type SuctionSystemResponse, SuctionSystemService } from "../services/suctionSystemService";
import { useSSE } from "../hooks/useSSE";
import "../styles/suction-system.css";

export default function SuctionSystem() {
  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Use SSE for real-time data updates
  const { data: rawData, loading } = useSSE<SuctionSystemResponse>(SuctionSystemService.getSSEUrl(), {
    onMessage: (newData) => {
      console.log("Suction system data received via SSE:", newData);
    },
    onError: (error) => {
      console.error("SSE connection error for suction system:", error);
    }
  });

  // Normalize data to handle array response format
  const normalizeData = (rawData: SuctionSystemResponse | null): SuctionSystemData | null => {
    if (!rawData?.data) return null;
    
    // If data is an array, take the first element
    if (Array.isArray(rawData.data)) {
      return rawData.data[0] || null;
    }
    
    // If data is an object, return it directly (fallback)
    return rawData.data as SuctionSystemData;
  };

  const data = normalizeData(rawData);

  useEffect(() => {
    const onThemeChange = () => {
      // Recharts reads colors from props; force re-render by updating a dummy state
      // Since we're using SSE, we don't need to manually trigger re-renders
      console.log('Theme changed, charts will update automatically');
    };
    window.addEventListener('themechange', onThemeChange);
    return () => window.removeEventListener('themechange', onThemeChange);
  }, []);

  const formatChartData = (values: number[]) => {
    return values.map((value, index) => ({
      index,
      value,
    }));
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Dredger Alpha</h2>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-sm">Operational</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">System Status:</span>
              <span className="font-medium text-green-400">OPERATIONAL</span>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm font-medium">
              <i className="fas fa-ship mr-1"></i> Suction System
            </button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {/* {error && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-sm font-medium">Connection Error: {error}</span>
          </div>
        )}
        {!isConnected && !error && (
          <div className="bg-yellow-600 text-white px-4 py-2 flex items-center justify-center space-x-2">
            <i className="fas fa-spinner fa-spin"></i>
            <span className="text-sm font-medium">Connecting to real-time data stream...</span>
          </div>
        )}
        {isConnected && (
          <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-center space-x-2">
            <i className="fas fa-check-circle"></i>
            <span className="text-sm font-medium">Connected to real-time data stream</span>
          </div>
        )} */}

        {/* Status Overview */}
        <div className="p-4 border-b border-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-pipe text-green-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pipe Performance</div>
                  <div className="font-bold text-green-400">Normal</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-tools text-yellow-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Draghead & Cutter</div>
                  <div className="font-bold text-yellow-400">Warning</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-excavator text-green-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Excavation</div>
                  <div className="font-bold text-green-400">Active</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-water text-blue-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Flow Rate</div>
                  <div className="font-bold text-blue-400">{data?.pipe_performance?.suction_pipe_flow_rate || 0} m³/s</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-tachometer-alt text-green-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pressure</div>
                  <div className="font-bold text-green-400">{data?.pipe_performance?.suction_pipe_pressure || 0} bar</div>
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


        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Pipe Performance */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Pipe Performance</h3>
                <span className="text-sm text-gray-400">Real-time Monitoring</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-3">
                        <Skeleton variant="text" className="w-1/2 mb-2" />
                        <Skeleton variant="text" className="w-1/3" />
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">SUCTION DEPTH</div>
                      <div className="text-2xl font-bold text-blue-400">{data?.pipe_performance?.suction_depth || 0} m</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">SUCTION PIPE PRESSURE</div>
                      <div className="text-2xl font-bold text-green-400">{data?.pipe_performance?.suction_pipe_pressure || 0} bar</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">SUCTION PIPE FLOW RATE</div>
                      <div className="text-2xl font-bold text-yellow-400">{data?.pipe_performance?.suction_pipe_flow_rate || 0} m³/s</div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-3">
                        <Skeleton variant="text" className="w-1/2 mb-2" />
                        <Skeleton variant="text" className="w-1/3" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Alerts & Notifications</h3>
                <span className="text-sm text-gray-400">Active Alerts: 3/15</span>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-4 border-gray-600 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <Skeleton variant="text" className="w-32 mb-2" />
                            <Skeleton variant="text" className="w-24" />
                          </div>
                          <Skeleton variant="avatar" className="w-5 h-5 mr-2" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-gray-700 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-yellow-400">HIGH CUTTER TORQUE</div>
                          <div className="text-xs text-gray-400">2 min ago</div>
                        </div>
                        <div className="text-yellow-400 mr-1"><i className="fas fa-exclamation-circle"></i></div>
                      </div>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-gray-700 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-yellow-400">DRAGHEAD PRESSURE INCREASE</div>
                          <div className="text-xs text-gray-400">5 min ago</div>
                        </div>
                        <div className="text-yellow-400 mr-1"><i className="fas fa-exclamation-circle"></i></div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-500 pl-3 py-2 bg-gray-700 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-red-400">SUCTION PRESSURE FLUCTUATION</div>
                          <div className="text-xs text-gray-400">12 min ago</div>
                        </div>
                        <div className="text-red-400 mr-1"><i className="fas fa-exclamation-circle"></i></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-4 border-gray-600 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <Skeleton variant="text" className="w-32 mb-2" />
                            <Skeleton variant="text" className="w-24" />
                          </div>
                          <Skeleton variant="avatar" className="w-5 h-5 mr-2" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            {/* Draghead & Cutter */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Draghead & Cutter</h3>
                <span className="text-sm text-gray-400">System Analysis</span>
              </div>
              <div className="space-y-16">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/2 mb-4" />
                        <ChartSkeleton type="line" height="h-32" />
                        {i === 3 && (
                          <div className="bg-gray-700 rounded-lg p-3 mt-4">
                            <Skeleton variant="text" className="w-1/2 mb-1" />
                            <Skeleton variant="text" className="w-1/3" />
                            <Skeleton variant="card" className="h-2 rounded-full mt-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div>
                      <div className="text-sm mb-4">DRAGHEAD PRESSURE & FLOW</div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="140%">
                          <AreaChart data={formatChartData(data?.draghead_and_cutter?.draghead_pressure_and_flow || [])}>
                            <CartesianGrid strokeDasharray="3 3" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <XAxis dataKey="index" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <YAxis stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: getCssVar('--bg-secondary') || '#1f2937',
                                border: `1px solid ${getCssVar('--border-color') || '#374151'}`,
                                borderRadius: '6px',
                                color: getCssVar('--text-primary') || '#f9fafb'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#39ff14"
                              fill="#39ff14"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-4">CUTTER TORQUE & RPM</div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="140%">
                          <LineChart data={formatChartData(data?.draghead_and_cutter?.cutter_torque_and_rpm || [])}>
                            <CartesianGrid strokeDasharray="3 3" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <XAxis dataKey="index" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <YAxis stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: getCssVar('--bg-secondary') || '#1f2937',
                                border: `1px solid ${getCssVar('--border-color') || '#374151'}`,
                                borderRadius: '6px',
                                color: getCssVar('--text-primary') || '#f9fafb'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#ff3131"
                              strokeWidth={2}
                              dot={{ fill: '#ff3131', strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">SEABED RESISTANCE</div>
                      <div className="text-xl font-bold text-yellow-400">{data?.draghead_and_cutter?.["SEABED RESISTANCE"] || 0}</div>
                      <div className="h-2 bg-gray-600 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                          style={{ width: `${parseInt(String(data?.draghead_and_cutter?.["SEABED RESISTANCE"] || 0))}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/2 mb-4" />
                        <ChartSkeleton type="line" height="h-32" />
                        {i === 3 && (
                          <div className="bg-gray-700 rounded-lg p-3 mt-4">
                            <Skeleton variant="text" className="w-1/2 mb-1" />
                            <Skeleton variant="text" className="w-1/3" />
                            <Skeleton variant="card" className="h-2 rounded-full mt-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Excavation Control */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Excavation Control</h3>
                <span className="text-sm text-gray-400">Real-time</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <>
                    <div className="text-center">
                      <Skeleton variant="text" className="w-1/2 mb-2 mx-auto" />
                      <Skeleton variant="avatar" className="w-16 h-16 rounded-full mx-auto" />
                      <Skeleton variant="text" className="w-1/3 mx-auto mt-2" />
                    </div>
                    <div>
                      <Skeleton variant="text" className="w-full mb-4" />
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-700 rounded-lg p-3">
                            <Skeleton variant="text" className="w-1/2 mb-1" />
                            <Skeleton variant="text" className="w-1/3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Skeleton variant="text" className="w-full mb-2" />
                      <Skeleton variant="card" className="h-2 rounded-full" />
                      <div className="flex justify-between text-xs mt-2">
                        <Skeleton variant="text" className="w-8" />
                        <Skeleton variant="text" className="w-8" />
                      </div>
                    </div>
                  </>
                ) : data ? (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-center mb-2">GRAB POSITION</div>
                      <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                        <i className={`fas fa-${(data?.excavation_control?.grab_position?.toLowerCase() || 'closed') === 'closed' ? 'lock' : 'unlock'} text-2xl ${(data?.excavation_control?.grab_position?.toLowerCase() || 'closed') === 'closed' ? 'text-red-400' : 'text-green-400'}`}></i>
                      </div>
                      <div className="text-center mt-2 text-xs text-gray-400">{(data?.excavation_control?.grab_position || 'CLOSED').toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-center mb-4">BOOM/ARM/BUCKET ANGLES</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-center mb-1 text-gray-400">BOOM</div>
                          <div className="text-xl text-center font-bold text-green-400">{data?.excavation_control?.boom_arm_bucket_angles?.boom_angle || 0}°</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-center mb-1 text-gray-400">ARM</div>
                          <div className="text-xl text-center font-bold text-blue-400">{data?.excavation_control?.boom_arm_bucket_angles?.arm_angle || 0}°</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-center mb-1 text-gray-400">BUCKET</div>
                          <div className="text-xl text-center font-bold text-yellow-400">{data?.excavation_control?.boom_arm_bucket_angles?.bucket_angle || 0}°</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-center mb-2">EXCAVATION ACTIVITY</div>
                      <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 animate-pulse"
                          style={{ width: `${parseInt(String(data?.excavation_control?.boom_arm_bucket_angles?.EXCAVATION_ACTIVITY || 0))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2 text-gray-400">
                        <span>Idle</span>
                        <span>Active</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <Skeleton variant="text" className="w-1/2 mb-2 mx-auto" />
                      <Skeleton variant="avatar" className="w-16 h-16 rounded-full mx-auto" />
                      <Skeleton variant="text" className="w-1/3 mx-auto mt-2" />
                    </div>
                    <div>
                      <Skeleton variant="text" className="w-full mb-4" />
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-700 rounded-lg p-3">
                            <Skeleton variant="text" className="w-1/2 mb-1" />
                            <Skeleton variant="text" className="w-1/3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Skeleton variant="text" className="w-full mb-2" />
                      <Skeleton variant="card" className="h-2 rounded-full" />
                      <div className="flex justify-between text-xs mt-2">
                        <Skeleton variant="text" className="w-8" />
                        <Skeleton variant="text" className="w-8" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">System Status</h3>
                <span className="text-sm text-gray-400">Real-time</span>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton variant="avatar" className="w-8 h-8 mr-2" />
                          <Skeleton variant="text" className="w-20" />
                        </div>
                        <Skeleton variant="text" className="w-16" />
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mr-2">
                          <i className="fas fa-check text-green-400 text-xs"></i>
                        </div>
                        <span className="text-sm">Pipe System</span>
                      </div>
                      <div className="text-sm font-medium text-green-400">Normal</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mr-2">
                          <i className="fas fa-exclamation-triangle text-yellow-400 text-xs"></i>
                        </div>
                        <span className="text-sm">Cutter System</span>
                      </div>
                      <div className="text-sm font-medium text-yellow-400">Warning</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mr-2">
                          <i className="fas fa-check text-green-400 text-xs"></i>
                        </div>
                        <span className="text-sm">Excavation</span>
                      </div>
                      <div className="text-sm font-medium text-green-400">Active</div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton variant="avatar" className="w-8 h-8 mr-2" />
                          <Skeleton variant="text" className="w-20" />
                        </div>
                        <Skeleton variant="text" className="w-16" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - Trend Analysis */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Trend Analysis</h3>
            <div className="flex space-x-2">
              <button className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">1H</button>
              <button className="text-xs px-2 py-1 bg-green-600 rounded">30M</button>
              <button className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">15M</button>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <ChartSkeleton type="line" height="h-64" />
            ) : data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData(data?.trend_analysis?.suction_pressure || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                  <XAxis dataKey="index" stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                  <YAxis stroke={getCssVar('--text-secondary') || '#9ca3af'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: getCssVar('--bg-secondary') || '#1f2937',
                      border: `1px solid ${getCssVar('--border-color') || '#374151'}`,
                      borderRadius: '6px',
                      color: getCssVar('--text-primary') || '#f9fafb'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#39ff14"
                    strokeWidth={2}
                    dot={{ fill: '#39ff14', strokeWidth: 2, r: 3 }}
                    name="Suction Pressure"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton type="line" height="h-64" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}