const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✓ Cleaned .next directory');
  } catch (err) {
    console.warn('Warning: Could not remove .next directory:', err.message);
  }
}
