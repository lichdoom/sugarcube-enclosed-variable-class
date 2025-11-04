# sugarcube-enclosed-variable-class
Example of a class with input validation via setters using an enclosed/unenclosed variable for Sugarcube.

The DEFAULT, LIMITS, limitsDyn objects and class name can be modified to fit your needs.

The enclosed class only works when `Config.history.maxStates = 1;`.

The unenclosed works in all cases.

To use, assign the class to a property with same name in the setup object, such as:

`setup.<className> = class <className> {...};`

And create new instances with `<<set $val = new setup.<className>()>>`
