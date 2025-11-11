setup.Mc = class Mc {
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
		}
	};

	// Limits for each of the properties (used for validation)
	static LIMITS = {
		inventory: {
			watch: [0,1], suit: [0,1]
		}, month: {
			coffeeCount: [0,3], drinkCount: [0,3], tempCharisma: [-10,45]
		}, stats: {
			ap: [0,10], charisma: [0,100], maxSpirit: [20,200], gangRel: [0,3],
			alignment: [-100,100],
			hp: obj => [0, obj.maxhp],
			spirit: obj => [0, obj.maxSpirit],
		}, misc: {}
	};

	constructor(data = {}) {
		if (typeof data !== 'object' || Array.isArray(data)) data = {};

		// Initialize properties with default values and accessors
		this._mc = clone(this.constructor.DEFAULT);
		setup.classes.defineProperties(this._mc, this, this.constructor.LIMITS);

		// Merge incoming data into the class (with validation via setters)
		setup.classes.deepMerge(this, data);
	}

	// Methods to make class compatible with SugarCube
	clone = () => new this.constructor(this._mc);
	toJSON = () => Serial.createReviver(`new setup.${this.constructor.name}($ReviveData$)`, this._mc);

	// Static block to freeze static properties and make them immutable
	static {
		setup.classes.validateLimits(this.DEFAULT, this.LIMITS);
		// Freeze static DEFAULT and LIMITS objects and the class itself
		for(let obj in this){
			setup.classes.deepFreeze(this[obj]);
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
};