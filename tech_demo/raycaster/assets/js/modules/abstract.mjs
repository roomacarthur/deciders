/**
 * Enforces the abstract class paradigm
 */
class AbstractClass {
  /**
   * Ensures the class being created is a derived class not a base class
   *  @param {Object} BaseClass - The baseclass that is abstract
   */
  constructor(BaseClass) {
    this._baseClass = BaseClass;
    if (this.constructor === AbstractClass) {
      throw new TypeError('Abstract class "AbstractClass" cannot be instantiated directly');
    }
    if (this.constructor === this._baseClass) {
      throw new TypeError(`Abstract class "${this._baseClass.name}" cannot be instantiated directly`);
    }
  }
  /**
   * Raises an error if an abstract base class method is called
   *  @param {string} methodName - The name of the method that is abstract
   */
  AbstractMethod(methodName) {
    throw new TypeError(
      `${this._baseClass.name}: Abstract method "${methodName}" not overridden by derived class "${this.constructor.name}".`
    );
  }
}

export { AbstractClass };
