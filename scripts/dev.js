const { spawn } = require('child_process');

console.log('====================================================');
console.log(' 🥗 GREESAL - Starting Unified Development Stack');
console.log('====================================================');

// 1. Start Python FastAPI Server
console.log('🚀 [1/2] Starting Python FastAPI backend on port 8000...');
const backend = spawn('python', ['backend/run.py'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

// 2. Start Next.js Frontend Server
console.log('⚡ [2/2] Starting Next.js frontend on port 3000...');
const frontend = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

const cleanup = () => {
  console.log('\n🛑 Shutting down Greesal development servers...');
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
