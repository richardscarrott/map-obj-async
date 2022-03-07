const isObject = value => typeof value === 'object' && value !== null;

// Customized for this use-case
const isObjectCustom = value =>
	isObject(value)
	&& !(value instanceof RegExp)
	&& !(value instanceof Error)
	&& !(value instanceof Date);

export const mapObjectSkip = Symbol('mapObjectSkip');

const _mapObject = async (object, mapper, options, isSeen = new WeakMap()) => {
	options = {
		deep: false,
		target: {},
		...options,
	};

	if (isSeen.has(object)) {
		return isSeen.get(object);
	}

	isSeen.set(object, options.target);

	const {target} = options;
	delete options.target;

	const mapArray = array => Promise.all(array.map(element => isObjectCustom(element) ? _mapObject(element, mapper, options, isSeen) : element));
	if (Array.isArray(object)) {
		return mapArray(object);
	}

	await Promise.all(Object.entries(object).map(async ([key, value]) => {
		const mapResult = await mapper(key, value, object);

		if (mapResult === mapObjectSkip) {
			return;
		}

		let [newKey, newValue, {shouldRecurse = true} = {}] = mapResult;

		// Drop `__proto__` keys.
		if (newKey === '__proto__') {
			return;
		}

		if (options.deep && shouldRecurse && isObjectCustom(newValue)) {
			newValue = await (Array.isArray(newValue)
				? mapArray(newValue)
				: _mapObject(newValue, mapper, options, isSeen));
		}

		target[newKey] = newValue;
	}));

	return target;
};

export default async function mapObject(object, mapper, options) {
	if (!isObject(object)) {
		throw new TypeError(`Expected an object, got \`${object}\` (${typeof object})`);
	}

	if (Array.isArray(object)) {
		throw new TypeError('Expected an object, got an array');
	}

	return _mapObject(object, mapper, options);
}
