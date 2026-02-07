/**
 * Database initialization script
 * This runs automatically when the application starts
 * For PostgreSQL/Neon, tables are created directly via Prisma migrations
 */

export async function initializeDatabase() {
  console.log('[DB-INIT] ========== DATABASE INITIALIZATION START ==========')
  console.log('[DB-INIT] Environment check:', {
    hasDATABASE_URL: !!process.env.DATABASE_URL,
  })
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('[DB-INIT] ERROR: DATABASE_URL not found')
    console.error('[DB-INIT] Available env vars:', Object.keys(process.env).filter(k => k.includes('SQL') || k.includes('DATABASE')))
    return
  }

  try {
    console.log('[DB-INIT] Database URL found')
    
    // Import Prisma and initialize default admin user if needed
    const { prisma } = await import('./prisma')
    
    // Check if users exist
    const userCount = await prisma.usuario.count()
    
    if (userCount === 0) {
      console.log('[DB-INIT] Creating default admin user...')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.default.hash('admin123', 10)
      
      await prisma.usuario.create({
        data: {
          nombre: 'Administrador',
          email: 'admin@cmms.com',
          password: hashedPassword,
          rol: 'administrador',
          activo: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      })
      
      console.log('[DB-INIT] Default admin user created (email: admin@cmms.com, password: admin123)')
    }

    console.log('[DB-INIT] Database initialization completed successfully')
  } catch (error) {
    console.error('[DB-INIT] Error initializing database:', error)
    throw error
  }
}
