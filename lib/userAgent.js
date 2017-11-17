import crypto from 'crypto';
import os from 'os';
import bundle from '../package.json';

const instanceHash = crypto.createHash('sha1').update(__dirname || '').digest('hex'); // this is questionable -at best-

/**
 * Set an arbitrary user-agent
 */
export default `pipedrive-client-nodejs/${bundle.version} (${os.type()}; ${os.platform()}/${os.release()} ${instanceHash})`;
