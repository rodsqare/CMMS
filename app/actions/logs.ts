"use server"

import { prisma } from "@/lib/prisma"

export async function fetchAuditLogs(search?: string, action?: string, perPage = 10) {
  try {
    const where: any = {}
    
    if (action) {
      where.accion = action
    }
    
    if (search) {
      where.OR = [
        { descripcion: { contains: search } },
        { entidad: { contains: search } },
      ]
    }

    const result = await prisma.log.findMany({
      where,
      take: perPage,
      orderBy: { created_at: 'desc' }
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[v0] fetchAuditLogs - Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al obtener logs",
      data: [],
    }
  }
}
