import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            VLTS Tenant Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your telemetry assets
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="admin@telemetry.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm text-slate-800 bg-slate-50/50 
                  focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-150
                  ${
                    errors.email
                      ? "border-red-400 focus:ring-red-100 bg-red-50/20"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                <span>•</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`w-full pl-11 pr-12 py-3.5 border rounded-2xl text-sm text-slate-800 bg-slate-50/50 
                  focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-150
                  ${
                    errors.password
                      ? "border-red-400 focus:ring-red-100 bg-red-50/20"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-405 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                <span>•</span> {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-white" size={18} />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-422 border-t border-slate-100 pt-6">
          <span>Protected by VLTS Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}
