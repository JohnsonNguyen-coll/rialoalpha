import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('URL:', url);
console.log('Token length:', authToken?.length);

try {
    const client = createClient({ url, authToken });
    const rs = await client.execute('SELECT 1');
    console.log('Success:', rs.rows);
    process.exit(0);
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
