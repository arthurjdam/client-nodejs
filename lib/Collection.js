import request from 'request-promise-native';
import inflection from 'inflection';
import apiUrl from './apiUrl';
import CollectionItem from './CollectionItem';
import {
	mergeableObjects,
	objectsSupportingFieldValueSearch,
	searchableObjects,
	supportedFieldTypes,
	timelineableObjects,
} from './blueprint';

export default class Collection {
	constructor(kind, options) {
		this.kind = kind;
		this.options = options;

		if (mergeableObjects.indexOf(this.kind) !== -1) {
			this.merge = this.mergeInternal;
		}

		if (searchableObjects.indexOf(this.kind) !== -1) {
			this.find = this.findInternal;
		}

		if (timelineableObjects.indexOf(this.kind) !== -1) {
			this.timeline = this.timelineInternal;
		}

		if (objectsSupportingFieldValueSearch.indexOf(this.kind) !== -1) {
			this.field = this.fieldInternal;
		}
	}

	/**
	 * Get all objects from this collection
	 * @param params
	 * @returns {Promise.<*>}
	 */
	async getAll(params = {}) {
		return request({
			url: apiUrl(this.kind, Object.assign({}, this.options, params), true),
			json: true,
		}).then(items => items.data.map(item => new CollectionItem(this.kind, item)));
	}

	/**
	 * Get a single object from this collection
	 * @param id
	 * @param params
	 * @returns {Promise.<*>}
	 */
	async getOne(id, params = {}) {
		if (!id) {
			throw new Error(`Cannot get ${inflection.singularize(this.kind)} - ID must be given.`);
		}

		return request({
			url: apiUrl(`${this.kind}/${id}`, Object.assign({}, this.options, params), true),
			json: true,
		}).then(item => new CollectionItem(this.kind, item.data));
	}

	/**
	 * Add a new object to this collection
	 * @param params
	 * @returns {Promise.<void>}
	 */
	async add(params = {}) {
		return request.post({
			url: apiUrl(this.kind, Object.assign({}, this.options), true),
			formData: params,
			json: true,
		});
	}

	async remove(id) {
		if (!id) {
			throw new Error(`Cannot get ${inflection.singularize(this.kind)} - ID must be given.`);
		}

		return request.del({
			url: apiUrl(`${this.kind}/${id}`, Object.assign({}, this.options), true),
			json: true,
		});
	}

	async removeMany(ids) {
		if (!ids) {
			throw new Error(`Cannot get ${inflection.singularize(this.kind)} - ID must be given.`);
		}

		return request.del({
			url: apiUrl(`${this.kind}/${ids.join(',')}`, Object.assign({}, this.options), true),
			json: true,
		});
	}

	async update(id, params) {
		if (!id) {
			throw new Error(`Cannot get ${inflection.singularize(this.kind)} - ID must be given.`);
		}

		return request.put({
			url: apiUrl(`${this.kind}/${id}`, Object.assign({}, this.options), true),
			json: params,
		});
	}

	// update (id, params)

	mergeInternal(whichId, withId) {
		if (!whichId || !withId) {
			throw new Error('The parameters whichId and withId must be provided.');
		}
		//some post request
	}

	findInternal(params = {}) {
		if (!params.term) {
			throw new Error(`The term parameter must be supplied for finding ${this.kind}.`);
		}

		return request({
			url: apiUrl(this.kind, Object.assign({}, this.options, params), true),
			json: true,
		}).then(items => items.data.map(item => new CollectionItem(this.kind, item)));
	}

	timelineInternal(params = {}) {
		return request({
			url: apiUrl(`${this.kind}/timeline`, Object.assign({}, this.options, params), true),
			json: true,
		});
	}

	fieldInternal(params = {}) {
		if (!params.field_type || !params.field_key || !params.term) {
			throw new Error('The field_type, field_key and term parameters must be supplied for field-value search.');
		}
		if (supportedFieldTypes.indexOf(params.field_type) < 0) {
			throw new Error(`The field_type given for field-value search was invalid. Must be one of the following: ${blueprint.supportedFieldTypes.join(', ')}`);
		}
		params.exact_match = params.exact_match ? '1' : '0';
		return request({
			url: apiUrl(`${this.kind}/field`, Object.assign({}, this.options, params), true),
			json: true,
		}).then(items => items.data.map(item => new CollectionItem(this.kind, item)));
	}
}

/*

		this.add = function(params, callback) {
			return restHandlers.addItem(kind, params, callback);
		};

		this.remove = function(id, params, callback) {
			return restHandlers.removeItem(id, kind, params, callback);
		};

		this.removeMany = function(ids, params, callback) {
			return restHandlers.removeManyItems(ids, kind, params, callback);
		};

		this.update = function(id, params, callback) {
			return restHandlers.editItem(id, kind, params, callback);
		};

	*/
