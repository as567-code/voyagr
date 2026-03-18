const { writeFileSync, mkdirSync } = require('fs');
const { resolve, dirname } = require('path');
const dotenv = require('dotenv');
dotenv.config();

const targetPath = resolve(__dirname, './src/environments/environment.ts');
mkdirSync(dirname(targetPath), { recursive: true });
const envConfigFile = `export const environment = {
  production: false,
  openRouterApiKey: '${process.env.OPENROUTER_API_KEY}',
  apiUrl: '${process.env.API_URL || ''}',
  backendUrl: '${process.env.BACKEND_URL || 'http://localhost:3000'}',
};`;

writeFileSync(targetPath, envConfigFile, { encoding: 'utf8' });

console.log(`Output generated at ${targetPath}`);
