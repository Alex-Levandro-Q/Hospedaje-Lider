const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createManager() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const manager = await prisma.usuario.create({
      data: {
        nombre: 'Gerente',
        apellidos: 'Sistema',
        email: 'gerente@gmail.com',
        fechaNac: new Date('1990-01-01'),
        numeroCarnet: '12345678',
        rol: 'gerente',
        password: hashedPassword
      }
    });
    
    console.log('✅ Usuario gerente creado exitosamente:');
    console.log('Email: gerente@gmail.com');
    console.log('Carnet: 12345678');
    console.log('Contraseña: 123456');
    console.log('Rol: gerente');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ El usuario gerente ya existe');
    } else {
      console.error('❌ Error creando usuario gerente:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createManager();