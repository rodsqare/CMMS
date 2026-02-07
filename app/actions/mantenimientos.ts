"use server"

import { prisma } from "@/lib/prisma"

export type Mantenimiento = {
  id: number
  equipo_id: number
  tipo: string
  descripcion?: string | null
  frecuencia: string
  ultima_fecha?: string | null
  proxima_fecha: string
  tecnico_asignado?: string | null
  resultado?: string | null
  costo?: number | null
  created_at?: string
  updated_at?: string
}

export async function getAllMantenimientos(params?: {
  page?: number
  perPage?: number
  tipo?: string
  frecuencia?: string
  resultado?: string
  search?: string
}) {
  try {
    const page = params?.page || 1
    const perPage = params?.perPage || 10
    const skip = (page - 1) * perPage

    const where: any = {}
    
    if (params?.tipo) {
      where.tipo = params.tipo
    }
    
    if (params?.frecuencia) {
      where.frecuencia = params.frecuencia
    }
    
    if (params?.resultado) {
      where.resultado = params.resultado
    }
    
    if (params?.search) {
      where.OR = [
        { descripcion: { contains: params.search } },
        { tecnico_asignado: { contains: params.search } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.mantenimiento.findMany({
        where,
        include: {
          equipo: true,
        },
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' }
      }),
      prisma.mantenimiento.count({ where })
    ])

    return { data, total, page, perPage }
  } catch (error) {
    console.error("[v0] Error fetching mantenimientos:", error)
    return { data: [], total: 0, page: 1, perPage: 10 }
  }
}

export async function getMantenimientoById(id: number) {
  try {
    return await prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        equipo: true,
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching mantenimiento:", error)
    return null
  }
}

export async function createMantenimiento(mantenimiento: any) {
  console.log("[v0] Action: Creating maintenance", mantenimiento)

  try {
    const result = await prisma.mantenimiento.create({
      data: {
        equipo_id: mantenimiento.equipoId,
        tipo: mantenimiento.tipo?.toLowerCase(),
        descripcion: mantenimiento.descripcion,
        frecuencia: mantenimiento.frecuencia?.toLowerCase(),
        ultima_fecha: mantenimiento.ultimaFecha,
        proxima_fecha: mantenimiento.proximaFecha,
        tecnico_asignado: mantenimiento.tecnicoAsignado,
        resultado: mantenimiento.resultado?.toLowerCase() || "pendiente",
        costo: mantenimiento.costo,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    console.log("[v0] Action: Maintenance created successfully", result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("[v0] Action: Error creating maintenance", error)
    const errorMessage = error.message || "Error al crear el mantenimiento"
    return { success: false, error: errorMessage }
  }
}

export async function updateMantenimiento(id: number, mantenimiento: any) {
  console.log("[v0] Action: Updating maintenance", id, mantenimiento)

  try {
    const result = await prisma.mantenimiento.update({
      where: { id },
      data: {
        equipo_id: mantenimiento.equipoId,
        tipo: mantenimiento.tipo?.toLowerCase(),
        descripcion: mantenimiento.descripcion,
        frecuencia: mantenimiento.frecuencia?.toLowerCase(),
        ultima_fecha: mantenimiento.ultimaFecha,
        proxima_fecha: mantenimiento.proximaFecha,
        tecnico_asignado: mantenimiento.tecnicoAsignado,
        resultado: mantenimiento.resultado?.toLowerCase(),
        costo: mantenimiento.costo,
        updated_at: new Date(),
      }
    })
    console.log("[v0] Action: Maintenance updated successfully", result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error("[v0] Action: Error updating maintenance", error)
    const errorMessage = error.message || "Error al actualizar el mantenimiento"
    return { success: false, error: errorMessage }
  }
}

export async function deleteMantenimiento(id: number) {
  console.log("[v0] Action: Deleting maintenance", id)

  try {
    await prisma.mantenimiento.delete({
      where: { id }
    })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Action: Error deleting maintenance", error)
    const errorMessage = error.message || "Error al eliminar el mantenimiento"
    return { success: false, error: errorMessage }
  }
}

export async function getMantenimientosStats() {
  try {
    const [total, preventivo, correctivo, activos, inactivos] = await Promise.all([
      prisma.mantenimiento.count(),
      prisma.mantenimiento.count({ where: { tipo: 'preventivo' } }),
      prisma.mantenimiento.count({ where: { tipo: 'correctivo' } }),
      prisma.mantenimiento.count({ where: { activo: true } }),
      prisma.mantenimiento.count({ where: { activo: false } }),
    ])

    return {
      total,
      preventivo,
      correctivo,
      pendientes: activos,
      completados: inactivos,
    }
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return { total: 0, preventivo: 0, correctivo: 0, pendientes: 0, completados: 0 }
  }
}

export async function checkUpcomingMaintenances() {
  try {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const upcoming = await prisma.mantenimiento.findMany({
      where: {
        proxima_programada: {
          gte: today,
          lte: nextWeek,
        },
        activo: true
      },
      include: {
        equipo: true,
      }
    })

    console.log("[v0] Upcoming maintenances checked:", { count: upcoming.length })
    return { upcoming, count: upcoming.length }
  } catch (error) {
    console.error("[v0] Error checking upcoming maintenances:", error)
    return { upcoming: [], count: 0 }
  }
}
