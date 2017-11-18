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

		this.apiToken = apiToken;

		apiObjects.forEach((path) => {
			this[Util.ucFirst(path)] = new Collection(path, Object.assign({}, this.options, { apiToken }));
		});

		this.listeners = [];
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

	/**
	 * Registers a webhook listener. Promise is returned once the hook is set up.
	 * @param params
	 * @param path
	 * @param express
	 * @returns {*}
	 */
	registerWebhook(params = { }, path, express) {
		if (!params.subscription_url || !params.event_action || !params.event_object) {
			throw new Error('Missing a parameter! Registering a webhook requires: subscription_url, event_action and event_object');
		}

		express.Router().get(path, (req, res) => {
			this.listeners.forEach(({ method, handler }) => {
				if (method) {
					handler();
				}
			});
			res.end('OK');
		});

		return request.post({
			url: apiUrl('webhooks', Object.assign({}, this.options, { apiToken: this.apiToken }), true),
			formData: params,
			json: true,
		});
	}

	/**
	 * Get active webhooks
	 * @returns {Promise.<*>}
	 */
	getWebhooks() {
		return request.get({
			url: apiUrl('webhooks', Object.assign({}, this.options, { apiToken: this.apiToken }), true),
			json: true,
		});
	}

	/**
	 * Add a new webhook Event Listener
	 * @param method
	 * @param handler
	 */
	on(method, handler) {
		this.listeners.push({method, handler});
	}
}

export class Util {
	/**
	 * Make the first letter of a string uppercase
	 * @param {string} str
	 * @returns {string}
	 */
	static ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}