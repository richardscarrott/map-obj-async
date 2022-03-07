/**
Return this value from a `mapper` function to remove a key from an object.

@example
```
import mapObject, {mapObjectSkip} from 'map-obj';

const object = {one: 1, two: 2}
const mapper = (key, value) => value === 1 ? [key, value] : mapObjectSkip
const result = await mapObject(object, mapper);

console.log(result);
//=> {one: 1}
```
*/
export const mapObjectSkip: unique symbol;

export type Mapper<
	SourceObjectType extends Record<string, any>,
	MappedObjectKeyType extends string,
	MappedObjectValueType,
> = (
	sourceKey: keyof SourceObjectType,
	sourceValue: SourceObjectType[keyof SourceObjectType],
	source: SourceObjectType
) => Promise<[
	targetKey: MappedObjectKeyType,
	targetValue: MappedObjectValueType,
	mapperOptions?: MapperOptions,
] | typeof mapObjectSkip> | [
	targetKey: MappedObjectKeyType,
	targetValue: MappedObjectValueType,
	mapperOptions?: MapperOptions,
] | typeof mapObjectSkip;

export interface Options {
	/**
	Recurse nested objects and objects in arrays.

	@default false
	*/
	readonly deep?: boolean;

	/**
	The target object to map properties on to.

	@default {}
	*/
	readonly target?: Record<string, any>;
}

export interface DeepOptions extends Options {
	readonly deep: true;
}

export interface TargetOptions<TargetObjectType extends Record<string, any>> extends Options {
	readonly target: TargetObjectType;
}

export interface MapperOptions {
	/**
	Whether `targetValue` should be recursed.

	Requires `deep: true`.

	@default true
	*/
	readonly shouldRecurse?: boolean;
}

/**
Map object keys and values into a new object.

@param source - The source object to copy properties from.
@param mapper - A mapping function.

@example
```
import mapObject, {mapObjectSkip} from 'map-obj';

const newObject = await mapObject({foo: 'bar'}, (key, value) => [value, key]);
//=> {bar: 'foo'}

const newObject = await mapObject({FOO: true, bAr: {bAz: true}}, (key, value) => [key.toLowerCase(), value]);
//=> {foo: true, bar: {bAz: true}}

const newObject = await mapObject({FOO: true, bAr: {bAz: true}}, (key, value) => [key.toLowerCase(), value], {deep: true});
//=> {foo: true, bar: {baz: true}}

const newObject = await mapObject({one: 1, two: 2}, (key, value) => value === 1 ? [key, value] : mapObjectSkip);
//=> {one: 1}
```
*/
export default function mapObject<
	SourceObjectType extends Record<string, unknown>,
	TargetObjectType extends Record<string, any>,
	MappedObjectKeyType extends string,
	MappedObjectValueType,
>(
	source: SourceObjectType,
	mapper: Mapper<
	SourceObjectType,
	MappedObjectKeyType,
	MappedObjectValueType
	>,
	options: DeepOptions & TargetOptions<TargetObjectType>
): Promise<TargetObjectType & Record<string, unknown>>;
export default function mapObject<
	SourceObjectType extends Record<string, unknown>,
	MappedObjectKeyType extends string,
	MappedObjectValueType,
>(
	source: SourceObjectType,
	mapper: Mapper<
	SourceObjectType,
	MappedObjectKeyType,
	MappedObjectValueType
	>,
	options: DeepOptions
): Promise<Record<string, unknown>>;
export default function mapObject<
	SourceObjectType extends Record<string, any>,
	TargetObjectType extends Record<string, any>,
	MappedObjectKeyType extends string,
	MappedObjectValueType,
>(
	source: SourceObjectType,
	mapper: Mapper<
	SourceObjectType,
	MappedObjectKeyType,
	MappedObjectValueType
	>,
	options: TargetOptions<TargetObjectType>
): Promise<TargetObjectType & {[K in MappedObjectKeyType]: MappedObjectValueType}>;
export default function mapObject<
	SourceObjectType extends Record<string, any>,
	MappedObjectKeyType extends string,
	MappedObjectValueType,
>(
	source: SourceObjectType,
	mapper: Mapper<
	SourceObjectType,
	MappedObjectKeyType,
	MappedObjectValueType
	>,
	options?: Options
): Promise<{[K in MappedObjectKeyType]: MappedObjectValueType}>;
