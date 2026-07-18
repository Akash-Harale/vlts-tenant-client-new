import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMappings,
  mapDevice,
  updateMapping,
  unmapDevice,
} from "../store/slices/mappingsSlice";
import { fetchDevices } from "../store/slices/gpsDevicesSlice";
import { fetchVehicles } from "../store/slices/vehiclesSlice";
import { fetchClients } from "../store/slices/clientsSlice";
import {
  KeyRound,
  Plus,
  X,
  Search,
  AlertCircle,
  Unlink,
  Car,
  Cpu,
  Building2,
} from "lucide-react";

export default function VehicleDeviceMap() {
  const dispatch = useDispatch();
  const { items: mappings, loading, error } = useSelector((state) => state.mappings);
  const { items: devices } = useSelector((state) => state.gpsDevices);
  const { items: vehicles } = useSelector((state) => state.vehicles);
  const { items: clients } = useSelector((state) => state.clients);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mappingToUpdate, setMappingToUpdate] = useState(null); // Used to track device swaps

  // Form states
  const [selectedFilterClientId, setSelectedFilterClientId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [gpsDeviceId, setGpsDeviceId] = useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchMappings());
    dispatch(fetchDevices());
    dispatch(fetchVehicles());
    dispatch(fetchClients());
  }, [dispatch]);

  // Set default client filter once clients list loads
  useEffect(() => {
    if (clients.length > 0 && !selectedFilterClientId) {
      setSelectedFilterClientId(clients[0]._id);
    }
  }, [clients, selectedFilterClientId]);

  const openCreateModal = () => {
    setMappingToUpdate(null);
    setSelectedClientId("");
    setVehicleId("");
    
    // Default select device (ACTIVE status and currently unmapped)
    const activeUnmapped = devices.filter(
      (d) => d.status === "ACTIVE" && !mappings.some((m) => m.gps_device_id?._id === d._id || m.gps_device_id === d._id)
    );
    setGpsDeviceId(activeUnmapped[0]?._id || "");
    
    setSubmitError("");
    setModalOpen(true);
  };

  const openSwapModal = (mapping) => {
    setMappingToUpdate(mapping);
    setVehicleId(mapping.vehicle_id?._id || mapping.vehicle_id || "");
    
    // Optional replacement: ACTIVE status and currently unmapped
    const activeUnmapped = devices.filter(
      (d) => d.status === "ACTIVE" && !mappings.some((m) => m.gps_device_id?._id === d._id || m.gps_device_id === d._id)
    );
    setGpsDeviceId(activeUnmapped[0]?._id || "");
    
    setSubmitError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!vehicleId || !gpsDeviceId) {
      setSubmitError("Please choose both a Vehicle and a GPS Device to establish a mapping.");
      return;
    }

    if (mappingToUpdate) {
      // Swap/update device mapping path
      const resultAction = await dispatch(
        updateMapping({
          deviceId: mappingToUpdate.gps_device_id?._id || mappingToUpdate.gps_device_id,
          data: { newGpsDeviceId: gpsDeviceId },
        })
      );
      if (updateMapping.fulfilled.match(resultAction)) {
        dispatch(fetchMappings());
        dispatch(fetchDevices());
        setModalOpen(false);
      } else {
        setSubmitError(resultAction.payload || "Failed to update device swap configuration");
      }
    } else {
      // Standard create assignment
      const resultAction = await dispatch(
        mapDevice({ vehicle_id: vehicleId, gps_device_id: gpsDeviceId })
      );
      if (mapDevice.fulfilled.match(resultAction)) {
        dispatch(fetchMappings());
        dispatch(fetchDevices());
        setModalOpen(false);
      } else {
        setSubmitError(resultAction.payload || "Failed to map GPS device to vehicle");
      }
    }
  };

  const handleUnmap = async (deviceId) => {
    if (window.confirm("Are you sure you want to end this pairing and release the GPS device?")) {
      const resultAction = await dispatch(unmapDevice(deviceId));
      if (unmapDevice.fulfilled.match(resultAction)) {
        dispatch(fetchMappings());
        dispatch(fetchDevices());
      }
    }
  };

  // Filter available devices for form selector (only ACTIVE and unassigned trackers)
  const activeUnmapped = devices.filter(
    (d) => d.status === "ACTIVE" && !mappings.some((m) => m.gps_device_id?._id === d._id || m.gps_device_id === d._id)
  );

  // Filter available vehicles (unpaired vehicles)
  const activeUnmappedVehicles = vehicles.filter(
    (v) => !mappings.some((m) => m.vehicle_id?._id === v._id || m.vehicle_id === v._id)
  );

  const clientFilteredVehicles = activeUnmappedVehicles.filter(
    (v) => {
      const cid = v.client_id?._id || v.client_id;
      return cid === selectedClientId;
    }
  );

  const filteredMappings = mappings.filter((m) => {
    // Check client filter first
    const cid = m.vehicle_id?.client_id?._id || m.vehicle_id?.client_id;
    if (selectedFilterClientId && cid !== selectedFilterClientId) {
      return false;
    }

    const regNo = m.vehicle_id?.registration_number || "";
    const imei = m.gps_device_id?.imei || "";
    
    // Resolve client name from Redux store for search matching
    const clientObj = clients.find((c) => c._id === cid);
    const clientName = clientObj ? clientObj.entity_name : (m.vehicle_id?.client_id?.entity_name || "");
    const searchLower = searchTerm.toLowerCase();

    return (
      regNo.toLowerCase().includes(searchLower) ||
      imei.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Client Filter Dropdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="text-blue-650" size={18} />
          <span className="text-sm font-bold text-slate-700">Selected Client Fleet:</span>
          <select
            value={selectedFilterClientId}
            onChange={(e) => setSelectedFilterClientId(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50 cursor-pointer"
          >
            {clients.length === 0 ? (
              <option value="">No Client Profiles Onboarded</option>
            ) : (
              clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.entity_name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing device mappings registered under the selected client profile.
        </div>
      </div>

      {/* Action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search mapping by Reg No, IMEI, Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-white"
          />
        </div>

        <button
          onClick={openCreateModal}
          disabled={activeUnmapped.length === 0 || activeUnmappedVehicles.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Map Device
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading telemetry link mapping matrix...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <KeyRound className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No telemetry mappings found</p>
          <p className="text-xs text-slate-400 mt-1">
            {activeUnmapped.length === 0
              ? "All trackers in active inventory pool are already assigned."
              : "Register vehicles and allocate active GPS trackers to create mappings."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Assigned GPS Device Details</th>
                  <th className="px-6 py-4">Client Holder</th>
                  <th className="px-6 py-4">Mapping Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredMappings.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-blue-500 flex-shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-950 text-sm tracking-wide uppercase">
                            {m.vehicle_id?.registration_number || "Deleted Vehicle"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Make: {m.vehicle_id?.vehicle_make || "Generic"}{" "}
                            {m.vehicle_id?.vehicle_model || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-cyan-500 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            IMEI: {m.gps_device_id?.imei || "Deleted Tracker"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Device ID: {m.gps_device_id?.device_id || "N/A"}{" "}
                            {m.gps_device_id?.sim_provider1 ? `(SIM: ${m.gps_device_id.sim_provider1})` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {(() => {
                        const cid = m.vehicle_id?.client_id?._id || m.vehicle_id?.client_id;
                        const clientObj = clients.find((c) => c._id === cid);
                        return clientObj ? clientObj.entity_name : (m.vehicle_id?.client_id?.entity_name || "N/A");
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Live Matched
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openSwapModal(m)}
                          className="bg-slate-100 hover:bg-slate-205 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition select-none cursor-pointer"
                        >
                          Swap Device
                        </button>
                        <button
                          onClick={() => handleUnmap(m.gps_device_id?._id || m.gps_device_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                          title="Unlink and release device"
                        >
                          <Unlink size={16} />
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="text-blue-600" size={20} />
                {mappingToUpdate ? "Swap GPS Device Assignment" : "Initialize Live Match"}
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
              <div className="p-6 space-y-4">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Target Client & Vehicle Select */}
                {!mappingToUpdate && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Target Client *
                      </label>
                      <select
                        value={selectedClientId}
                        required
                        onChange={(e) => {
                          setSelectedClientId(e.target.value);
                          setVehicleId("");
                        }}
                        className="w-full px-4 py-3 border border-slate-205 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                      >
                        <option value="" disabled>Select client account</option>
                        {clients.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.entity_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Target Fleet Vehicle *
                      </label>
                      <select
                        value={vehicleId}
                        required
                        disabled={!selectedClientId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-205 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          {!selectedClientId ? "Select client first" : "Select vehicle reg number"}
                        </option>
                        {clientFilteredVehicles.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.registration_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {mappingToUpdate && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Target Fleet Vehicle *
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        mappingToUpdate.vehicle_id?.registration_number || "Associated Vehicle"
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 font-bold select-none"
                    />
                  </div>
                )}

                {/* Replacement/New GPS Device Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {mappingToUpdate ? "Select Replacement GPS Device *" : "Select GPS Device *"}
                  </label>
                  <select
                    value={gpsDeviceId}
                    required
                    onChange={(e) => setGpsDeviceId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-205 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="" disabled>Select active device</option>
                    {activeUnmapped.map((d) => (
                      <option key={d._id} value={d._id}>
                        IMEI: {d.imei} ({d.make || "Generic"})
                      </option>
                    ))}
                    {activeUnmapped.length === 0 && (
                      <option value="" disabled>No unmapped ACTIVE devices in inventory.</option>
                    )}
                  </select>
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
                  disabled={activeUnmapped.length === 0}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition select-none cursor-pointer"
                >
                  {mappingToUpdate ? "Swap Assignment" : "Pair Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
