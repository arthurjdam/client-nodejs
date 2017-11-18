import request from 'request-promise-native';
import inflection from 'inflection';
import apiUrl from './apiUrl';
import { apiRelatedObjects, editableSubItems, selfManagedRelatedObjects } from './blueprint';
import { Util } from './Pipedrive';
import Collection from './Collection';

export default class CollectionItem {
	/**
	 * constructor
	 * @param kind
	 * @param data
	 * @param option
	 */
	constructor(kind, data, options) {
		this.kind = kind;
		this.id = data.id;
		this.options = options;
		this.params = {};

		Object.keys(data).forEach((key) => {
			this.params[key] = data[key];
		});

		if (apiRelatedObjects[this.kind]) {
			apiRelatedObjects[this.kind].forEach((obj) => {
				this.generateSubMethod('get', obj);
			});
		}

		if (editableSubItems[this.kind]) {
			editableSubItems[this.kind].forEach((obj) => {
				this.generateSubMethod('add', obj);
				this.generateSubMethod('update', obj);
				this.generateSubMethod('delete', obj);
			});
		}
	}

	/**
	 * Generator for sub-methods of a CollectionItem (i.e. getProducts, addDeal, etc.)
	 * @param method
	 * @param object
	 */
	generateSubMethod(method, object) {
		let suffix = Util.ucFirst(object);

		if (method !== 'get') {
			suffix = inflection.singularize(suffix);
		}

		const key = `${this.kind}/${this.id}/${object}`;
		let relatedObjectPath = object;

		if (selfManagedRelatedObjects.indexOf(object) !== -1) {
			relatedObjectPath = key;
		}

		switch (method) {
			case 'get':
				this[`${method.toLowerCase()}${suffix}`] = params =>
					request.get({
						url: apiUrl(key, Object.assign({}, this.options, params), true),
						json: this.params,
					}).then(entities => entities.data.map(entity => new CollectionItem(relatedObjectPath, entity, this.options)));
				break;
			case 'add':
				this[`${method.toLowerCase()}${suffix}`] = params =>
					request.post({
						url: apiUrl(key, Object.assign({}, this.options, params), true),
						formData: params,
						json: this.params,
					}).then(entities => entities.data.map(entity => new CollectionItem(relatedObjectPath, entity, this.options)));
				break;
			case 'update':
				this[`${method.toLowerCase()}${suffix}`] = params =>
					request.put({
						url: apiUrl(key, Object.assign({}, this.options), true),
						json: params,
					}).then(entities => entities.data.map(entity => new CollectionItem(relatedObjectPath, entity, this.options)));
				break;
			case 'delete':
				this[`${method.toLowerCase()}${suffix}`] = params =>
					request.del({
						url: apiUrl(key, Object.assign({}, this.options), true),
						json: params,
					}).then(entities => entities.data.map(entity => new CollectionItem(relatedObjectPath, entity, this.options)));
				break;
			default:
				break;
		}
	}

	/**
	 * Save changes made to this item
	 * @returns {Promise.<*>}
	 */
	async save() {
		return request.put({
			url: apiUrl(`${this.kind}/${this.id}`, Object.assign({}, this.options), true),
			json: this.params,
		});
	}

	/**
	 * Remove this item
	 * @returns {Promise.<*>}
	 */
	async remove() {
		return request.del({
			url: apiUrl(`${this.kind}/${this.id}`, Object.assign({}, this.options), true),
			json: true,
		});
	}

	/**
	 * Merge this item with one of a similar type
	 * @param withId
	 * @returns {Promise.<*>}
	 */
	async merge(withId) {
		return request.post({
			url: apiUrl(`${this.kind}/${this.id}/merge`, Object.assign({}, this.options, { merge_with_id: withId }), true),
			json: this.params,
		});
	}

	/**
	 * Duplicate this item
	 * @returns {Promise.<*>}
	 */
	async duplicate() {
		return request.post({
			url: apiUrl(`${this.kind}/${this.id}/duplicate`, Object.assign({}, this.options), true),
			json: this.params,
		});
	}

	/**
	 * Get the value of this item
	 * @param key
	 * @returns {*}
	 */
	getByKey(key) {
		return this.params[key];
	}

	/**
	 * Set the value of this item
	 * @param key
	 * @param value
	 * @returns {CollectionItem}
	 */
	setKey(key, value) {
		if (key === 'id') {
			throw new Error(`${inflection.capitalize(this.kind)} ID cannot be changed.`);
		}

		if (key !== null && !(typeof key === 'object' || typeof key === 'undefined')) {
			this[key] = value;
		}

		return this;
	}

	/**
	 * Get this item as an Object
	 * @returns {{}}
	 */
	toObject() {
		const obj = {};
		Object.keys(this).forEach((key) => {
			if (typeof this[key] !== 'function') {
				obj[key] = this[key];
			}
		});
		return obj;
	}
}
