/**
 * @overview JavaScript API of Check list forms for the Tenken
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * Namespace to handle POI as checklist forms
 */
Tenken.ChecklistForm = {};


/**
 * Base class for the value
 */
Tenken.ChecklistForm.AbstractValueType = function() {};
/**
 * Return if the value is valid or not
 * @param {Object} _value value
 * @return {Boolean} true if valie, false if not 
 */
Tenken.ChecklistForm.AbstractValueType.prototype.isValid = function(_value) { return false; };


/**
 * Class to represent numbers
 * @param {String} _regexp regular express to determin if value is valid
 * @param {Number} _maxlength max length of valid number as string
 */
Tenken.ChecklistForm.NumberType = function(_regexp, _maxlength) {
	Tenken.ChecklistForm.AbstractValueType.call(this);
	this.regexp = _regexp;
	this.maxlength = _maxlength;
};
Tenken.inherit(Tenken.ChecklistForm.NumberType, Tenken.ChecklistForm.AbstractValueType);
/** @extends Tenken.ChecklistForm.AbstractValueType.prototype.isValid */
Tenken.ChecklistForm.NumberType.prototype.isValid = function(_value) {
	if(("number" != typeof(_value)) && ("string" != typeof(_value))) return false;
	return new RegExp(this.regexp).test(_value); // TODO compare against maxlength
};
/** Number Type */
// 16 digits is the maximum digits that JavaScript can handle without rounding. set 8 as before the decimal point and 3 as after the decimal point.
//Tenken.ChecklistForm.NUMBERTYPE = new Tenken.ChecklistForm.NumberType("^\\d{1,8}(?:\\.\\d{1,3})?$", 12);
// minus sign can be used in the beginning
//If we need to use plus sign: "^[-\+]?\\d{1,8}(?:\\.\\d{1,3})?$"
Tenken.ChecklistForm.NUMBERTYPE = new Tenken.ChecklistForm.NumberType("^-?\\d{1,8}(?:\\.\\d{1,3})?$", 12);

/** String Type */
Tenken.ChecklistForm.StringType = function(_regexp, _maxlength) {
	Tenken.ChecklistForm.AbstractValueType.call(this);
	this.regexp = _regexp;
	this.maxlength = _maxlength;
};
Tenken.inherit(Tenken.ChecklistForm.StringType, Tenken.ChecklistForm.AbstractValueType);

// Returns OK (true) if there is more then one charactor
Tenken.ChecklistForm.StringType.prototype.isValid = function(_value) {
	if(("string" != typeof(_value))) return false;
	return true;
};

// Max string length is 1000 bytes
Tenken.ChecklistForm.STRINGTYPE = new Tenken.ChecklistForm.StringType("^.*", 1000);

/**
 * Enum class
 * @param {Tenken.Toggle.EnumType} _enumType enum type
 */
Tenken.ChecklistForm.EnumType = function(_enum) {
	Tenken.ChecklistForm.AbstractValueType.call(this);
	this.enum = _enum;
};
Tenken.inherit(Tenken.ChecklistForm.EnumType, Tenken.ChecklistForm.AbstractValueType);
/** @extends Tenken.ChecklistForm.AbstractValueType.prototype.isValid */
Tenken.ChecklistForm.EnumType.prototype.isValid = function(_value) {
	return (null != this.enum.parse(_value));
};
/** Enum for weathers*/
Tenken.ChecklistForm.WEATHERTYPE = new Tenken.ChecklistForm.EnumType(Tenken.Toggle.WEATHERTYPE);
/** Enum for OK/NG */
Tenken.ChecklistForm.OKNGTYPE = new Tenken.ChecklistForm.EnumType(Tenken.Toggle.OKNGTYPE);
/** Enum for good/ng signs */
Tenken.ChecklistForm.MARUBATSUTYPE = new Tenken.ChecklistForm.EnumType(Tenken.Toggle.MARUBATSUTYPE);

// Check if the value matches the type
// true:Success false:Error or undefined
Tenken.ChecklistForm.checkValue = function(_valueType, _value)
{
	switch ( _valueType )
	{
	case "NUMBER":
		var ValueTypeObj=Tenken.ChecklistForm.NUMBERTYPE;
		break;
	case "OKNG":
		var ValueTypeObj=Tenken.ChecklistForm.OKNGTYPE;
		break;
	case "WEATHER":
		var ValueTypeObj=Tenken.ChecklistForm.WEATHERTYPE;
		break;
	case "STRING":
		var ValueTypeObj=Tenken.ChecklistForm.STRINGTYPE;
		break;
	case "MARUBATSU":
		var ValueTypeObj=Tenken.ChecklistForm.MARUBATSUTYPE;
		break;
	default:
		alert("ValueType=" + _valueType + " is not supported\nPlease enter appropriate value type\n");
		var ValueTypeObj=null;
		break;
	}

	if( ValueTypeObj && ValueTypeObj.isValid(_value))
	{
		var ret=true;
	}
	else
	{
		var ret=false;
	}

	return(ret);
}
