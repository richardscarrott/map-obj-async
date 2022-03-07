const test = require('ava');
const mapObject = require('./index.js');
const {mapObjectSkip} = require('./index.js');

test('main', async t => {
	t.is((await mapObject({foo: 'bar'}, key => [key, 'unicorn'])).foo, 'unicorn');
	t.is((await mapObject({foo: 'bar'}, (key, value) => ['unicorn', value])).unicorn, 'bar');
	t.is((await mapObject({foo: 'bar'}, (key, value) => [value, key])).bar, 'foo');
});

test('target option', async t => {
	const target = {};
	t.is(await mapObject({foo: 'bar'}, (key, value) => [value, key], {target}), target);
	t.is(target.bar, 'foo');
});

test('deep option', async t => {
	const object = {
		one: 1,
		object: {
			two: 2,
			three: 3,
		},
		array: [
			{
				four: 4,
			},
			5,
		],
	};

	const expected = {
		one: 2,
		object: {
			two: 4,
			three: 6,
		},
		array: [
			{
				four: 8,
			},
			5,
		],
	};

	const mapper = (key, value) => [key, typeof value === 'number' ? value * 2 : value];
	const actual = await mapObject(object, mapper, {deep: true});
	t.deepEqual(actual, expected);
});

test('shouldRecurse mapper option', async t => {
	const object = {
		one: 1,
		object: {
			two: 2,
			three: 3,
		},
		array: [
			{
				four: 4,
			},
			5,
		],
	};

	const expected = {
		one: 2,
		object: {
			two: 2,
			three: 3,
		},
		array: [
			{
				four: 8,
			},
			5,
		],
	};

	const mapper = (key, value) => {
		if (key === 'object') {
			return [key, value, {shouldRecurse: false}];
		}

		return [key, typeof value === 'number' ? value * 2 : value];
	};

	const actual = await mapObject(object, mapper, {deep: true});
	t.deepEqual(actual, expected);
});

test('nested arrays', async t => {
	const object = {
		array: [
			[
				0,
				1,
				2,
				{
					a: 3,
				},
			],
		],
	};

	const expected = {
		array: [
			[
				0,
				1,
				2,
				{
					a: 6,
				},
			],
		],
	};

	const mapper = (key, value) => [key, typeof value === 'number' ? value * 2 : value];
	const actual = await mapObject(object, mapper, {deep: true});
	t.deepEqual(actual, expected);
});

test('handles circular references', async t => {
	const object = {
		one: 1,
		array: [
			2,
		],
	};
	object.circular = object;
	object.array2 = object.array;
	object.array.push(object);

	const mapper = (key, value) => [key.toUpperCase(), value];
	const actual = await mapObject(object, mapper, {deep: true});

	const expected = {
		ONE: 1,
		ARRAY: [
			2,
		],
	};
	expected.CIRCULAR = expected;
	expected.ARRAY2 = expected.ARRAY;
	expected.ARRAY.push(expected);

	t.deepEqual(actual, expected);
});

test('validates input', async t => {
	await t.throwsAsync(async () => {
		await mapObject(1, () => {});
	}, {
		instanceOf: TypeError,
	});

	await t.throwsAsync(async () => {
		await mapObject([1, 2], (key, value) => [value, key]);
	}, {
		instanceOf: TypeError,
	});
});

test('__proto__ keys are safely dropped', async t => {
	const input = {['__proto__']: {one: 1}};
	const output = await mapObject(input, (key, value) => [key, value]);
	t.deepEqual(output, {});

	// AVA's equality checking isn't quite strict enough to catch the difference
	// between plain objects as prototypes and Object.prototype, so we also check
	// the prototype by identity
	t.is(Object.getPrototypeOf(output), Object.prototype);
});

test('remove keys (#36)', async t => {
	const object = {
		one: 1,
		two: 2,
	};

	const expected = {
		one: 1,
	};

	const mapper = (key, value) => value === 1 ? [key, value] : mapObjectSkip;
	const actual = await mapObject(object, mapper, {deep: true});
	t.deepEqual(actual, expected);
});

test('supports async mapper', async t => {
	const object = {
		one: 1,
		object: {
			two: 2,
			three: 3,
		},
		array: [
			{
				four: 4,
			},
			5,
		],
	};

	const expected = {
		one: 2,
		object: {
			two: 4,
			three: 6,
		},
		array: [
			{
				four: 8,
			},
			5,
		],
	};

	const mapper = async (key, value) => [key, typeof value === 'number' ? value * 2 : value];
	const actual = await mapObject(object, mapper, {deep: true});
	t.deepEqual(actual, expected);
});
