import qs from 'qs';
import { apiObjects } from './blueprint';

const protocol = 'https';
const host = process.env.PIPEDRIVE_API_HOST || 'api.pipedrive.com';
const version = process.env.PIPEDRIVE_API_VERSION || 'v1';
const baseUri = `${protocol}://${host}/${version}`;

/**
 * Get the relevant path for a given api method
 * @param {string} path
 * @param {object} options
 * @param {boolean} tokenNeeded
 * @returns {string}
 */
export default (path, options = { }, tokenNeeded = false) => {
	const queryObj = Object.assign({}, options);

	if (apiObjects.indexOf(path.split('/')[0]) <= -1) {
		throw new Error('invalid path');
	}

	if (tokenNeeded) {
		queryObj.api_token = options.apiToken;
	}

	if (options.strictMode === true) {
		queryObj.strict_mode = '1';
	}

	return `${baseUri}/${path}${(Object.keys(queryObj).length > 0 ? `?${qs.stringify(queryObj)}` : '')}`;
};
