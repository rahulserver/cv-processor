const { spawnSync } = require('child_process');

// Run the Next.js build process
const result = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

// Exit with the same code as the build process
process.exit(result.status);
