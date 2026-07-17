import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "../store/slices/gpsDevicesSlice";
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Cpu as GpsIcon,
  Rss,
  Wifi,
  AlertCircle,
} from "lucide-react";

export default function GPSDevices() {
  const dispatch = useDispatch();
  const { items: devices, loading, error } = useSelector(
    (state) => state.gpsDevices
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // Form states
  const [imei, setImei] = useState("");
  const [deviceIdInput, setDeviceIdInput] = useState("");
  const [iccId, setIccId] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [protocol, setProtocol] = useState("");
  const [simProvider1, setSimProvider1] = useState("");
  const [simProvider2, setSimProvider2] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [deviceType, setDeviceType] = useState("GPS");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingDevice(null);
    setImei("");
    setDeviceIdInput("");
    setIccId("");
    setMake("");
    setModel("");
    setFirmwareVersion("");
    setProtocol("");
    setSimProvider1("");
    setSimProvider2("");
    setStatus("ACTIVE");
    setDeviceType("GPS");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setImei(device.imei);
    setDeviceIdInput(device.device_id);
    setIccId(device.icc_id);
    setMake(device.make || "");
    setModel(device.model || "");
    setFirmwareVersion(device.firmware_version || "");
    setProtocol(device.protocol || "");
    setSimProvider1(device.sim_provider1 || "");
    setSimProvider2(device.sim_provider2 || "");
    setStatus(device.status || "ACTIVE");
    setDeviceType(device.device_type || "GPS");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!imei || !deviceIdInput || !iccId) {
      setSubmitError("IMEI, Device ID, and ICC ID are required.");
      return;
    }

    const payload = {
      imei,
      device_id: deviceIdInput,
      icc_id: iccId,
      make,
      model,
      firmware_version: firmwareVersion,
      protocol,
      sim_provider1: simProvider1,
      sim_provider2: simProvider2,
      status,
      device_type: deviceType,
    };

    let resultAction;
    if (editingDevice) {
      resultAction = await dispatch(
        updateDevice({ id: editingDevice._id, data: payload })
      );
    } else {
      resultAction = await dispatch(createDevice(payload));
    }

    if (
      createDevice.fulfilled.match(resultAction) ||
      updateDevice.fulfilled.match(resultAction)
    ) {
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to process device registry");
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this GPS device registration from inventory?")
    ) {
      dispatch(deleteDevice(id));
    }
  };

  const filteredDevices = devices.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      d.imei.toLowerCase().includes(searchLower) ||
      d.device_id.toLowerCase().includes(searchLower) ||
      (d.make && d.make.toLowerCase().includes(searchLower)) ||
      (d.model && d.model.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search devices by IMEI, Device ID, make..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-white"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none shadow-xs hover:shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Register Tracker
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading telemetry devices...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Cpu className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No GPS devices found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Device Identifiers</th>
                  <th className="px-6 py-4">Hardware Info</th>
                  <th className="px-6 py-4">SIM Cards Info</th>
                  <th className="px-6 py-4">Telecom Protocol</th>
                  <th className="px-6 py-4">Status & Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredDevices.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-extrabold text-slate-955 text-sm flex items-center gap-1.5">
                          <GpsIcon size={14} className="text-slate-400" />
                          <span>IMEI: {d.imei}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Device ID: {d.device_id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ICCID: {d.icc_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      <div>Make: {d.make || "Generic"}</div>
                      <div className="text-slate-500 mt-0.5">Model: {d.model || "N/A"}</div>
                      <div className="text-[10px] text-slate-400">FW: {d.firmware_version || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Wifi size={11} className="text-blue-500" />
                        <span>SIM 1: {d.sim_provider1 || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Wifi size={11} className="text-cyan-500" />
                        <span>SIM 2: {d.sim_provider2 || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {d.protocol || "TCP/UDP"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border
                            ${
                              d.status === "ACTIVE"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : d.status === "ALLOCATED"
                                ? "bg-blue-50 border-blue-100 text-blue-700"
                                : "bg-amber-50 border-amber-100 text-amber-700"
                            }`}
                        >
                          {d.status || "PENDING"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {d.device_type || "GPS"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registry */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Cpu className="text-blue-600" size={20} />
                {editingDevice ? "Modify GPS Settings" : "Register GPS Tracker"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      IMEI Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      placeholder="15 digit unique IMEI"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Device ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={deviceIdInput}
                      onChange={(e) => setDeviceIdInput(e.target.value)}
                      placeholder="Backend Device ID ID"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      ICCID (SIM Chip ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={iccId}
                      onChange={(e) => setIccId(e.target.value)}
                      placeholder="SIM Profile Identifier"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Manufacturer Make
                    </label>
                    <input
                      type="text"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Concox, Coban"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. GT06, Coban-303"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Firmware Version
                    </label>
                    <input
                      type="text"
                      value={firmwareVersion}
                      onChange={(e) => setFirmwareVersion(e.target.value)}
                      placeholder="e.g. v2.14"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Protocol
                    </label>
                    <input
                      type="text"
                      value={protocol}
                      onChange={(e) => setProtocol(e.target.value)}
                      placeholder="e.g. gt06, traccar"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      SIM Card 1 Operator/No.
                    </label>
                    <input
                      type="text"
                      value={simProvider1}
                      onChange={(e) => setSimProvider1(e.target.value)}
                      placeholder="Airtel / Jio number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      SIM Card 2 Operator/No.
                    </label>
                    <input
                      type="text"
                      value={simProvider2}
                      onChange={(e) => setSimProvider2(e.target.value)}
                      placeholder="Optional backup SIM"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Device Type
                    </label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                    >
                      <option value="GPS">GPS Tracker</option>
                      <option value="MOBILE">Mobile Tracker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Status Settings
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE READY</option>
                      <option value="INACTIVE">SUSPENDED</option>
                      <option value="FAULTY">FAULTY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition select-none cursor-pointer"
                >
                  {editingDevice ? "Save Settings" : "Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
