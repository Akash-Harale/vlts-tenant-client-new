import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "../store/slices/clientsSlice";
import { fetchUsers } from "../store/slices/usersSlice";
import { fetchDevices } from "../store/slices/gpsDevicesSlice";
import { fetchVehicles } from "../store/slices/vehiclesSlice";
import { fetchAllocations } from "../store/slices/allocationsSlice";
import { fetchMappings } from "../store/slices/mappingsSlice";
import {
  Building2,
  Users,
  Cpu,
  Car,
  KeyRound,
  FileSpreadsheet,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();

  const clients = useSelector((state) => state.clients.items);
  const users = useSelector((state) => state.users.items);
  const devices = useSelector((state) => state.gpsDevices.items);
  const vehicles = useSelector((state) => state.vehicles.items);
  const allocations = useSelector((state) => state.allocations.items);
  const mappings = useSelector((state) => state.mappings.items);

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchUsers());
    dispatch(fetchDevices());
    dispatch(fetchVehicles());
    dispatch(fetchAllocations());
    dispatch(fetchMappings());
  }, [dispatch]);

  const cards = [
    {
      title: "Client Companies",
      count: clients.length,
      icon: Building2,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Onboarded client business accounts",
      link: "/clients",
    },
    {
      title: "Staff & Users",
      count: users.length,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description: "Tenant admins, managers and staff",
      link: "/users",
    },
    {
      title: "GPS Devices",
      count: devices.length,
      icon: Cpu,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
      description: "Trackers inventory & statuses",
      link: "/gps-devices",
    },
    {
      title: "Registered Vehicles",
      count: vehicles.length,
      icon: Car,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      description: "Client fleets vehicles mapped",
      link: "/vehicles",
    },
    {
      title: "Staff GPS Allocations",
      count: allocations.filter((a) => a.status === "ALLOCATED").length,
      icon: FileSpreadsheet,
      color: "text-orange-600 bg-orange-50 border-orange-100",
      description: "Devices allocated to technicians",
      link: "/allocations",
    },
    {
      title: "Active Mappings",
      count: mappings.length,
      icon: KeyRound,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      description: "Live GPS-to-vehicle maps",
      link: "/mappings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Telemetry Platform Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1 md:max-w-xl">
            Real-time assets, fleet tracking logistics and device allocation management workflow dashboard.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link
            to="/mappings"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md inline-flex items-center gap-1.5"
          >
            <KeyRound size={14} />
            Map GPS Device
          </Link>
          <Link
            to="/vehicles"
            className="px-4 py-2.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition inline-flex items-center gap-1.5"
          >
            <Car size={14} />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.link}
              className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-lg transition-all duration-200 flex items-start gap-4 group"
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-150 ${c.color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {c.title}
                </span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1.5">
                  {c.count}
                </h3>
                <p className="text-xs text-slate-500 mt-1 text-ellipsis overflow-hidden whitespace-nowrap">
                  {c.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Status Table Summary */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" size={18} />
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
              Platform Status
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="py-4 md:py-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total GPS Registered
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {devices.length}
            </p>
          </div>
          <div className="py-4 md:py-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Trackers
            </p>
            <p className="text-2xl font-extrabold text-semibold text-slate-900 mt-1 flex items-center justify-center gap-1.5">
              {mappings.length}{" "}
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5">
                {devices.length > 0
                  ? Math.round((mappings.length / devices.length) * 100)
                  : 0}
                %
              </span>
            </p>
          </div>
          <div className="py-4 md:py-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Allocations
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {devices.filter((d) => d.status === "ACTIVE").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
