/*!
 * Pipedrive REST API v1 client for Node.js based apps.
 * Published under 'pipedrive' in npm.
 *
 * Copyright (C) 2013-2016 by Pipedrive, Inc.
 * (MIT License)
*/

import request from 'request-promise-native';

import apiUrl from './apiUrl';
import { apiObjects } from './blueprint';
import Collection from './Collection';

export default class Pipedrive {
	/**
	 * constructor
	 * @param {string} apiToken
	 * @param {object} options
	 */
	constructor(apiToken, options) {
		if (!apiToken) {
			throw new Error('Could not instantiate Pipedrive API Client - apiToken not given.');
		}

		this.options = Object.assign({}, {
			apiHost: null,
			apiVersion: null,
		}, options);

		apiObjects.forEach((path) => {
			this[Pipedrive.ucFirst(path)] = new Collection(path, Object.assign({}, this.options, { apiToken }));
		});
	}

	/**
	 * Make the first letter of a string uppercase
	 * @param {string} str
	 * @returns {string}
	 */
	static ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Authenticate with a normal email/password combination
	 * @param email
	 * @param password
	 * @returns {Promise.<{success: boolean, data: UserData[], additional_data: AdditionalUserData}>}
	 */
	static authenticate({ email, password }) {
		console.warn('It is way safer to log in with an API key, use that instead where possible!');

		return request.post({ url: `${apiUrl('authorizations')}`, formData: { email, password }, json: true });
	}

	// getAll()
}
