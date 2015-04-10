var NumericUtil = new Object();

NumericUtil.validate = function (objOne, objTwo) {
    var valid = false;

    if (typeof objOne !== "undefined"
            && typeof objTwo !== "undefined") {

        valid = true;
    }

    return valid;
};

/**
 * Divide the provided vector by the provided scalar, returns
 * a new vector. Returns null if unable.
 * @param {Number} scalar
 * @param {Array} vector
 * @returns {Array|Object.div.result|NumericUtil.div.vector}
 */
NumericUtil.div = function (scalar, vector) {
    var result = null;
    if (NumericUtil.validate(scalar, vector)) {
        if (vector.length > 0 && scalar !== 0) {
            result = new Array(vector.length);
            for (var i = 0; i < vector.length; i++) {
                result[i] = vector[i] / scalar;
            }
        }
    }
    return result;
};

/**
 * Multiply the provided vector by the provided scalar, returns a new 
 * vector. Returns null if unable. 
 * @param {Number} scalar
 * @param {Array} vector
 * @returns {Object.mul.result|Array|NumericUtil.mul.vector}
 */
NumericUtil.mul = function (scalar, vector) {
    var result = null;
    if (NumericUtil.validate(scalar, vector)) {
        if (vector.length > 0) {
            result = new Array(vector.length);
            for (var i = 0; i < vector.length; i++) {
                result[i] = vector[i] * scalar;
            }
        }
    }
    return result;
};

NumericUtil.add = function (obj, vector) {
    var result = 0;
    if (NumericUtil.validate(obj, vector)) {

    }

    return result;
};

NumericUtil.modulus = function (vector) {
    var result = null;
    var squared = NumericUtil.modulusSquared(vector);

    if (typeof squared !== "undefined" && squared !== null) {
        result = Math.sqrt(squared);
    }

    return result;
};

NumericUtil.modulusSquared = function (vector) {
    var result = null;
    var sum = 0;

    if (NumericUtil.validate([], vector)) {
        if (vector.length > 0) {
            for (var i = 0; i < vector.length; i++) {
                sum += (vector[i] * vector[i]);
            }
            if (sum >= 0) {
                result = sum;
            }
        }
    }
    return result;
};

NumericUtil.distance = function (origin, reference) {
    var result = null;
    
    if( NumericUtil.validate(origin, reference)) {
        if( origin.length === reference.length ) {
            
        }
    }    
    return result;
};