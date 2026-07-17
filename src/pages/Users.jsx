import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../store/slices/usersSlice";
import { fetchRoles } from "../store/slices/rolesSlice";
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Mail,
  Phone,
  Briefcase,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

export default function Users() {
  const dispatch = useDispatch();
  const { items: users, loading, error } = useSelector((state) => state.users);
  const { items: roles } = useSelector((state) => state.roles);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setMobileNumber("");
    setDesignation("");
    setPassword("");
    // Default to the first tenant role if available
    const tenantRoles = roles.filter((r) => r.scope === "tenant");
    setRoleName(tenantRoles[0]?.name || "");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setName(user.employee_id?.name || "");
    setEmail(user.email || "");
    setMobileNumber(user.employee_id?.mobile_number || "");
    setDesignation(user.employee_id?.designation || "");
    setRoleName(user.role?.name || "");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!roleName) {
      setSubmitError("Please select a valid tenant role.");
      return;
    }

    const payload = {
      name,
      email,
      mobile_number: mobileNumber,
      designation,
      password,
      roleName,
    };

    const resultAction = await dispatch(createUser(payload));
    if (createUser.fulfilled.match(resultAction)) {
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to create tenant user");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const payload = {
      designation,
      mobile_number: mobileNumber,
      roleName,
    };

    const resultAction = await dispatch(
      updateUser({ id: editingUser._id, data: payload })
    );

    if (updateUser.fulfilled.match(resultAction)) {
      // Re-fetch users list to dynamically reflect changes including populated schemas
      dispatch(fetchUsers());
      setModalOpen(false);
    } else {
      setSubmitError(resultAction.payload || "Failed to update tenant user");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user? This will also remove their Employee profile.")) {
      dispatch(deleteUser(id));
    }
  };

  const filteredUsers = users.filter((u) => {
    const userName = u.employee_id?.name || "";
    const userRole = u.role?.name || "";
    const userDesignation = u.employee_id?.designation || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      userName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      userRole.toLowerCase().includes(searchLower) ||
      userDesignation.toLowerCase().includes(searchLower)
    );
  });

  const tenantRoles = roles.filter((r) => r.scope === "tenant" && r.name !== "tenant_admin");

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search users, emails, designations..."
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
          Create User
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-3" />
          <p className="text-sm font-medium">Loading users list...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-650">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <UsersIcon className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Name & Designation</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Role / Scope</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-extrabold text-slate-950 text-sm">
                          {u.employee_id?.name || "No Profile Linked"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {u.employee_id?.designation || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-655 font-mono">{u.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {u.employee_id?.mobile_number || "Not listed"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border
                          ${
                            u.role?.name === "tenant_admin"
                              ? "bg-purple-50 border-purple-100 text-purple-750"
                              : "bg-blue-50 border-blue-105 text-blue-755"
                          }`}
                      >
                        {u.role?.name?.replace("tenant_", "") || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role?.name !== "tenant_admin" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UsersIcon className="text-blue-600" size={20} />
                {editingUser ? "Modify Staff User" : "Add Tenant User"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={editingUser ? handleEditSubmit : handleCreateSubmit}>
              <div className="p-6 space-y-4">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Profile Core */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingUser}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={!!editingUser}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@telemetry.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9999900000"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Technical Lead"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Password (Required ONLY for new users) */}
                  {!editingUser && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Login Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                  )}

                  {/* Tenant Role Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Assign Scope Role *
                    </label>
                    <select
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                    >
                      {tenantRoles.map((r) => (
                        <option key={r._id} value={r.name}>
                          {r.name?.replace("tenant_", "")}
                        </option>
                      ))}
                      {tenantRoles.length === 0 && (
                        <option value="">No roles available. Please seed database.</option>
                      )}
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
                  {editingUser ? "Update Staff" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
