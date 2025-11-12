setup.classes = {
	// Helper function to recursively define properties with validation, limits, and access control
	defineProperties(source, target, limits = {}) {
		for (const key in source) {
			const val = source[key];
			const type = typeof val;

			if (val && type === 'object' && !Array.isArray(val)) {
				target[key] = Object.create(null);
				this.defineProperties(val, target[key], limits[key]);
				continue;
			}

			Object.defineProperty(target, key, {
				get: () => source[key],
				set(val) {
					if (typeof val !== type) {
						throw new TypeError(`Error in passage '${passage()}'. Invalid type for '${key}': expected '${type}', got '${typeof val}'`);
					}
					if (type === 'number') {
						if (!Number.isFinite(val)) {
							throw new TypeError(`Error in passage '${passage()}'. Invalid value for '${key}': got '${val}'`);
						}
						const range = typeof limits[key] === 'function' ? limits[key](source) : limits[key] ?? [0, Infinity];
						source[key] = Math.min(Math.max(val, range[0]), range[1]);
					} else {
						source[key] = val;
					}
				}
			});
		}
	},
	// Recursive method to deeply merge incoming data into the current object
	deepMerge(target, data) {
		for (const key in data) {
			const incVal = data[key];
			const tarVal = target[key];

			// If the target value doesn't exist, we ignore it
			if (tarVal === undefined) continue;
			if (incVal && typeof incVal === 'object' && !Array.isArray(incVal)) {
				this.deepMerge(tarVal, incVal);
			} else {
				target[key] = incVal;
			}
		}
	},
	// Helper function to freeze the object and all nested objects
	deepFreeze(obj) {
		Object.freeze(obj);
		for (const key in obj) {
			const val = obj[key];
			if (val && typeof val === 'object') this.deepFreeze(val);
		}
	},
	// Helper function to validate limits for objects and values
	validateLimits(obj, limits, path = '', errors = []) {
		for (const key in limits) {
			const limit = typeof limits[key] === 'function' ? limits[key](obj) : limits[key];
			const val = obj[key];
			// Check if the key exists in the object
			if (!(key in obj)) {
				errors.push(`'${path + key}' present in LIMITS but missing in DEFAULT`);
				continue;
			}

			if (val && typeof val === 'object' && !Array.isArray(val)) {
				if (limit && typeof limit === 'object' && !Array.isArray(limit)) {
					this.validateLimits(val, limit, path + key + '.', errors);
				} else if (limit) {
					errors.push(`'${path + key}' defines a range for an object (expected nested limits).`);
				}
			}
			else if (typeof val === 'number') {
				if (!Array.isArray(limit) || limit.length !== 2) {
					errors.push(`'${path + key}' is not an array of length 2.`);
				} else if (limit[0] > limit[1]) {
					errors.push(`'${path + key}': min > max`);
				}
			} else {
				errors.push(`'${path + key}' defines a limit for a non-numeric value.`);
			}
		}
		// Throw errors only once at the root level
		if (path === '' && errors.length > 0) {
			throw new Error(`Invalid Mc.LIMITS:\n- ${errors.join('\n- ')}`);
		}
	}
};