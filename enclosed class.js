class Mc {
	// Default values for properties, used as the template for an instance
	// Any other property passed to the constructor will be ignored
	static DEFAULT = {
		firstName: '',
		lastName: '',
		inventory: {
			coffee: 0, booze: 0, rose: 0, jewelry: 0, mattress: 0,
			watch: 0, suit: 0
		}, month: {
			coffeeCount: 0, drinkCount: 0, tempCharisma: 0
		}, stats: {
			ap: 5, hp: 40, maxhp: 100, charisma: 10, cash: 100, spirit: 10, maxSpirit: 100,
			favors: 0, essence: 0, gangRel: 0, alignment: 0
		}, misc: {
			eventFlags: [], boughtSpells: [], test: {a:2}
		},
	};

	// Limits for each of the properties (used for validation)
	static LIMITS = {
		inventory: {
			watch: [0,1], suit: [0,1]
		}, month: {
			coffeeCount: [0,3], drinkCount: [0,3], tempCharisma: [-10,45]
		}, stats: {
			ap: [0,10], charisma: [0,100], maxSpirit: [20,200], gangRel: [0,3],
			alignment: [-100,100]
		}, misc: {}
	};

	constructor(data = {}) {
		// Ensure the provided data is an object
		data = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

		// Initialize properties with default values and accessors
		const mc = clone(this.constructor.DEFAULT);
		this.#initializeProperties(mc);

		// Merge incoming data into the class (with validation via setters)
		this.#deepMerge(this, data);

		// Methods to make class compatible with SugarCube
		this.clone = () => new this.constructor(mc);
		this.toJSON = () => Serial.createReviver(`new setup.${this.constructor.name}($ReviveData$)`, mc);

		Object.freeze(this);
	}

	// Initializes properties by defining getters and setters for each property
	#initializeProperties(mc) {
		const limitsDyn = {
			stats: {
				hp: () => [0, mc.stats.maxhp],
				spirit: () => [0, mc.stats.maxSpirit],
			}
		};
		this.#defineProperties(mc, this, this.constructor.LIMITS, limitsDyn);
	}
	// Helper function to recursively define properties with validation, limits, and access control
	#defineProperties(source, target, limits = {}, limitsDyn = {}) {
		for (const key in source) {
			const baseType = typeof source[key];
			let range = limits[key] ?? [0, Infinity];

			if (source[key] && baseType === 'object' && !Array.isArray(source[key])) {
				Object.defineProperty(target, key, { value: Object.create(null) });
				this.#defineProperties(source[key], target[key], limits[key], limitsDyn[key]);
			} else {
				Object.defineProperty(target, key, {
					get: () => source[key],
					set: (val) => {
						if (typeof val !== baseType) {
							throw new TypeError(`Error in passage "${passage()}". Invalid type for "${key}": expected "${baseType}", got "${typeof val}"`);
						}
						if (baseType === 'number') {
							if (limitsDyn[key]) range = limitsDyn[key]();
							source[key] = Math.min(Math.max(val, range[0]), range[1]);
						} else {
							source[key] = val;
						}
					}
				});
			}
		}
	}

	// Recursive method to deeply merge incoming data into the current object
	#deepMerge(target, data) {
		for (const key in data) {
			const incVal = data[key];
			const tarVal = target[key];

			if (tarVal === undefined) {
				// If the target value doesn't exist, we ignore it
				continue;
			} else if (incVal && typeof incVal === 'object' && !Array.isArray(incVal)) {
				this.#deepMerge(tarVal, incVal);
			} else {
				target[key] = incVal;
			}
		}
	}
	// Helper function to freeze the object and all nested objects
	static #deepFreeze(obj) {
		Object.freeze(obj);
		for (const key in obj) {
			const val = obj[key];
			if (val && typeof val === 'object') this.#deepFreeze(val);
		}
	}
	// Static block to freeze static properties and make them immutable
	static {
		// Freeze static DEFAULT and LIMITS objects and the class itself
		for(let obj in this){
			this.#deepFreeze(this[obj]);
		}
		Object.freeze(this);
	}

	// Examples of custom methods
	canCoffee() {
		return this.month.coffeeCount < this.constructor.LIMITS.month.coffeeCount[1];
	}
	canDrink() {
		return this.month.drinkCount < this.constructor.LIMITS.month.drinkCount[1];
	}
}
