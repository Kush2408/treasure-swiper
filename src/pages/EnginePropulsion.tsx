import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Skeleton,
  ChartSkeleton,
  MetricCardSkeleton,
  // GaugeSkeleton,
  Spinner
} from "../components";
import "../styles/engine.propulsion.css";
import Chart from "chart.js/auto";
import { getEnginePropulsion } from "../services/engineservice";

interface Overview {
  engine_rpm: number;
  shaft_rpm: number;
  thruster_rpm: number;
  turbocharger_rpm: number;
  thruster_load: number;
  system_health: number;
}

interface TemperatureAndPressure {
  exhaust_gas_temp: number[];
  cooling_water_temp: number[];
  lube_oil_temp: number[];
  fuel_pressure: number[];
  lube_oil_pressure: number[];
  thruster_hyd_pressure: number[];
}

interface VibrationAndBearing {
  engine_vibration: number[];
  shaft_bearing_vibration: number[];
  bearing_temperatures: number[];
}

interface TrendAnalysis {
  engine_rpm: number[];
  shaft_rpm: number[];
}

interface EnginePropulsionData {
  overview: Overview;
  temperature_and_pressure: TemperatureAndPressure;
  vibration_and_bearing: VibrationAndBearing;
  trend_analysis: TrendAnalysis;
}

export default function EnginePropulsion() {
  const [data, setData] = useState<EnginePropulsionData | null>(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const charts: Record<string, Chart> = {};

    const reg = (id: string, ch: Chart) => {
      charts[id]?.destroy();
      charts[id] = ch;
    };

    const destroyAll = () => {
      Object.values(charts).forEach(c => c.destroy());
    };

    const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const toRgba = (hexOrRgb: string, alpha: number) => {
      const c = hexOrRgb;
      if (c.startsWith('#')) {
        const bigint = parseInt(c.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      if (c.startsWith('rgb')) {
        return c.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
      return c;
    };

    const line = (id: string, data: number[], color: string) => {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      Chart.getChart(el)?.destroy();

      const textColor = getCssVar('--text-secondary') || '#9ca3af';
      const gridColor = toRgba(getCssVar('--text-secondary') || '#9ca3af', 0.3);

      const ch = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array(data.length).fill(""),
          datasets: [{
            data,
            borderColor: color,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false, grid: { color: gridColor }, ticks: { color: textColor } },
            y: {
              display: false,
              min: Math.min(...data) - 5,
              max: Math.max(...data) + 5,
              grid: { color: gridColor },
              ticks: { color: textColor }
            }
          }
        }
      });

      reg(id, ch);
    };

    const spark = (id: string, data: number[], color: string) => {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      Chart.getChart(el)?.destroy();

      const textColor = getCssVar('--text-secondary') || '#9ca3af';
      const gridColor = toRgba(getCssVar('--text-secondary') || '#9ca3af', 0.3);

      const ch = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array(data.length).fill(""),
          datasets: [{
            data,
            borderColor: color,
            borderWidth: 1,
            tension: 0.1,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false, grid: { color: gridColor }, ticks: { color: textColor } },
            y: {
              display: false,
              min: Math.min(...data) - 0.5,
              max: Math.max(...data) + 0.5,
              grid: { color: gridColor },
              ticks: { color: textColor }
            }
          }
        }
      });

      reg(id, ch);
    };

    const bar = (id: string, labels: string[], data: number[], colors: string[]) => {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      Chart.getChart(el)?.destroy();

      const textColor = getCssVar('--text-secondary') || '#9ca3af';
      const gridColor = toRgba(getCssVar('--text-secondary') || '#9ca3af', 0.3);

      const ch = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: textColor }
            },
            y: {
              min: 50,
              max: 80,
              grid: { color: gridColor },
              border: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });

      reg(id, ch);
    };

    const createPressureGauge = (id: string, value: number, maxValue: number, color: string) => {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      Chart.getChart(el)?.destroy();

      const percentage = Math.min(100, (value / maxValue) * 100);

      const bgTrack = getCssVar('--hover-bg') || '#374151';
      const ch = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [{
            data: [percentage, 100 - percentage],
            backgroundColor: [color, bgTrack],
            borderWidth: 0
          }]
        },
        options: {
          circumference: 270,
          rotation: 225,
          cutout: "80%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });

      reg(id, ch);
      return ch;
    };

    const trend = (exhaustTemps: number[]) => {
      const el = document.getElementById("trendChart") as HTMLCanvasElement | null;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;

      Chart.getChart(el)?.destroy();

      const labels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      const textColor = getCssVar('--text-secondary') || '#9ca3af';
      const gridColor = toRgba(getCssVar('--text-secondary') || '#9ca3af', 0.3);

      const ch = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Exhaust Gas Temperature (°C)",
            data: exhaustTemps,
            borderColor: "#ff5555",
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointBackgroundColor: "#ff5555",
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor }
            }
          }
        }
      });

      reg("trendChart", ch);
    };

    const fetchData = async () => {
      console.log("data fetching...");
      try {
        setLoading(true);
        const response: any = await getEnginePropulsion();
        if (response.data && response.data.length > 0) {
          const engineData = response.data[0];
          setData(engineData);
          return engineData;
        }
      } catch (err) {
        console.error("Error fetching engine propulsion data:", err);
      } finally {
        setLoading(false);
      }
      return null;
    };

    const fetchDataAndUpdateCharts = async (engineData: any) => {
      try {
        setLoading(true);
        if (!engineData) return;

        if (engineData.temperature_and_pressure.exhaust_gas_temp) {
          line("exhaustTempChart", engineData.temperature_and_pressure.exhaust_gas_temp, "#ff5555");
        }

        if (engineData.temperature_and_pressure.cooling_water_temp) {
          line("coolingTempChart", engineData.temperature_and_pressure.cooling_water_temp, "#55aaff");
        }

        if (engineData.temperature_and_pressure.lube_oil_temp) {
          line("lubeTempChart", engineData.temperature_and_pressure.lube_oil_temp, "#ffaa55");
        }

        if (engineData.vibration_and_bearing.engine_vibration) {
          spark("engineVibrationChart", engineData.vibration_and_bearing.engine_vibration, "#00ff00");
        }

        if (engineData.vibration_and_bearing.shaft_bearing_vibration) {
          spark("shaftVibrationChart", engineData.vibration_and_bearing.shaft_bearing_vibration, "#00ff00");
        }

        if (engineData.vibration_and_bearing.bearing_temperatures) {
          const bearingLabels = ['Fore Bearing', 'Aft Bearing', 'Thruster B1', 'Thruster B2'];
          const bearingColors = engineData.vibration_and_bearing.bearing_temperatures.map((value: number) => {
            if (value < 70) return '#00ff00';
            if (value < 80) return '#ffff00';
            return '#ff0000';
          });
          bar("bearingTempChart", bearingLabels, engineData.vibration_and_bearing.bearing_temperatures, bearingColors);
        }

        if (engineData.temperature_and_pressure.fuel_pressure) {
          const fuelValue = getCurrentValue(engineData.temperature_and_pressure.fuel_pressure, 0);
          createPressureGauge("fuelPressureGauge", fuelValue, 5.0, "#10b981");
        }

        if (engineData.temperature_and_pressure.lube_oil_pressure) {
          const lubeValue = getCurrentValue(engineData.temperature_and_pressure.lube_oil_pressure, 0);
          createPressureGauge("lubePressureGauge", lubeValue, 4.5, "#3b82f6");
        }

        if (engineData.temperature_and_pressure.exhaust_gas_temp) {
          trend(engineData.temperature_and_pressure.exhaust_gas_temp);
        }

      } catch (err) {
        console.error("Error updating charts:", err);
      } finally {
        setLoading(false);
      }
    };

    // 👇 Main async runner
    const init = async () => {
      const engineData = await fetchData(); // Step 1
      setTimeout(() => {
        (async () => {
          await fetchDataAndUpdateCharts(engineData);
        })();
      }, 100);
      // Step 2
    };

    init(); // 👈 fire the flow

    const onThemeChange = async () => {
      const engineData = await fetchData();
      setTimeout(() => {
        (async () => {
          await fetchDataAndUpdateCharts(engineData);
        })();
      }, 100);
    };
    window.addEventListener('themechange', onThemeChange);

    return () => {
      destroyAll(); // 👈 clean up on unmount
      window.removeEventListener('themechange', onThemeChange);
    };
  }, []);

  const getCurrentValue = (values: number[] | undefined, fallback: number) => {
    return values && values.length > 0 ? values[values.length - 1] : fallback;
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
              <i className="fas fa-ship mr-1"></i> Engine & Propulsion
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {/* {loading && (
          <div className="bg-gray-600 text-white px-4 py-2 flex items-center justify-center space-x-2">
            <Loader variant="dots" size="sm" color="secondary" />
            <span className="text-sm font-medium">Loading engine propulsion data...</span>
          </div>
        )} */}

        {/* Status Overview */}
        <div className="p-4 border-b border-gray-700 grid grid-cols-1 md:grid-cols-6 gap-4">
          {loading ? (
            <>
              <MetricCardSkeleton />
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
                  <i className="fas fa-tachometer-alt text-green-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Engine RPM</div>
                  <div className="font-bold text-green-400">{data.overview.engine_rpm.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-cog text-blue-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Shaft RPM</div>
                  <div className="font-bold text-blue-400">{data.overview.shaft_rpm.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-wind text-yellow-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Turbocharger</div>
                  <div className="font-bold text-yellow-400">{data.overview.turbocharger_rpm.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-ship text-blue-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Thruster RPM</div>
                  <div className="font-bold text-blue-400">{data.overview.thruster_rpm.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-weight text-yellow-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Thruster Load</div>
                  <div className="font-bold text-yellow-400">{data.overview.thruster_load.toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <i className="fas fa-heart text-green-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-400">System Health</div>
                  <div className="font-bold text-green-400">{data.overview.system_health.toFixed(1)}%</div>
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
              <MetricCardSkeleton />
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Temperature & Pressure */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Temperature & Pressure</h3>
                <span className="text-sm text-gray-400">Real-time Monitoring</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <ChartSkeleton type="line" height="h-32 mb-2" />
                        <div className="flex justify-between text-xs mt-1">
                          <Skeleton variant="text" className="w-16 mb-2" />
                          <Skeleton variant="text" className="w-16 mb-2" />
                          <Skeleton variant="text" className="w-16 mb-2" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div>
                      <div className="text-sm mb-2">EXHAUST GAS TEMP</div>
                      <div className="h-32"><canvas id="exhaustTempChart"></canvas></div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">{getCurrentValue(data.temperature_and_pressure.exhaust_gas_temp, 350)}°C</span>
                        <span className="text-yellow-400">450°C</span>
                        <span className="text-red-400">500°C</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">COOLING WATER TEMP</div>
                      <div className="h-32"><canvas id="coolingTempChart"></canvas></div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">{getCurrentValue(data.temperature_and_pressure.cooling_water_temp, 75)}°C</span>
                        <span className="text-yellow-400">85°C</span>
                        <span className="text-red-400">95°C</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">LUBE OIL TEMP</div>
                      <div className="h-32"><canvas id="lubeTempChart"></canvas></div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">{getCurrentValue(data.temperature_and_pressure.lube_oil_temp, 60)}°C</span>
                        <span className="text-yellow-400">75°C</span>
                        <span className="text-red-400">85°C</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <ChartSkeleton type="line" height="h-32 mb-2" />
                        <div className="flex justify-between text-xs mt-1">
                          <Skeleton variant="text" className="w-16 mb-2" />
                          <Skeleton variant="text" className="w-16 mb-2" />
                          <Skeleton variant="text" className="w-16 mb-2" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Pressure Gauges */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Pressure Readings</h3>
                <span className="text-sm text-gray-400">Current Values</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <div className="h-32 flex items-center justify-center">
                          <Spinner variant="dual-ring" size="xl" color="primary" />
                        </div>
                        <Skeleton variant="text" className="w-full text-center mt-1" />
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div>
                      <div className="text-sm mb-2">FUEL PRESSURE</div>
                      <div className="h-32 flex items-center justify-center">
                        <div className="w-24 h-24 relative">
                          <canvas id="fuelPressureGauge"></canvas>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-lg font-bold">{getCurrentValue(data.temperature_and_pressure.fuel_pressure, 0)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-xs mt-1 text-gray-400">Range: 3.5-5.0 bar</div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">LUBE OIL PRESSURE</div>
                      <div className="h-32 flex items-center justify-center">
                        <div className="w-24 h-24 relative">
                          <canvas id="lubePressureGauge"></canvas>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-lg font-bold">{getCurrentValue(data.temperature_and_pressure.lube_oil_pressure, 0)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-xs mt-1 text-gray-400">Range: 3.0-4.5 bar</div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <div className="h-32 flex items-center justify-center">
                          <Spinner variant="dual-ring" size="xl" color="primary" />
                        </div>
                        <Skeleton variant="text" className="w-full text-center mt-1" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            {/* Vibration & Bearing */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Vibration & Bearing</h3>
                <span className="text-sm text-gray-400">System Analysis</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <ChartSkeleton type="line" height="h-20 mb-2" />
                        <div className="flex justify-between items-center mt-1">
                          <Skeleton variant="text" className="w-24 mb-2" />
                          <div className="flex items-center">
                            <Skeleton variant="text" className="w-16 mr-2" />
                            <Skeleton variant="avatar" className="w-2 h-2" />
                            <Skeleton variant="text" className="w-16 ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    <div>
                      <div className="text-sm mb-2">ENGINE VIBRATION</div>
                      <div className="h-20"><canvas id="engineVibrationChart"></canvas></div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">Current: {getCurrentValue(data.vibration_and_bearing.engine_vibration, 0)} mm/s</span>
                        <div className="flex items-center">
                          <span className="text-xs mr-2 text-gray-400">Status:</span>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-green-400 ml-1">Normal</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">SHAFT BEARING VIBRATION</div>
                      <div className="h-20"><canvas id="shaftVibrationChart"></canvas></div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">Current: {getCurrentValue(data.vibration_and_bearing.shaft_bearing_vibration, 0)} mm/s</span>
                        <div className="flex items-center">
                          <span className="text-xs mr-2 text-gray-400">Status:</span>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-green-400 ml-1">Normal</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-2">BEARING TEMPERATURES</div>
                      <div className="h-48"><canvas id="bearingTempChart"></canvas></div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton variant="text" className="w-1/3 mb-2" />
                        <ChartSkeleton type="line" height="h-20 mb-2" />
                        <div className="flex justify-between items-center mt-1">
                          <Skeleton variant="text" className="w-24 mb-2" />
                          <div className="flex items-center">
                            <Skeleton variant="text" className="w-16 mr-2" />
                            <Skeleton variant="avatar" className="w-2 h-2" />
                            <Skeleton variant="text" className="w-16 ml-1" />
                          </div>
                        </div>
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
                <span className="text-sm text-gray-400">Active Alerts: 2/15</span>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-4 border-gray-600 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <Skeleton variant="text" className="w-32 mb-3" />
                            <Skeleton variant="text" className="w-24" />
                          </div>
                          <Skeleton variant="avatar" className="w-5 h-5 mr-2" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : data ? (
                  <>
                    {data.overview.turbocharger_rpm > 12000 && (
                      <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-yellow-400">Turbocharger RPM High</div>
                            <div className="text-xs text-gray-400">{data.overview.turbocharger_rpm.toLocaleString()} RPM ({(data.overview.turbocharger_rpm / 15000 * 100).toFixed(0)}% of max)</div>
                          </div>
                          <div className="text-yellow-400"><i className="fas fa-exclamation-circle"></i></div>
                        </div>
                      </div>
                    )}
                    {data.overview.thruster_load > 75 && (
                      <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-yellow-400">Thruster Load High</div>
                            <div className="text-xs text-gray-400">{data.overview.thruster_load.toFixed(1)}% load</div>
                          </div>
                          <div className="text-yellow-400"><i className="fas fa-exclamation-circle"></i></div>
                        </div>
                      </div>
                    )}
                    <div className="border-l-4 border-green-500 pl-3 py-2 bg-gray-700 rounded opacity-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-green-400">Cooling Water Temp Rising</div>
                          <div className="text-xs text-gray-400">Resolved 12 min ago</div>
                        </div>
                        <div className="text-green-400"><i className="fas fa-check-circle"></i></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-4 border-gray-600 pl-3 py-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <Skeleton variant="text" className="w-32 mb-3" />
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

          {/* Right Column */}
          <div className="space-y-4">
            {/* Trend Analysis */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Trend Analysis</h3>
                <div className="flex space-x-2">
                  <button className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">24H</button>
                  <button className="text-xs px-2 py-1 bg-green-600 rounded">7D</button>
                  <button className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">30D</button>
                </div>
              </div>
              {loading ? (
                <ChartSkeleton type="line" height="h-64" />
              ) : data ? (
                <div className="h-64"><canvas id="trendChart"></canvas></div>
              ) : (
                <ChartSkeleton type="line" height="h-64" />
              )}
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
                        <span className="text-sm">Engine System</span>
                      </div>
                      <div className="text-sm font-medium text-green-400">Normal</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mr-2">
                          <i className="fas fa-exclamation-triangle text-yellow-400 text-xs"></i>
                        </div>
                        <span className="text-sm">Turbocharger</span>
                      </div>
                      <div className="text-sm font-medium text-yellow-400">Warning</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mr-2">
                          <i className="fas fa-check text-green-400 text-xs"></i>
                        </div>
                        <span className="text-sm">Propulsion</span>
                      </div>
                      <div className="text-sm font-medium text-green-400">Normal</div>
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
      </div>
    </div>
  );
}