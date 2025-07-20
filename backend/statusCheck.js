const axios = require('axios');

// Simple color functions for terminal output
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`
};

const checkStatus = async () => {
  console.log(colors.blue('🔍 Market Application Status Check\n'));

  const checks = [
    {
      name: 'Backend Server',
      url: 'http://localhost:3001/api/products',
      description: 'API endpoint accessibility'
    },
    {
      name: 'Frontend Server',
      url: 'http://localhost:3000',
      description: 'Frontend application'
    },
    {
      name: 'Database Viewer',
      url: 'http://localhost:3001/db-viewer.html',
      description: 'Database administration tool'
    }
  ];

  for (const check of checks) {
    try {
      const response = await axios.get(check.url, { timeout: 5000 });
      console.log(`${colors.green('✅')} ${check.name} - ${colors.gray(check.description)}`);
      console.log(`   ${colors.blue('→')} ${check.url} ${colors.green(`(${response.status})`)}\n`);
    } catch (error) {
      console.log(`${colors.red('❌')} ${check.name} - ${colors.gray(check.description)}`);
      console.log(`   ${colors.blue('→')} ${check.url} ${colors.red('(Failed)')}`);
      console.log(`   ${colors.yellow('⚠️')} ${error.message}\n`);
    }
  }

  console.log(colors.cyan('📋 Quick Access:'));
  console.log(`${colors.blue('🌐')} Frontend: http://localhost:3000`);
  console.log(`${colors.blue('🔧')} Backend API: http://localhost:3001/api`);
  console.log(`${colors.blue('🗄️')} Database Viewer: http://localhost:3001/db-viewer.html`);
  console.log(`${colors.blue('👤')} Admin Panel: http://localhost:3000/admin\n`);

  console.log(colors.yellow('🔐 Admin Credentials:'));
  console.log(`Email: ${colors.white('admin@market.com')}`);
  console.log(`Password: ${colors.white('admin123')}\n`);

  console.log(colors.gray('💡 Tip: Use the database viewer to see admin credentials and manage data'));
};

// Add axios as a dependency check
const checkDependencies = () => {
  try {
    require('axios');
    checkStatus();
  } catch (error) {
    console.log(colors.red('❌ Missing dependency: axios'));
    console.log(colors.yellow('📦 Install with: npm install axios'));
    process.exit(1);
  }
};

checkDependencies();
