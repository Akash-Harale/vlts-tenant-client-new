import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicles,
  fetchVehiclesByClient,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../store/slices/vehiclesSlice";
import { fetchClients } from "../store/slices/clientsSlice";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Building2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function Vehicles() {
  const dispatch = useDispatch();
  const { items: vehicles, loading, error } = useSelector((state) => state.vehicles);
  const { items: clients } = useSelector((state) => state.clients);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form states
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [clientId, setClientId] = useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  // Set default client filter once clients list loads
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0]._id);
    }
  }, [clients, selectedClientId]);

  // Load client-specific vehicles when selected filter client changes
  useEffect(() => {
    if (selectedClientId) {
      dispatch(fetchVehiclesByClient(selectedClientId));
    }
  }, [selectedClientId, dispatch]);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setRegistrationNumber("");
    setChassisNumber("");
    setEngineNumber("");
    setVehicleMake("");
    setVehicleModel("");
    setClientId(selectedClientId || clients[0]?._id || "");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setRegistrationNumber(vehicle.registration_number);
    setChassisNumber(vehicle.chassis_number || "");
    setEngineNumber(vehicle.engine_number || "");
    setVehicleMake(vehicle.make || vehicle.vehicle_make || "");
    setVehicleModel(vehicle.model || vehicle.vehicle_model || "");
    setClientId(vehicle.client_id?._id || vehicle.client_id || "");
    setSubmitError("");
    setModalOpen(true);
  };

  const getClientName = (v) => {
    const cid = v.client_id?._id || v.client_id;
    const client = clients.find((c) => c._id === cid);
    return client ? client.entity_name : "N/A";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!registrationNumber || !clientId) {
      setSubmitError("Registration number and client association are required.");
      return;
    }

    // Include required backend creation fields to avoid validation errors
    const payload = {
      registration_number: registrationNumber,
      chassis_number: chassisNumber,
      engine_number: engineNumber,
      make: vehicleMake,
      model: vehicleModel,
      vehicle_make: vehicleMake,
      vehicle_model: vehicleModel,
      client_id: clientId,
      date_of_subscription: new Date().toISOString(),
      regn_valid_upto: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      next_available_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability_place: "Main Depot",
      status: "ACTIVE",
    };

    let resultAction;
    if (editingVehicle) {
      resultAction = await dispatch(
        updateVehicle({ id: editingVehicle._id, data: payload })
      );
    } else {
      resultAction = await dispatch(createVehicle(payload));
    }

    if (
      createVehicle.fulfilled.match(resultAction) ||
      updateVehicle.fulfilled.match(resultAction)
    ) {
      if (selectedClientId) {
        dispatch(fetchVehiclesByClient(selectedClientId));
      }
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to save vehicle details");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle profile? mappings associated with it will be cleared.")) {
      dispatch(deleteVehicle(id));
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const regNo = v.registration_number.toLowerCase();
    const chNo = (v.chassis_number || "").toLowerCase();
    const make = (v.make || v.vehicle_make || "").toLowerCase();
    const model = (v.model || v.vehicle_model || "").toLowerCase();
    const clientName = (getClientName(v) || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      regNo.includes(searchLower) ||
      chNo.includes(searchLower) ||
      make.includes(searchLower) ||
      model.includes(searchLower) ||
      clientName.includes(searchLower)
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
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
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
          Showing vehicles registered under the selected client profile.
        </div>
      </div>
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by vehicle reg no, chassis, client..."
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
          Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading vehicle list...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Car className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No vehicles registered</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Client Company</th>
                  <th className="px-6 py-4">Chassis & Engine</th>
                  <th className="px-6 py-4">Make & Model</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredVehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-950 text-sm tracking-wide uppercase">
                        {v.registration_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{getClientName(v)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-655 space-y-0.5">
                      <div>Chassis: {v.chassis_number || "N/A"}</div>
                      <div>Engine: {v.engine_number || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>{v.make || v.vehicle_make || "Generic"}</div>
                      <div className="text-[10px] text-slate-405 mt-0.5">{v.model || v.vehicle_model || ""}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
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

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Car className="text-blue-600" size={20} />
                {editingVehicle ? "Modify Vehicle Specs" : "Register Fleet Vehicle"}
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
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. PB10-XY-1234"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  {/* Client Select dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Assign to Client *
                    </label>
                    <select
                      value={clientId}
                      required
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
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
                      Chassis Number
                    </label>
                    <input
                      type="text"
                      value={chassisNumber}
                      onChange={(e) => setChassisNumber(e.target.value)}
                      placeholder="Unique chassis code"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Engine Number
                    </label>
                    <input
                      type="text"
                      value={engineNumber}
                      onChange={(e) => setEngineNumber(e.target.value)}
                      placeholder="Unique engine block ID"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                       Vehicle Make (Manufacturer)
                    </label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g. Tata, Mahindra"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Signa, Bolero"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                    />
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
                  {editingVehicle ? "Save Changes" : "Register Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
