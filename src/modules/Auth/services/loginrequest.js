import axiosURL from "../../../core/api/axiosURL";

/**
 * Obtener todos los usuarios (Rol: Admin)
 * 
 * Retorna la lista de usuarios activos.
 * @returns {Promise}
 */
export const getLogins = () => {
  return axiosURL.get("/login");
};

/**
 * Autenticar usuario
 * 
 * Valida credenciales y retorna token JWT si son correctas.
 * 
 * @param {Object} credentials - Credenciales de login
 * @param {string} credentials.usuario - Nombre de usuario
 * @param {string} credentials.password - Contraseña
 * @returns {Promise} Respuesta con token y datos del usuario
 * 
 * Ejemplo de uso:
 * const response = await authLogin({ usuario: 'admin', password: '123' });
 * localStorage.setItem('userData', JSON.stringify(response.data));
 */
export const authLogin = (credentials) => {
  return axiosURL.post("/auth/login", credentials);
};

/**
 * Crear nuevo usuario
 * 
 * Crea un nuevo usuario en el sistema.
 * Solo accesible para usuarios con rol Administrador.
 * 
 * @param {Object} login - Datos del nuevo usuario
 * @param {string} login.usuario - Nombre de usuario
 * @param {string} login.password - Contraseña
 * @param {string} login.cargo - Rol (Administrador, Usuario)
 * @returns {Promise} Respuesta con el usuario creado
 * 
 * Ejemplo de uso:
 * await createLogin({ usuario: 'nuevo', password: '123', cargo: 'Usuario' });
 */
export const createLogin = (login) => {
  return axiosURL.post("/login", login);
};

/**
 * Actualizar usuario existente
 * 
 * Actualiza los datos de un usuario.
 * El ID se extrae del objeto y se usa en la URL.
 * 
 * @param {Object} login - Datos del usuario a actualizar
 * @param {number} login.id - ID del usuario
 * @param {string} [login.usuario] - Nuevo nombre de usuario
 * @param {string} [login.password] - Nueva contraseña
 * @param {string} [login.cargo] - Nuevo rol
 * @returns {Promise} Respuesta con el usuario actualizado
 * 
 * Ejemplo de uso:
 * await updateLogin({ id: 1, usuario: 'admin2', cargo: 'Administrador' });
 */
export const updateLogin = (login) => {
  // Crear copia del objeto para no mutar el original
  const loginCopy = { ...login };
  
  // Eliminar ID del body (se usa en la URL)
  delete loginCopy.id;
  
  // PUT /login/:id con el resto de datos en el body
  return axiosURL.put(`/login/${login.id}`, loginCopy);
};

/**
 * Eliminar usuario
 * 
 * Elimina un usuario del sistema.
 * Solo accesible para usuarios con rol Administrador.
 * 
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise} Respuesta de confirmación
 * 
 * Ejemplo de uso:
 * await deleteLogin(5);
 */
export const deleteLogin = (id) => {
  return axiosURL.delete(`/login/${id}`);
};

/**
 * Subir foto de perfil
 * 
 * Envía una imagen al backend para actualizar el perfil del usuario.
 * @param {number} id - ID del usuario
 * @param {File} file - El archivo de imagen
 * @returns {Promise}
 */
export const uploadProfileImage = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosURL.put(`/login/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
