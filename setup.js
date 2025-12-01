const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando proyecto Hospedaje Líder...');

// Verificar si existe el directorio backend
const backendPath = path.join(__dirname, 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Directorio backend no encontrado');
  process.exit(1);
}

// Verificar si existen node_modules en backend
const backendNodeModules = path.join(backendPath, 'node_modules');
if (!fs.existsSync(backendNodeModules)) {
  console.log('📦 Instalando dependencias del backend...');
  try {
    execSync('npm install', { cwd: backendPath, stdio: 'inherit' });
    console.log('✅ Dependencias del backend instaladas');
  } catch (error) {
    console.error('❌ Error instalando dependencias del backend:', error.message);
    process.exit(1);
  }
}

console.log('✅ Proyecto configurado correctamente');
console.log('💡 Ejecuta "npm run dev" para iniciar frontend y backend');