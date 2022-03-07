import {expectType, expectAssignable} from 'tsd';
import mapObject, {Options, mapObjectSkip} from './index.js';

const options: Options = {}; // eslint-disable-line @typescript-eslint/no-unused-vars

const newObject = await mapObject({foo: 'bar'}, (key, value) => [value, key]);
expectType<Record<string, 'foo'>>(newObject);
expectType<'foo'>(newObject.bar);

const object = await mapObject({foo: 'bar'}, (key, value) => [value, key], {
	target: {baz: 'baz'},
});
expectType<{baz: string} & Record<string, 'foo'>>(object);
expectType<'foo'>(object.bar);
expectType<string>(object.baz);

const object1 = await mapObject({foo: 'bar'}, (key, value) => [value, key], {
	target: {baz: 'baz'},
	deep: false,
});
expectType<{baz: string} & Record<string, 'foo'>>(object1);
expectType<'foo'>(object1.bar);
expectType<string>(object1.baz);

const object2 = await mapObject({foo: 'bar'}, (key, value) => [value, key], {
	deep: true,
});
expectType<Record<string, unknown>>(object2);
const object3 = await mapObject({foo: 'bar'}, (key, value) => [value, key], {
	deep: true,
	target: {bar: 'baz' as const},
});
expectAssignable<Record<string, unknown>>(object3);
expectType<'baz'>(object3.bar);

await mapObject({foo: 'bar'}, (key, value) => [value, key, {shouldRecurse: false}]);

await mapObject({foo: 'bar'}, () => mapObjectSkip);
