"use server"

import {
  fetchUsuarios as fetchUsuariosApi,
  fetchUsuarioDetails as fetchUsuarioDetailsApi,
  createUsuario as createUsuarioApi,
  updateUsuario as updateUsuarioApi,
  deleteUsuario as deleteUsuarioApi,
  updateUsuarioPermissions as updateUsuarioPermissionsApi,
  resetUsuarioPassword as resetUsuarioPasswordApi,
  toggleUsuarioEstado as toggleUsuarioEstadoApi,
  getUserActivity as getUserActivityApi, // Added import for getUserActivity
  type Usuario,
  type UsuarioWithPassword,
  type FetchUsuariosParams,
  type UsuariosResponse,
  type UserActivity, // Added import for UserActivity type
} from "@/lib/api/usuarios"

export async function fetchUsuarios(params: FetchUsuariosParams = {}): Promise<UsuariosResponse> {
  try {
    return await fetchUsuariosApi(params)
  } catch (error) {
    console.error("Error fetching usuarios:", error)
    throw error
  }
}

export async function fetchUsuarioDetails(id: number): Promise<Usuario | null> {
  try {
    return await fetchUsuarioDetailsApi(id)
  } catch (error) {
    console.error("Error fetching usuario details:", error)
    return null
  }
}

export async function saveUsuario(usuario: UsuarioWithPassword): Promise<{
  success: boolean
  usuario?: Usuario
  error?: string
}> {
  try {
    let savedUsuario: Usuario

    if (usuario.id) {
      // Update existing usuario
      savedUsuario = await updateUsuarioApi(usuario.id, usuario)
    } else {
      // Create new usuario
      savedUsuario = await createUsuarioApi(usuario)
    }

    return {
      success: true,
      usuario: savedUsuario,
    }
  } catch (error: any) {
    console.error("Error saving usuario:", error)
    return {
      success: false,
      error: error.message || "Error al guardar el usuario",
    }
  }
}

export async function removeUsuario(id: number): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await deleteUsuarioApi(id)
    return { success: true }
  } catch (error: any) {
    console.error("Error removing usuario:", error)
    return {
      success: false,
      error: error.message || "Error al eliminar el usuario",
    }
  }
}

export async function updatePermissions(
  id: number,
  permissions: Usuario["permissions"],
): Promise<{
  success: boolean
  usuario?: Usuario
  error?: string
}> {
  try {
    const updatedUsuario = await updateUsuarioPermissionsApi(id, permissions)
    return {
      success: true,
      usuario: updatedUsuario,
    }
  } catch (error: any) {
    console.error("Error updating permissions:", error)
    return {
      success: false,
      error: error.message || "Error al actualizar permisos",
    }
  }
}

export async function resetPassword(
  id: number,
  newPassword: string,
): Promise<{
  success: boolean
  usuario?: Usuario
  error?: string
}> {
  try {
    const updatedUsuario = await resetUsuarioPasswordApi(id, newPassword)
    return {
      success: true,
      usuario: updatedUsuario,
    }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      error: error.message || "Error al restablecer la contraseña",
    }
  }
}

export async function toggleUserStatus(
  id: number,
  nuevoEstado: "Activo" | "Inactivo",
): Promise<{
  success: boolean
  usuario?: Usuario
  error?: string
}> {
  try {
    console.log("[v0] Action: toggleUserStatus called", { id, nuevoEstado })

    const usuario = await toggleUsuarioEstadoApi(id, nuevoEstado)

    console.log("[v0] Action: toggleUserStatus success", { usuario })

    return {
      success: true,
      usuario,
    }
  } catch (error: any) {
    console.error("[v0] Action: toggleUserStatus error", {
      id,
      nuevoEstado,
      error: error.message,
      stack: error.stack,
    })

    return {
      success: false,
      error: error.message || "Error al cambiar el estado del usuario",
    }
  }
}

export async function getUserActivity(usuarioId: number, token: string): Promise<UserActivity> {
  try {
    return await getUserActivityApi(usuarioId, token)
  } catch (error) {
    console.error("Error fetching user activity:", error)
    throw error
  }
}

export type { UserActivity, Usuario, UsuarioWithPassword, FetchUsuariosParams, UsuariosResponse }
