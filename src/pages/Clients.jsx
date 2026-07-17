import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../store/slices/clientsSlice";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Hash,
} from "lucide-react";

export default function Clients() {
  const dispatch = useDispatch();
  const { items: clients, loading, error } = useSelector((state) => state.clients);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form states
  const [entityName, setEntityName] = useState("");
  const [contactName, setContactName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  
  // Client admin user states (required for create)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminMobile, setAdminMobile] = useState("");
  const [password, setPassword] = useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingClient(null);
    setEntityName("");
    setContactName("");
    setEmailId("");
    setGstNumber("");
    setCinNumber("");
    setMobileNumber("");
    setWhatsappNumber("");
    setAddress1("");
    setAddress2("");
    setCity("");
    setDistrict("");
    setStateName("");
    setPincode("");
    setAdminEmail("");
    setAdminMobile("");
    setPassword("");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setEntityName(client.entity_name);
    setContactName(client.contact_name);
    setEmailId(client.email_id || "");
    setGstNumber(client.gst_number || "");
    setCinNumber(client.cin_number || "");
    setMobileNumber(client.mobile_number || "");
    setWhatsappNumber(client.whatsapp_number || "");
    setAddress1(client.address1 || "");
    setAddress2(client.address2 || "");
    setCity(client.city || "");
    setDistrict(client.district || "");
    setStateName(client.state || "");
    setPincode(client.pincode || "");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const data = {
      contact_name: contactName,
      gst_number: gstNumber,
      cin_number: cinNumber,
      email_id: emailId,
      mobile_number: mobileNumber,
      whatsapp_number: whatsappNumber,
      address1,
      address2,
      city,
      district,
      state: stateName,
      pincode,
    };
    const resultAction = await dispatch(
      updateClient({ id: editingClient._id, data })
    );
    if (updateClient.fulfilled.match(resultAction)) {
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to update client");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!adminEmail || !password) {
      setSubmitError("Admin Email and password are required for client login provisioning.");
      return;
    }

    const payload = {
      entity_name: entityName,
      contact_name: contactName,
      email_id: emailId,
      gst_number: gstNumber,
      cin_number: cinNumber,
      mobile_number: mobileNumber,
      whatsapp_number: whatsappNumber,
      address1,
      address2,
      city,
      district,
      state: stateName,
      pincode,
      admin_email: adminEmail,
      admin_mobile_number: adminMobile,
      password,
    };

    const resultAction = await dispatch(createClient(payload));
    if (createClient.fulfilled.match(resultAction)) {
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to create client");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this client? Underling users will also be removed.")) {
      dispatch(deleteClient(id));
    }
  };

  const filteredClients = clients.filter((c) =>
    c.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by company or contact name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Add client button */}
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none shadow-xs hover:shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Create Client
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading client accounts...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Building2 className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No clients found</p>
          <p className="text-xs text-slate-400 mt-1">Get started by creating a client business profile.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">GST/CIN</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredClients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-extrabold text-slate-950 text-sm">{c.entity_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{c.contact_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      <div>GST: {c.gst_number || "N/A"}</div>
                      <div className="mt-0.5">CIN: {c.cin_number || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{c.email_id || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{c.mobile_number || "No number"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{c.city ? `${c.city}, ${c.state || ""}` : "Not listed"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                {editingClient ? "Modify Client Profile" : "Register New Client"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={editingClient ? handleEditSubmit : handleCreateSubmit}>
              <div className="p-6 space-y-6">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Section: Company Profile */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Company Core Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Entity Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingClient}
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        placeholder="ABC Logistics Pvt Ltd"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Primary Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                        placeholder="contact@company.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Mobile
                        </label>
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="9999999999"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="9999999999"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="GSTIN12345678"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        CIN Number
                      </label>
                      <input
                        type="text"
                        value={cinNumber}
                        onChange={(e) => setCinNumber(e.target.value)}
                        placeholder="CIN12345678"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Address Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Address Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        placeholder="Street No, Building Name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        City/Town
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ludhiana"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Ludhiana"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Punjab"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="141001"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Client Admin Login User Details (Required ONLY on Registration) */}
                {!editingClient && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                      Client Admin Account Creation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Admin Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@client.com"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Admin Login Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Admin Mobile
                        </label>
                        <input
                          type="text"
                          value={adminMobile}
                          onChange={(e) => setAdminMobile(e.target.value)}
                          placeholder="9999999999"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
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
                  {editingClient ? "Update Profile" : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
