import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno del archivo .env.test
const envFile = path.join(__dirname, '..', '.env.test');
dotenv.config({ path: envFile });

// Configurar timeout para las pruebas e2e
jest.setTimeout(30000);
