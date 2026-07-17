import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllocations,
  allocateGps,
  unallocateGps,
  deleteAllocation,
} from "../store/slices/allocationsSlice";
import { fetchDevices } from "../store/slices/gpsDevicesSlice";
import { fetchUsers } from "../store/slices/usersSlice";
import {
  FileSpreadsheet,
  Plus,
  X,
  Search,
  UserCheck,
  Check,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
} from "lucide-react";

export default function GPSAllocation() {
  const dispatch = useDispatch();
  const { items: allocations, loading, error } = useSelector(
    (state) => state.allocations
  );
  const { items: devices } = useSelector((state) => state.gpsDevices);
  const { items: users } = useSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [gpsDeviceId, setGpsDeviceId] = useState("");
  const [allocatedToType, setAllocatedToType] = useState("TECHNICIAN");
  const [allocatedToUserId, setAllocatedToUserId] = useState("");
  const [notes, setNotes] = useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchAllocations());
    dispatch(fetchDevices());
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreateModal = () => {
    // Filter available devices (PENDING or ACTIVE status)
    const availableDevices = devices.filter((d) => d.status === "ACTIVE" || d.status === "PENDING");
    setGpsDeviceId(availableDevices[0]?._id || "");
    
    // Filter non-admin users
    const fieldStaff = users.filter((u) => u.role?.name !== "tenant_admin");
    setAllocatedToUserId(fieldStaff[0]?._id || "");
    
    setAllocatedToType("TECHNICIAN");
    setNotes("");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!gpsDeviceId || !allocatedToUserId) {
      setSubmitError("Please select both a GPS Device and an Assignee staff user.");
      return;
    }

    const payload = {
      gps_device_id: gpsDeviceId,
      allocated_to_type: allocatedToType,
      allocated_to_user_id: allocatedToUserId,
      notes,
    };

    const resultAction = await dispatch(allocateGps(payload));
    if (allocateGps.fulfilled.match(resultAction)) {
      // Re-fetch all dependencies to make sure updated statuses reflect correctly
      dispatch(fetchAllocations());
      dispatch(fetchDevices());
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to finalize GPS allocation");
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm("Mark this GPS device as returned and returned to telemetry pool?")) {
      const resultAction = await dispatch(unallocateGps(id));
      if (unallocateGps.fulfilled.match(resultAction)) {
        dispatch(fetchAllocations());
        dispatch(fetchDevices());
      }
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Permanently delete this allocation record from history?")) {
      const resultAction = await dispatch(deleteAllocation(id));
      if (deleteAllocation.fulfilled.match(resultAction)) {
        dispatch(fetchAllocations());
        dispatch(fetchDevices());
      }
    }
  };

  // Filter available devices for creation dropdown
  const availableDevices = devices.filter((d) => d.status === "ACTIVE" || d.status === "PENDING");
  // Filter staff users (non admins)
  const fieldStaff = users.filter((u) => u.role?.name !== "tenant_admin");

  const filteredAllocations = allocations.filter((a) => {
    const imei = a.gps_device_id?.imei || "";
    const staffName = a.allocated_to_user_id?.employee_id?.name || a.allocated_to_user_id?.email || "";
    const type = a.allocated_to_type || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      imei.toLowerCase().includes(searchLower) ||
      staffName.toLowerCase().includes(searchLower) ||
      type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search allocations by IMEI, staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-white"
          />
        </div>

        <button
          onClick={openCreateModal}
          disabled={availableDevices.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Allocate GPS
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading allocation matrix...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredAllocations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <FileSpreadsheet className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No active allocations found</p>
          <p className="text-xs text-slate-400 mt-1">
            {availableDevices.length === 0 
              ? "All GPS devices are currently allocated or mapped. Register more trackers to allocate."
              : "Distribute trackers to field agents or technicians."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">GPS Trackers (IMEI)</th>
                  <th className="px-6 py-4">Assigned Helper Staff</th>
                  <th className="px-6 py-4">Allocation Type</th>
                  <th className="px-6 py-4">Handover Date</th>
                  <th className="px-6 py-4">Status & Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredAllocations.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-extrabold text-slate-950 text-sm">
                          IMEI: {a.gps_device_id?.imei || "Deleted Device"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {a.gps_device_id?.device_id || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {a.allocated_to_user_id?.employee_id?.name || "Field Agent"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {a.allocated_to_user_id?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                      <span className="bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                        {a.allocated_to_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-404" />
                        <span>
                          {a.allocated_date || a.allocated_at || a.createdAt
                            ? new Date(a.allocated_date || a.allocated_at || a.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[180px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border mb-1
                            ${
                              a.status === "ALLOCATED"
                                        ? "bg-blue-50 border-blue-100 text-blue-700"
                                        : "bg-emerald-50 border-emerald-100 text-emerald-700"
                            }`}
                        >
                          {a.status === "ALLOCATED" ? "IN HAND" : "RETURNED POOL"}
                        </span>
                        {a.notes && (
                          <div className="text-[10px] text-slate-400 truncate" title={a.notes}>
                            Note: {a.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === "ALLOCATED" ? (
                          <button
                            onClick={() => handleReturn(a._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm select-none transition cursor-pointer"
                          >
                            <Check size={12} />
                            Collect Return
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteRecord(a._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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
                <UserCheck className="text-blue-600" size={20} />
                Handover GPS Tracker
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

                {/* GPS Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select GPS Device (Active/Pending Pool) *
                  </label>
                  <select
                    value={gpsDeviceId}
                    required
                    onChange={(e) => setGpsDeviceId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="" disabled>Select device by IMEI</option>
                    {availableDevices.map((d) => (
                      <option key={d._id} value={d._id}>
                        IMEI: {d.imei} ({d.device_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff User Search */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Assignee Staff *
                  </label>
                  <select
                    value={allocatedToUserId}
                    required
                    onChange={(e) => setAllocatedToUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="" disabled>Select employee</option>
                    {fieldStaff.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.employee_id?.name || "Helper Staff"} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Staff Assignment Field Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAllocatedToType("TECHNICIAN")}
                      className={`py-3 border-2 rounded-xl text-xs font-bold transition select-none cursor-pointer
                        ${
                          allocatedToType === "TECHNICIAN"
                            ? "border-blue-550 bg-blue-50/50 text-blue-650"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Field Technician
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllocatedToType("SALESPERSON")}
                      className={`py-3 border-2 rounded-xl text-xs font-bold transition select-none cursor-pointer
                        ${
                          allocatedToType === "SALESPERSON"
                            ? "border-blue-550 bg-blue-50/50 text-blue-650"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Sales Agent
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Allocation Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Handed over for site installation..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                  />
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
                  Confirm Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
