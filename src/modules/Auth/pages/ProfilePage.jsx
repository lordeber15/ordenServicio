import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { 
  updateLogin, 
  uploadProfileImage, 
  getLogins, 
  createLogin, 
  deleteLogin 
} from "../services/loginrequest";
import logoDefault from "../../../assets/ALEXANDER.webp";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getEmisores, createEmisor, updateEmisor, uploadEmisorLogo } from "../../Billing/services/emisores";
import {
  FaCamera,
  FaUser,
  FaLock,
  FaUsers,
  FaArrowRightFromBracket,
  FaUserPlus,
  FaMagnifyingGlass,
  FaUserShield,
  FaUserGear,
  FaUserSlash,
  FaKey,
  FaShieldHalved,
  FaBuilding
} from "react-icons/fa6";

const INITIAL_FORM = { usuario: "", password: "", confirmPassword: "", cargo: "Usuario" };

/**
 * Módulo de Gestión de Perfil y Usuarios.
 * 
 * Roles:
 * - Usuario: Puede cambiar su contraseña y foto de perfil.
 * - Administrador: Acceso total. Puede crear/editar/eliminar otros usuarios
 *   y configurar los datos de la empresa emisora (RUC, Logo, Certificado).
 */
function Perfil() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("seguridad"); // 'seguridad' | 'gestion' | 'empresa'
  
  // Estados para Seguridad
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para Gestión (Admin)
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const isAdmin = userData?.cargo === "Administrador";

  // --- QUERIES & MUTATIONS ---

  // Query: Usuarios (Solo si es admin)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["logins"],
    queryFn: getLogins,
    enabled: isAdmin,
    select: (res) => res.data,
  });

  // Mutación: Actualizar propia contraseña
  const updatePassMutation = useMutation({
    mutationFn: updateLogin,
    onSuccess: () => {
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      handleLogout();
    },
    onError: (error) => toast.error(error.response?.data?.message || "Error al actualizar")
  });

  // Mutación: Subir imagen
  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }) => uploadProfileImage(id, file),
    onSuccess: (response) => {
      toast.success("Foto de perfil actualizada ✅");
      const updatedUser = { ...userData, image_url: response.data.image_url };
      setUserData(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsUploading(false);
    },
    onError: () => {
      toast.error("Error al subir la imagen ❌");
      setIsUploading(false);
    }
  });

  // Mutación: Crear usuario (Admin)
  const createMutation = useMutation({
    mutationFn: createLogin,
    onSuccess: () => {
      toast.success("Usuario creado ✅");
      queryClient.invalidateQueries({ queryKey: ["logins"] });
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al crear")
  });

  // Mutación: Actualizar otro usuario (Admin)
  const updateOtherUserMutation = useMutation({
    mutationFn: (data) => updateLogin(data),
    onSuccess: () => {
      toast.success("Usuario actualizado ✅");
      queryClient.invalidateQueries({ queryKey: ["logins"] });
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al actualizar")
  });

  // Mutación: Baja lógica (Admin)
  const deleteMutation = useMutation({
    mutationFn: deleteLogin,
    onSuccess: () => {
      toast.success("Usuario desactivado");
      queryClient.invalidateQueries({ queryKey: ["logins"] });
    }
  });

  // Query: Emisor (Solo admin)
  const { data: emisorData } = useQuery({
    queryKey: ["emisor"],
    queryFn: getEmisores,
    enabled: isAdmin,
  });
  const emisor = emisorData?.[0] || null;

  // Estado local del formulario empresa (se sincroniza con emisor)
  const [empresaForm, setEmpresaForm] = useState({});
  useEffect(() => {
    if (emisor) setEmpresaForm({
      razon_social: emisor.razon_social || "",
      nombre_comercial: emisor.nombre_comercial || "",
      descripcion: emisor.descripcion || "",
      ruc: emisor.ruc || "",
      direccion: emisor.direccion || "",
      departamento: emisor.departamento || "",
      provincia: emisor.provincia || "",
      distrito: emisor.distrito || "",
      ubigeo: emisor.ubigeo || "",
      telefono: emisor.telefono || "",
      usuario_sol: emisor.usuario_sol || "",
      clave_sol: emisor.clave_sol || "",
    });
  }, [emisor]);

  const saveEmisorMutation = useMutation({
    mutationFn: (data) => emisor ? updateEmisor(emisor.id, data) : createEmisor(data),
    onSuccess: () => {
      toast.success(emisor ? "Datos de empresa actualizados" : "Empresa creada correctamente");
      queryClient.invalidateQueries({ queryKey: ["emisor"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  });

  const logoInputRef = useRef(null);
  const uploadLogoMutation = useMutation({
    mutationFn: (file) => uploadEmisorLogo(emisor.id, file),
    onSuccess: () => {
      toast.success("Logo actualizado");
      queryClient.invalidateQueries({ queryKey: ["emisor"] });
    },
    onError: () => toast.error("Error al subir el logo"),
  });

  // --- HANDLERS ---

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) return toast.error("Completa ambos campos");
    if (password !== confirmPassword) return toast.error("Las contraseñas no coinciden");
    if (password.length < 4) return toast.error("Contraseña demasiado corta");

    updatePassMutation.mutate({ id: userData.id, password, confirmPassword });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      uploadImageMutation.mutate({ id: userData.id, file });
    }
  };

  const handleSaveUser = () => {
    if (!form.usuario || (activeTab === 'gestion' && !form.id && !form.password)) {
      return toast.error("Completa los campos obligatorios");
    }

    if (form.id) {
      // Editar
      updateOtherUserMutation.mutate(form);
    } else {
      // Crear
      if (form.password !== form.confirmPassword) return toast.error("Las contraseñas no coinciden");
      createMutation.mutate(form);
    }
  };

  const openEditModal = (user) => {
    setForm({
      id: user.id,
      usuario: user.usuario,
      cargo: user.cargo,
      password: "", // Opcional en edición
      confirmPassword: ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
  };

  const filteredUsers = useMemo(() => {
    return (users || []).filter(u => u.usuario.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  if (!userData) return null;

  const profileImageUrl = userData.image_url 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${userData.image_url}`
    : logoDefault;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row p-4 md:p-8 gap-8 transition-colors duration-300">
      
      {/* SIDEBAR DE PERFIL (IZQUIERDA) */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-sky-900 dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center text-white shadow-xl sticky top-8 border dark:border-slate-800">
          <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current.click()}>
            <div className="w-40 h-40 rounded-full border-4 border-sky-700/50 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center relative shadow-lg">
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover transition" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <FaCamera className="text-3xl text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">{userData.usuario}</h2>
          <p className="text-sky-300 font-bold mb-8 bg-sky-800/50 px-4 py-1 rounded-full text-xs uppercase tracking-widest">
            {userData.cargo}
          </p>

          <div className="w-full space-y-2">
            <button 
              onClick={() => setActiveTab("seguridad")}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all font-bold ${activeTab === 'seguridad' ? 'bg-white dark:bg-slate-800 text-sky-900 dark:text-slate-50 shadow-lg' : 'hover:bg-sky-800/40 dark:hover:bg-slate-800/50 text-sky-100 dark:text-slate-400'}`}
            >
              <FaShieldHalved />
              <span>Mi Seguridad</span>
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("gestion")}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all font-bold ${activeTab === 'gestion' ? 'bg-white dark:bg-slate-800 text-sky-900 dark:text-slate-50 shadow-lg' : 'hover:bg-sky-800/40 dark:hover:bg-slate-800/50 text-sky-100 dark:text-slate-400'}`}
                >
                  <FaUsers />
                  <span>Personal</span>
                </button>
                <button
                  onClick={() => setActiveTab("empresa")}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all font-bold ${activeTab === 'empresa' ? 'bg-white dark:bg-slate-800 text-sky-900 dark:text-slate-50 shadow-lg' : 'hover:bg-sky-800/40 dark:hover:bg-slate-800/50 text-sky-100 dark:text-slate-400'}`}
                >
                  <FaBuilding />
                  <span>Empresa</span>
                </button>
              </>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-4 hover:bg-red-800/30 text-red-300 rounded-2xl transition-all font-bold mt-4"
            >
              <FaArrowRightFromBracket />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL (DERECHA) */}
      <div className="flex-grow">
        {activeTab === "seguridad" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-800 dark:text-slate-50 flex items-center gap-3">
                <FaLock className="text-sky-600 dark:text-sky-400" />
                Seguridad de la Cuenta
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-2">Gestiona tu acceso y mantén tu cuenta protegida.</p>
            </div>

            <div className="max-w-xl space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Usuario Actual</label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <FaUser className="text-gray-400" />
                  <span className="font-bold text-gray-700 dark:text-slate-200">{userData.usuario}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-gray-700 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-gray-700 dark:text-slate-200"
                  />
                </div>

                <button
                  className="w-full py-5 bg-sky-700 hover:bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6 cursor-pointer"
                  onClick={handleUpdatePassword}
                  disabled={updatePassMutation.isPending}
                >
                  {updatePassMutation.isPending ? "Actualizando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gestion" && (
          <div className="space-y-6 animate-fade-in">
            {/* GESTIÓN DE PERSONAL */}
            <div className="flex justify-between items-center mb-2">
               <div>
                  <h1 className="text-3xl font-black text-gray-800 dark:text-slate-50 flex items-center gap-3">
                    <FaUserShield className="text-sky-600 dark:text-sky-400" />
                    Gestión de Personal
                  </h1>
                  <p className="text-gray-500 dark:text-slate-400 mt-1">Administra los accesos y roles de la imprenta.</p>
               </div>
               <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-sky-900/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FaUserPlus /> Nuevo Usuario
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-3">
              <FaMagnifyingGlass className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="Buscar por nombre de usuario..." 
                className="w-full bg-transparent outline-none text-gray-700 dark:text-slate-200 font-medium placeholder:text-gray-300 dark:placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoadingUsers ? (
                <div className="col-span-full py-12 text-center text-gray-400 italic">Cargando plantilla...</div>
              ) : filteredUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-sky-200 dark:hover:border-slate-700 transition-all group">
                  <div className="w-14 h-14 rounded-full bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-sky-700 dark:text-sky-400 font-black text-lg uppercase border-2 border-transparent group-hover:border-sky-100 dark:group-hover:border-slate-700 overflow-hidden">
                    {user.image_url ? (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.image_url}`} className="w-full h-full object-cover" />
                    ) : (
                      user.usuario.substring(0, 2)
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100">{user.usuario}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.cargo === 'Administrador' ? 'text-amber-600 dark:text-amber-500' : 'text-sky-600 dark:text-sky-400'}`}>
                      {user.cargo}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="p-3 text-gray-300 hover:text-sky-500 transition cursor-pointer"
                      onClick={() => openEditModal(user)}
                    >
                      <FaUserGear />
                    </button>
                    <button 
                      className="p-3 text-gray-300 hover:text-red-500 transition cursor-pointer"
                      onClick={() => window.confirm(`¿Desactivar a ${user.usuario}?`) && deleteMutation.mutate(user.id)}
                    >
                      <FaUserSlash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "empresa" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-800 dark:text-slate-50 flex items-center gap-3">
                <FaBuilding className="text-sky-600 dark:text-sky-400" />
                Datos de la Empresa
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-2">Configura la información que aparece en tus comprobantes y tickets.</p>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
              <div
                className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-950 flex items-center justify-center cursor-pointer hover:border-sky-500 transition-all group relative"
                onClick={() => emisor ? logoInputRef.current?.click() : toast.error("Primero guarda los datos de la empresa")}
              >
                {emisor?.logo_url ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${emisor.logo_url}`} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <FaBuilding className="text-3xl text-gray-300 dark:text-slate-600" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <FaCamera className="text-xl text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 dark:text-slate-200">Logo de la Empresa</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{emisor ? "Haz clic para cambiar. Se usará en tickets y comprobantes." : "Guarda los datos primero para subir el logo."}</p>
                {uploadLogoMutation.isPending && <p className="text-xs text-sky-500 font-bold mt-1">Subiendo...</p>}
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && uploadLogoMutation.mutate(e.target.files[0])} />
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
              {[
                { key: "razon_social", label: "Razón Social *", placeholder: "Ej: Mi Empresa E.I.R.L.", span: 2 },
                { key: "nombre_comercial", label: "Nombre Comercial", placeholder: "Ej: Imprenta Alexander", span: 2 },
                { key: "descripcion", label: "Descripción / Giro", placeholder: "Ej: Diseño Gráfico y Publicidad", span: 2 },
                { key: "ruc", label: "RUC", placeholder: "20XXXXXXXXX", maxLength: 11 },
                { key: "telefono", label: "Teléfono", placeholder: "999-999-999" },
                { key: "direccion", label: "Dirección", placeholder: "Av. Principal 123", span: 2 },
                { key: "departamento", label: "Departamento", placeholder: "Ayacucho" },
                { key: "provincia", label: "Provincia", placeholder: "Huamanga" },
                { key: "distrito", label: "Distrito", placeholder: "Ayacucho" },
                { key: "ubigeo", label: "Ubigeo", placeholder: "050101", maxLength: 6 },
              ].map(({ key, label, placeholder, span, maxLength }) => (
                <div key={key} className={`space-y-1 ${span === 2 ? "md:col-span-2" : ""}`}>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={empresaForm[key] || ""}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, [key]: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-gray-700 dark:text-slate-200 font-medium"
                  />
                </div>
              ))}
            </div>

            {/* SUNAT */}
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4">Credenciales SUNAT (SOL)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Usuario SOL</label>
                  <input
                    type="text"
                    placeholder="MODDATOS"
                    value={empresaForm.usuario_sol || ""}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, usuario_sol: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-gray-700 dark:text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Clave SOL</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={empresaForm.clave_sol || ""}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, clave_sol: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-gray-700 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              className="w-full max-w-3xl py-5 bg-sky-700 hover:bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-8 cursor-pointer"
              onClick={() => {
                if (!empresaForm.razon_social?.trim()) {
                  toast.error("La Razón Social es obligatoria");
                  return;
                }
                saveEmisorMutation.mutate(empresaForm);
              }}
              disabled={saveEmisorMutation.isPending}
            >
              {saveEmisorMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>

      {/* MODAL CREAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up border dark:border-slate-800">
            <div className="bg-sky-900 dark:bg-slate-950 p-8 text-white relative">
              <h2 className="text-2xl font-black">{form.id ? "Editar Miembro" : "Nuevo Miembro"}</h2>
              <p className="text-sky-300 text-sm mt-1">
                {form.id ? `Actualizando perfil de ${form.usuario}` : "Registra un nuevo usuario en la plataforma"}
              </p>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Nombre de Usuario</label>
                <input 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100"
                  placeholder="Ej: jdoe"
                  value={form.usuario}
                  onChange={e => setForm({...form, usuario: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Rol Administrativo</label>
                <select 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-bold text-gray-800 dark:text-slate-100"
                  value={form.cargo}
                  onChange={e => setForm({...form, cargo: e.target.value})}
                >
                  <option value="Usuario">Usuario Estándar</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Password {form.id && "(Opcional)"}</label>
                  <input 
                    type="password"
                    placeholder="••••"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none text-gray-800 dark:text-slate-100"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">Confirmar</label>
                  <input 
                    type="password"
                    placeholder="••••"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none text-gray-800 dark:text-slate-100"
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={closeModal}
                  className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-2xl font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button 
                  onClick={handleSaveUser}
                  disabled={createMutation.isPending || updateOtherUserMutation.isPending}
                  className="flex-1 py-4 bg-sky-700 hover:bg-sky-600 text-white rounded-2xl font-black shadow-lg shadow-sky-900/20 transition-all cursor-pointer"
                >
                  {createMutation.isPending || updateOtherUserMutation.isPending ? "..." : (form.id ? "Actualizar" : "Crear")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;
