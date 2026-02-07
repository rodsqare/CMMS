"use server"

import { prisma } from "@/lib/prisma"

export type Equipo = {
  id: number
  nombre_equipo: string
  numero_serie: string
  fabricante: string
  modelo?: string | null
  ubicacion?: string | null
  estado: string
  fecha_adquisicion?: string | null
  ultima_calibracion?: string | null
  proxima_calibracion?: string | null
  manual_pdf?: string | null
  foto?: string | null
  usuario_id?: number | null
  created_at?: string
  updated_at?: string
}

export type EquiposResponse = {
  data: Equipo[]
  total: number
  per_page: number
  current_page: number
}

export type EquipoWithDetails = Equipo & {
  mantenimientos?: any[]
  ordenes_trabajo?: any[]
}

// Obtener lista de equipos con filtros
export async function fetchEquipos(params?: {
  page?: number
  per_page?: number
  search?: string
  estado?: string
  ubicacion?: string
  fabricante?: string
}): Promise<EquiposResponse> {
  try {
    const page = params?.page || 1
    const perPage = params?.per_page || 10
    const skip = (page - 1) * perPage

    const where: any = {}
    
    if (params?.search) {
      where.OR = [
        { nombre_equipo: { contains: params.search } },
        { numero_serie: { contains: params.search } },
        { fabricante: { contains: params.search } },
        { modelo: { contains: params.search } },
      ]
    }
    
    if (params?.estado) {
      where.estado = params.estado
    }
    
    if (params?.ubicacion) {
      where.ubicacion = { contains: params.ubicacion }
    }
    
    if (params?.fabricante) {
      where.fabricante = { contains: params.fabricante }
    }

    const [equipos, total] = await Promise.all([
      prisma.equipo.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' }
      }),
      prisma.equipo.count({ where })
    ])

    return {
      data: equipos as any[],
      total,
      per_page: perPage,
      current_page: page,
    }
  } catch (error) {
    console.error("[v0] Error fetching equipos:", error)
    return {
      data: [],
      total: 0,
      per_page: 10,
      current_page: 1,
    }
  }
}

// Obtener detalles de un equipo
export async function fetchEquipoDetails(id: number): Promise<EquipoWithDetails | null> {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        mantenimientos: true,
        ordenes_trabajo: true,
      }
    })
    
    return equipo as any
  } catch (error) {
    console.error("Error fetching equipo details:", error)
    return null
  }
}

// Guardar equipo (crear o actualizar)
export async function saveEquipo(data: Equipo, userId?: string): Promise<{ success: boolean; equipo?: Equipo; error?: string }> {
  try {
    console.log(`[v0] Server Action: saveEquipo called with userId ${userId}`, data)

    let equipo: any
    if (data.id && data.id > 0) {
      equipo = await prisma.equipo.update({
        where: { id: data.id },
        data: {
          nombre_equipo: data.nombre_equipo,
          numero_serie: data.numero_serie,
          fabricante: data.fabricante,
          modelo: data.modelo,
          ubicacion: data.ubicacion,
          estado: data.estado,
          fecha_adquisicion: data.fecha_adquisicion,
          ultima_calibracion: data.ultima_calibracion,
          proxima_calibracion: data.proxima_calibracion,
          manual_pdf: data.manual_pdf,
          foto: data.foto,
          usuario_id: userId ? parseInt(userId) : null,
          updated_at: new Date(),
        }
      })
    } else {
      const { id, created_at, updated_at, ...createData } = data
      
      equipo = await prisma.equipo.create({
        data: {
          nombre_equipo: createData.nombre_equipo || "",
          numero_serie: createData.numero_serie || "",
          fabricante: createData.fabricante || "",
          modelo: createData.modelo || "",
          ubicacion: createData.ubicacion || "",
          estado: createData.estado || "operativo",
          fecha_adquisicion: createData.fecha_adquisicion,
          ultima_calibracion: createData.ultima_calibracion,
          proxima_calibracion: createData.proxima_calibracion,
          manual_pdf: createData.manual_pdf,
          foto: createData.foto,
          usuario_id: userId ? parseInt(userId) : null,
          created_at: new Date(),
          updated_at: new Date(),
        }
      })
    }

    console.log("[v0] Equipment saved successfully:", equipo)
    return { success: true, equipo }
  } catch (error) {
    console.error("[v0] Error saving equipo:", error)

    let errorMessage = "Error al guardar el equipo"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return { success: false, error: errorMessage }
  }
}

// Eliminar equipo
export async function removeEquipo(id: number, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[v0] Server Action: removeEquipo called with ID ${id} and userId ${userId}`)
    await prisma.equipo.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting equipo:", error)
    return { success: false, error: "Error al eliminar el equipo" }
  }
}
