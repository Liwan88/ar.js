/**
 * @fileoverview JavaScript library API for cores/utilities in AR products.
 * @copyright Copyright 2014-2015 FUJITSU LIMITED
 */

/**
 * AR framework library space
 * @namespace AR
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
var AR = {};

/**
 * Component name
 * @static
 * @private
 * @readonly
 * @type string
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.COMPONENTNAME = "JSLIB";



/**
 * Utilities library space.
 * @private
 * @namespace AR.Util
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util = {};


/**
 * Inherits class.
 * @private 
 * @static
 * @param {Object} _cls Class
 * @param {Object} _scls Parent class
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.inherit = function(_cls, _scls){
	_cls.prototype = new _scls();
	_cls.prototype.constructor = _cls;
};


/**
 * Adds and returns the specified array element.
 * @private 
 * @static
 * @param {Object[]} _arrayTo Target array
 * @param {Object[]} _arrayFrom Array with values to be added to target array
 * @param {boolean} _unshift "true" if should prepend source array to target array, or "false" if should append source array to target array
 * @return {Object[]} _arrayTo after having added source array
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.putEach = function(_arrayTo, _arrayFrom, _unshift) {
	if((null == _arrayFrom) || (0 == _arrayFrom.length)) return _arrayTo;
	if(null == _arrayTo) _arrayTo = [];
	for(var i = 0; i < _arrayFrom.length; i++) _arrayTo[_unshift ? "unshift" : "push"](_arrayFrom[i]);
	return _arrayTo;
};

/**
 * Returns whether the specified value exists in the array.
 * @private
 * @static
 * @param {Object[]} _array Array
 * @param {Object} _value Value
 * @param {boolean} _null "true" if null/undefined is allowed, or "false" otherwise
 * @return {boolean} "true" if the value exists in the array, or "false" otherwise
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.checkValInArray = function(_array, _value, _null){
	if(_value === null || typeof _value == 'undefined'){
		if(_null) return true;
		else return false;
	}
	for(var key in _array)
		if(typeof _array[key] == typeof _value && _array[key] == _value) return true;
	return false;
};

/**
 * Checks if the specified value matches the specified data type.
 * @private
 * @static
 * @param {Object} _val Data for which the type is to be checked
 * @param {Object} _type Type to be checked. Specify strings for primitive types, or class objects for reference types
 * @param {boolean} _null Allow null/undefined? null is allowed if "true"
 * @return {boolean} "true" if the specified type matches, or "false" otherwise
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.checkType = function(_val, _type, _null){
	if(_val === null || typeof _val == 'undefined'){
		if(_null) return true;
		else return false;
	}
	if(typeof _type == 'string'){
		return typeof _val == _type;
	} else if(typeof _type == 'function'){
		return  _val instanceof _type;
	} else if(typeof _type == 'boolean'){
		return typeof _val == _type;
	} else if(typeof _type == 'number'){
		return typeof _val == _type;
	}
	return false;
};

/**
 * Checks if the specified array matches the specified data type. Note that this function also returns "true" if the specified array is empty, or "false" if at least one element contains null.
 * @private
 * @static
 * @param {Object} _array Data for which the type is to be checked
 * @param {Object} _type Type to be checked. Specify strings for a primitive type, and class objects for a reference type
 * @param {boolean} _null "true" if null/undefined is allowed, or "false" otherwise
 * @return {boolean} "true" if the specified array type matches, or "false" otherwise
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.checkArrayType = function(_array, _type, _null){
	if(_array == null){
		if(_null) return true;
		else return false;
	}
	if(!(_array instanceof Array)) return false;
	for(var i=0;i<_array.length;i++) if(!AR.Util.checkType(_array[i], _type, false)) return false;
	return true;
};

/**
 * Reviver method for JSON.parse. Generates and returns a real class object for AR.Renderer.
 * @private
 * @static
 * @param {Object} _key JSON key
 * @param {Object} _value Key value
 * @return {Object} _value converted into a real class object for AR.Renderer
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Util.reviver = function(_key, _value){
	if(_value && typeof _value == 'object'){
		var obj = _value;

		if(_value.typeName == 'FJARMarkerCoordinateSystem') {
            //_value.__proto__ = new AR.Renderer.FJARMarkerCoordinateSystem();
            obj = new AR.Renderer.FJARMarkerCoordinateSystem();
            if (typeof _value.id !== 'undefined') obj.setId(_value.id);
            if (typeof _value.name !== 'undefined') obj.setName(_value.name);
            if (typeof _value.value !== 'undefined') obj.setValue(_value.value);
        }else if(_value.typeName == 'FJGeolocationCoordinateSystem'){
            //_value.__proto__ = new AR.Renderer.FJGeolocationCoordinateSystem();
            obj = new AR.Renderer.FJGeolocationCoordinateSystem();
            if (typeof _value.id !== 'undefined') obj.setId(_value.id);
            if (typeof _value.name !== 'undefined') obj.setName(_value.name);
		}else if(_value.typeName == 'HandwritingTexture'){
			//_value.__proto__ = new AR.Renderer.HandwritingTexture();
			obj = new AR.Renderer.HandwritingTexture();
			if(typeof _value.backgroundColor !== 'undefined') obj.setBackgroundColor(_value.backgroundColor);
			if(typeof _value.borderColor !== 'undefined') obj.setBorderColor(_value.borderColor);
			if(typeof _value.borderWidth !== 'undefined') obj.setBorderWidth(_value.borderWidth);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.size !== 'undefined') obj.setSize(_value.size);
			if(typeof _value.src !== 'undefined') obj.setSrc(_value.src);
			if(typeof _value.HandwritingColor !== 'undefined') obj.setHandwritingColor(_value.HandwritingColor);
			
		}else if(_value.typeName == 'ImageTexture'){
//			_value.__proto__ = new AR.Renderer.ImageTexture();
			obj = new AR.Renderer.ImageTexture();
			if(typeof _value.backgroundColor !== 'undefined') obj.setBackgroundColor(_value.backgroundColor);
			if(typeof _value.borderColor !== 'undefined') obj.setBorderColor(_value.borderColor);
			if(typeof _value.borderWidth !== 'undefined') obj.setBorderWidth(_value.borderWidth);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.size !== 'undefined') obj.setSize(_value.size);
			if(typeof _value.src !== 'undefined') obj.setSrc(_value.src);
		}else if(_value.typeName == 'ObjModelGraphic'){
			//_value.__proto__ = new AR.Renderer.ObjModelGraphic();
			obj = new AR.Renderer.ObjModelGraphic();
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.scale !== 'undefined') obj.setScale(_value.scale);
            if(typeof _value.src !== 'undefined') obj.setSrc(_value.src);
		}else if(_value.typeName == 'Point'){
			//_value.__proto__ = new AR.Renderer.Point();
			obj = new AR.Renderer.Point();
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.x !== 'undefined') obj.setX(_value.x);
			if(typeof _value.y !== 'undefined') obj.setY(_value.y);
			if(typeof _value.z !== 'undefined') obj.setZ(_value.z);
		}else if(_value.typeName == 'ScriptAction'){
			//_value.__proto__ = new AR.Renderer.ScriptAction();
			obj = new AR.Renderer.ScriptAction();
			if(typeof _value.expression !== 'undefined') obj.setExpression(_value.expression);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
		}else if(_value.typeName == 'Size'){
			//_value.__proto__ = new AR.Renderer.Size();
			obj = new AR.Renderer.Size();
			if(typeof _value.depth !== 'undefined') obj.setDepth(_value.depth);
			if(typeof _value.height !== 'undefined') obj.setHeight(_value.height);
			if(typeof _value.width !== 'undefined') obj.setWidth(_value.width);
		}else if(_value.typeName == 'SquareModelGraphic'){
			//_value.__proto__ = new AR.Renderer.SquareModelGraphic();
			obj = new AR.Renderer.SquareModelGraphic();
			if(typeof _value.color !== 'undefined') obj.setColor(_value.color);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.scale !== 'undefined') obj.setScale(_value.scale);
			if(typeof _value.texture !== 'undefined') obj.setTexture(_value.texture);
		}else if(_value.typeName == 'SuperimposedGraphic'){
			//_value.__proto__ = new AR.Renderer.SuperimposedGraphic();
			obj = new AR.Renderer.SuperimposedGraphic();
			if(typeof _value.tapAction !== 'undefined') obj.setTapAction(_value.tapAction);
			if(typeof _value.graphic !== 'undefined') obj.setGraphic(_value.graphic);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.name !== 'undefined') obj.setName(_value.name);
			if(typeof _value.projectionType !== 'undefined') obj.setProjectionType(_value.projectionType);
			if(typeof _value.rotation !== 'undefined') obj.setRotation(_value.rotation);
			if(typeof _value.translation !== 'undefined') obj.setTranslation(_value.translation);
		}else if(_value.typeName == 'TextTexture'){
			//_value.__proto__ = new AR.Renderer.TextTexture();
			obj = new AR.Renderer.TextTexture();
			if(typeof _value.backgroundColor !== 'undefined') obj.setBackgroundColor(_value.backgroundColor);
			if(typeof _value.borderColor !== 'undefined') obj.setBorderColor(_value.borderColor);
			if(typeof _value.borderWidth !== 'undefined') obj.setBorderWidth(_value.borderWidth);
			if(typeof _value.color !== 'undefined') obj.setColor(_value.color);
			if(typeof _value.fontSize !== 'undefined') obj.setFontSize(_value.fontSize);
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.size !== 'undefined') obj.setSize(_value.size);
			if(typeof _value.text !== 'undefined') obj.setText(_value.text);
			if(typeof _value.wordWrap !== 'undefined') obj.setWordWrap(_value.wordWrap);
		}else if(_value.typeName == 'URLAction'){
			//_value.__proto__ = new AR.Renderer.URLAction();
			obj = new AR.Renderer.URLAction();
			if(typeof _value.id !== 'undefined') obj.setId(_value.id);
			if(typeof _value.src !== 'undefined') obj.setSrc(_value.src);
		}
		return obj;
	} 
	return _value;
};

/**
 * Native application control library space.
 * @private
 * @namespace AR.Native
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native = {};

/** 
 * Returns ID for callback function management.
 * @private
 * @static
 * @type number
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.callbackId = Math.floor(Math.random() * 1000000000);


/** 
 * Manages map for CallbackId and method name.
 * @static 
 * @type Object
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.callbackIdMap = new Object();

/**
 * Determines if iOS is being used.
 * @private
 * @static
 * @return {boolean} "true" if iOS, or "false" otherwise
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.isIOS = function() {
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
};

/**
 * Determines if Android is being used.
 * @private
 * @static
 * @return {boolean} "true" if Android, or "false" otherwise
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.isAndroid = function(){
	return navigator.userAgent.match(/(Android)/) ? true : false;
};

/**
 * Determines if Windows is being used.
 * @private
 * @static
 * @return {boolean} "true" if Windows, or "false" otherwise
 * @version AR Processing Server V1.0.1
 * @since AR Processing Server V1.0.1
 */
AR.Native.isWindows = function() {
	return navigator.userAgent.match(/(Windows)/) ? true : false
};

/**
 * Initial settings for iOS
 */
if(AR.Native.isIOS()) {
	/**
	 * Request count passed to a native application
	 * @private 
	 * @static
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
    AR.Native.requestCount = 0;
    
	/**
	 * Request queue passed to a native application
	 * @private 
	 * @static
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
    AR.Native.commandQueue = [];

	/**
	 * Function used by iOS native applications to confirm requested commands
	 * @private
	 * @static
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
     */
    AR.Native.nativeFetchCommand = function() {
        // Each entry in commandQueue is a JSON string already.
        if (!AR.Native.commandQueue.length) {
            return '';
        }
        var json = '[' + AR.Native.commandQueue.join(',') + ']';
        AR.Native.commandQueue.length = 0;
        return json;
    };
};


/**
 * Result object for native applications. This is a result-specific object. Do not use a new object.
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.Result = function(){};

/**
 * Returns the status.
 * @return {string} Status. The values returned by native applications are as follows:
 *  <ul>
 *    <li>OK: Completed successfully
 *    <li>INVALID_OPERATION_EXCEPTION: When an operation exception occurs in a feature process for a native application
 *    <li>INVALID_PARAMETER_EXCEPTION: When a parameter exception occurs in a feature process for a native application
 *    <li>ARIO_EXCEPTION: When an IO error occurs in a feature process for a native application
 *    <li>AR_HTTP_EXCEPTION: When a HTTP error occurs in a feature process for a native application
 *    <li>HARDWARE_EXCEPTION: When a hardware error occurs in a feature process for a native application
 *    <li>NOMORE_EXCEPTION: When a handling error occurs in a feature process for a native application
 *    <li>UNEXPECTED_EXCEPTION: When an unexpected error occurs in a feature process for a native application
 *    <li>NATIVERESULT_EXCEPTION: When an error occurs during processing of values returned by a native application
 *  </ul>
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.Result.prototype.getStatus = function(){ return this.status; };


/**
 * Sets the status.
 * @private
 * @param {string} _status Status
 * @throws {Error} When _status is not the expected type, or is null/undefined
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.Result.prototype.setStatus = function(_status){ 
	if(!AR.Util.checkType(_status, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Status data type", "string", "Native.Result#setStatus.");
	this.status = _status; 
};


/**
 * Returns a value matching the method or status.
 * If no value has been set, returns null.
 * The error content is set when an error occurs in an AR native library.
 * @return {Object} Return value
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.Result.prototype.getValue = function(){ return this.value; };


/**
 * Sets return value.
 * @private
 * @param {Object} _value Return value
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.Result.prototype.setValue = function(_value){ 
	this.value = _value;
}; 

/**
 * Converts JSON strings returned from AR native applications or that are used as arguments for callback functions into {@link AR.Native.Result} objects.
 * @static
 * @private
 * @param {string} _nativeResultString Return value from a native application or argument for a callback function
 * @return {AR.Native.Result} {@link AR.Native.Result} object that _nativeResultString was converted into
 * @throws {Error} 
 *   <ul>
 *     <li>InvalidParameterError: When _nativeResultString is not the expected type, or is null/undefined,
 *     <li>UnexpectedError: When conversion of _nativeResultString into an object fails
 *   <ul>
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.convertResult = function(_nativeResultString){
	if(!AR.Util.checkType(_nativeResultString, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "NativeResultString data type", "string", "Native#convertResult.");
	var nativeResult = new Object();
	try{
		nativeResult = JSON.parse(_nativeResultString);
	} catch(parseE) {
		try{
			nativeResult = eval("("+_nativeResultString+")");
		} catch (evalE) { 
			throw AR.Error.createUnexpectedError(evalE, AR.Error.SubcomponentCode.NATIVE, 0, "Failed to parse nativeResultString to JSON object. Native#convertResult.");
		}
	}
	
	var result = new AR.Native.Result();
	result.setStatus(nativeResult.status);
	if(typeof nativeResult.value == 'undefined') nativeResult.value = null;
	result.setValue(nativeResult.value);
	return result;
};

/**
 * Makes an asynchronous call to a native application.
 * @private 
 * @static
 * @param {AR.Native.HandleName} _handler Native application handler name
 * @param {AR.Native.FunctionName} _method Native application function name
 * @param {Object[]} _args Argument array for a native application
 * @param {Object} _callback Object for asynchronous callback
 * @param {Object} _callbackSync Object for synchronous callback
 * @return {string} ID for callback management
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When _handler, _method, _callback, or _callbackSync are not the expected type or are null/undefined, or _args is not the expected type
 *    <li>UnexpectedError: When conversion of _args into a JSON string fails
 *    <li>InvalidStateError: When the native application call fails
 *  </ul>
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.callARNativeASync = function(_handler, _method, _args, _callback, _callbackListener){

	/* 
	 * The following is required to perform asynchronous callback from native applications:
	 * 
	 * - Multiple asynchronous calls from JavaScript are made simultaneously. A mechanism is needed for uniquely identifying the caller, in order to determine 
	 * which caller to return the callback results to.
	 * - Specify an arbitrary method name, since there are user-side constraints
	 *  on fixed callback method names.
	 *  
	 *  In order to achieve this, the mechanism below, implemented by OSS PhoneGap, was used.
	 *  https://github.com/apache/incubator-cordova-android/blob/master/framework/assets/js/cordova.android.js
	 * 
	 * - Prepares AR.Native.callARNativeASync as a common method for asynchronous calls.
	 * - Prepares a "cid" callback ID, and uses the ID as a key for
	 * linking the _callback function with the ID and recording this in HashMap.
	 * - Callback results are returned with an ID attached to the common callback method
	 * called AR.Native.performCallbackASync.
	 * - The returned ID is used as a key for specifying the callback method for _callback, and returning the result to the caller.
	 * 
	 * Also, a mechanism has been added for deleting HashMap items when they become obsolete,
	 * as callback ID and function resources remain in HashMap otherwise.
	 * delete AR.Native.callbackIdMap[cid]
	 */
	
	if(!AR.Util.checkValInArray(AR.Native.HandleName, _handler)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Handler data type", "AR.Native.HandleName", "Native#callARNativeASync.");
	if(!AR.Util.checkValInArray(AR.Native.FunctionName, _method)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Method data type", "AR.Native.FunctionName", "Native#callARNativeASync.");
	if(!AR.Util.checkType(_args, Array, true)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Args data type", "Array", "Native#callARNativeASync.");
	
	if(_callback == null){
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Callback data type", "not null", "Native#callARNativeASync.");
	} else {
		if(!AR.Util.checkType(_callback.success, 'function', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "OnSuccess data type", "function", "Native#callARNativeASync.");
		if(!AR.Util.checkType(_callback.error, 'function', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "OnError data type", "function", "Native#callARNativeASync.");
		if(!AR.Util.checkType(_callback.release, 'boolean', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Release data type", "boolean", "Native#callARNativeASync.");
	}
	
	if(_callbackListener != null){
		if(!AR.Util.checkType(_callbackListener.success, 'function', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "OnSuccessListener data type", "function", "Native#callARNativeASync.");
		if(!AR.Util.checkType(_callbackListener.error, 'function', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "OnErrorListener data type", "function", "Native#callARNativeASync.");
		if(!AR.Util.checkType(_callbackListener.release, 'boolean', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Release data type", "boolean", "Native#callARNativeASync.");
	}

	//Registers callback methods to the management map.
	var cid = _handler + AR.Native.callbackId++;
	AR.Native.callbackIdMap[cid] = _callback;
	
	var cidListener;
	if(_callbackListener != null){
		cidListener = _handler + AR.Native.callbackId++;
		AR.Native.callbackIdMap[cidListener] = _callbackListener;
		_args.push(cidListener);
	}
	//For Android and Windows
	if(AR.Native.isAndroid() || AR.Native.isWindows()){
		try {
			var message;
			try{
				message = (null == _args) ? "" : JSON.stringify(_args);
				
			} catch (e) {
				throw AR.Error.createUnexpectedError(e,AR.Error.SubcomponentCode.NATIVE, 1, "Faled to stringify args to JSON format string. Native#callARNativeASync.");
			}
			var defaultValue;
			try{
				defaultValue = 'ar:' + JSON.stringify([_handler, _method, cid]);
			} catch (e){
				throw AR.Error.createUnexpectedError(e, AR.Error.SubcomponentCode.NATIVE, 2, "Failed to stringify request to JSON format string. Native#callARNativeASync.");
			}
			
			try{
				//Calls a native application.
				prompt(message,defaultValue);
			} catch (e){
				throw AR.Error.createInvalidStateError(e, AR.Error.SubcomponentCode.NATIVE, 0, "Cannot call AR native library. Native#callARNativeASync.");
			}
			return cid;
		} catch (e) {
			if(AR.Native.callbackIdMap[cid].release) delete AR.Native.callbackIdMap[cid]; 
			if(!cidListener && AR.Native.callbackIdMap[cidListener].release) delete AR.Native.callbackIdMap[cidListener]; 
			throw e; 
		}
	//For iOS
	} else if(AR.Native.isIOS()){
		try{
			var command;
			try{
				command = JSON.stringify([cid, _handler, _method, _args]);
			} catch(e) {
				throw AR.Error.createUnexpectedError(e, AR.Error.SubcomponentCode.NATIVE, 2, "Failed to stringify request to JSON format string. Native#callARNativeASync.");
			}
			//Calls a native application
			try{
				AR.Native.commandQueue.push(JSON.stringify(command));
				var  execXhr = new XMLHttpRequest();
				execXhr.open('POST', "/!iar_exec", false);
				execXhr.setRequestHeader('rc', ++AR.Native.requestCount);
				execXhr.send();
				delete execXhr;
			} catch(e) {
				if(execXhr) delete execXhr;
				throw AR.Error.createInvalidStateError(e, AR.Error.SubcomponentCode.NATIVE, 0, "Cannot call AR native library. Native#callARNativeASync.");
			}
		} catch (e){
			if(AR.Native.callbackIdMap[cid].release) delete AR.Native.callbackIdMap[cid];
			if(!cidSync && AR.Native.callbackIdMap[cidSync].release) delete AR.Native.callbackIdMap[cidSync]; 
			throw e; 
		}
		
	//Otherwise. Calls the callback function when a log is successfully output to the console.
	} else {
		var logMessage = "Call '"+ _method + ((_args.length>0) ? "' with args: " + JSON.stringify(_args) : "'"); 
		window.console.log(logMessage);
		var result = AR.Native.convertResult("{\"status\":\"OK\"}");
		AR.Native.callbackIdMap[cid].success(result);
	}
};

/**
 * Calls the callback function specified in {@link AR.Native.callARNativeASync}.
 * Called by a native application.
 * @private 
 * @static
 * @param {string} _cid  ID for callback management
 * @param {string} _nativeResultString Argument for the callback function that is passed from the native application
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When _cid, _nativeResultString are not the expected type or is null/undefined, or the callback function is not registered
 *    <li>UnexpectedError: When a registered callback function specified in _cid is not a Function type or is null/undefined, or conversion of _nativeResultString into an object fails
 *  </ul>
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.performCallbackASync = function(_cid, _nativeResultString){
	try{
		if(!AR.Util.checkType(_cid, 'string', false)) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Cid data type", "string", "Native#performCallbackASync.");
		if(!AR.Util.checkType(_nativeResultString, 'string', false))
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "NativeResultString data type", "string", "Native#performCallbackASync.");
		
		// Converts argument to AR.Native.Result.
		var result = AR.Native.convertResult(_nativeResultString);
		
		if(AR.Native.callbackIdMap[_cid]==null)
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.NATIVE, 0, "Callback function data type", "registered", "Native#performCallbackASync.");
		
		
		//Calls a callback function.
		if(AR.Native.callbackIdMap[_cid]==null)
			throw AR.Error.createUnexpectedError(null, AR.Error.SubcomponentCode.NATIVE, 4, "Specified callback function is invalid type or not exist in AR javascript library. Native#performCallbackASync.");

		//Because callback functions are user-defined, errors are thrown without being handled.
		if(result.getStatus() == "OK"){
			//Checks callback function.
			if(!AR.Util.checkType(AR.Native.callbackIdMap[_cid].success, 'function', false))
				throw AR.Error.createUnexpectedError(null, AR.Error.SubcomponentCode.NATIVE, 4, "Specified callback function is invalid type or not exist in AR javascript library. Native#performCallbackASync.");
			//Calls onSuccess
			AR.Native.callbackIdMap[_cid].success(result);
		} else {
			//Checks callback function.
			if(!AR.Util.checkType(AR.Native.callbackIdMap[_cid].error, 'function', false))
				throw AR.Error.createUnexpectedError(null, AR.Error.SubcomponentCode.NATIVE, 4, "Specified callback function is invalid type or not exist in AR javascript library. Native#performCallbackASync.");
			
			//Calls onError
			AR.Native.callbackIdMap[_cid].error(result);
		}
	}
	catch(e){
		//Because the callback function is called by a native application, there is no catch for errors thrown by it.
		if(AR.Native.callbackIdMap[_cid]!=null){
			var result = new AR.Native.Result();
			result.setStatus("NATIVERESULT_EXCEPTION");
			result.setValue(e + "RESULT:"+_nativeResultString);
			AR.Native.callbackIdMap[_cid].error(result);
		}
	}
	finally{
		// Releases resources when resource releasing is set for callback calls.
		if(AR.Native.callbackIdMap[_cid]!=null && AR.Native.callbackIdMap[_cid].release){
			delete AR.Native.callbackIdMap[_cid];
		}
	}
};


/**
 * Handler name enumeration.
 * @private
 * @static
 * @enum {string}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.HandleName = {

	/** 
	 * Handler name for recognition control
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	Camera : "camera",

	/** 
	 * Handler name for OS control
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	OS : "os",

	/** 
	 * Handler name for HTTP
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	Data : "data",

	/** 
	 * Handler name for rendering (drawing control)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	Renderer : "rendering",

	/**
	 * Handler name for logs
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	Log : "log",
    
    /** 
	 * Handler name for geolocation
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	Geolocation: "geolocation",

    /** 
	 * Handler name for barcode
     * @type string
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
	Barcode: "barcode",

	/**
	 * Handler name for bluetooth
	 * @type string
	 * @version AR Processing Server V1.1.1
	 * @since AR Processing Server V1.1.1
	 */
	Bluetooth : "bluetooth"

};


/**
 * Function name enumeration.
 * @static
 * @private
 * @enum {string}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Native.FunctionName = {
    /** 
	 * Function name of handler name Camera (startCameraPreview)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	STARTCAMERAPREVIEW_FUNCNAME : "startCameraPreview",
	
    /** 
	 * Function name of handler name Camera (stopCameraPreview)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	STOPCAMERAPREVIEW_FUNCNAME : "stopCameraPreview",
	
	/** 
	 * Function name of handler name Camera (addMarkerListener)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	ADDMARKERLISTENER_FUNCNAME : "addMarkerListener",
	
	/** 
	 * Function name of handler name Camera (removeMarkerListener)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	REMOVEMARKERLISTENER_FUNCNAME : "removeMarkerListener",
	
	/** 
	 * Function name of handler name Camera (getCurrentMarkers)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	GETCURRENTMARKERS_FUNCNAME : "getCurrentMarkers",

	/** 
	 * Function name of handler name Camera (addBarcodeListener)
	 * @type string
	 * @version AR Processing Server V1.1.1
	 * @since AR Processing Server V1.1.1
	 */
	ADDBARCODELISTENER_FUNCNAME : "addBarcodeListener",
	
	/** 
	 * Function name of handler name Camera (removeBarcodeListener)
	 * @type string
	 * @version AR Processing Server V1.1.1
	 * @since AR Processing Server V1.1.1
	 */
	REMOVEBARCODELISTENER_FUNCNAME : "removeBarcodeListener",

    /**
     * Function name of handler name Barcode (getCurrentBarcodes)
     * @type string
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    GETCURRENTBARCODES_FUNCNAME : "getCurrentBarcodes",

	/** 
	 * Function name of handler name Bluetooth (addRegionListener)
	 * @type string
	 * @version AR Processing Server V1.1.1
	 * @since AR Processing Server V1.1.1
	 */
	ADDREGIONLISTENER_FUNCNAME: "addRegionListener",

	/** 
	 * Function name of handler name Bluetooth (removeRegionListener)
	 * @type string
	 * @version AR Processing Server V1.1.1
	 * @since AR Processing Server V1.1.1
	 */
	REMOVEREGIONLISTENER_FUNCNAME: "removeRegionListener",

    /**
     * Function name of handler name Bluetooth(getBluetoothStatus)
     * @type string
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    GETBLUETOOTHSTATUS_FUNCNAME : "getBluetoothStatus",

    /**
     * Function name of handler name Bluetooth(getCurrentRegions)
     * @type string
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    GETCURRENTREGIONS_FUNCNAME : "getCurrentRegions",

    /** 
	 * Function name of handler name Camera(takePicture)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	TAKEPICTURE_FUNCNAME : "takePicture",

    /** 
	 * Function name of handler name Camera(getPictureFile)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETPICTUREFILE_FUNCNAME : "getPictureFile",

    /** 
	 * Function name of handler name Camera(getZoom)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETZOOM_FUNCNAME : "getZoom",

    /** 
	 * Function name of handler name Camera(setZoom)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETZOOM_FUNCNAME : "setZoom",

    /**
     * Function name of handler name Camera(isZoomSupported)
     * @type string
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    ISZOOMSUPPORTED_FUNCNAME : "isZoomSupported",

	/** 
	 * Function name of handler name OS (getOperationMode)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	GETOPERATIONMODE_FUNCNAME : "getOperationMode",
	
	/** 
	 * Function name of handler name OS (openUrl)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	OPENURL_FUNCNAME : "openUrl",
	
	/** 
	 * Function name of handler name OS (onBodyClick)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	ONBODYCLICK_FUNCNAME : "onBodyClick",
	
	/** 
	 * Function name of handler name OS (openPreference)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	OPENPREFERENCE_FUNCNAME : "openPreference",

    /** 
	 * �n���h����OS�̊֐���(isOnline)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	ISONLINE_FUNCNAME : "isOnline",

    /** 
	 * Function name of handler name OS(getDetectMode)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETDETECTMODE_FUNCNAME : "getDetectMode",

    /** 
	 * Function name of handler name OS(setDetectMode)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETDETECTMODE_FUNCNAME : "setDetectMode",

    /** 
	 * Function name of handler name OS(openAuthoring)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	OPENAUTHORING_FUNCNAME : "openAuthoring",

    /** 
	 * Function name of handler name OS(closeApplication)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	CLOSEAPPLICATION_FUNCNAME : "closeApplication",

    /** 
	 * Function name of handler name OS(getArServerInfo)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETARSERVERINFO_FUNCNAME : "getArServerInfo",

	/** 
	 * Function name of handler name Data (setArServerInfo)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	SETARSERVERINFO_FUNCNAME : "setArServerInfo",
	
	/**
	 * Function name of handler name Data (useOfflineStorage)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	USEOFFLINESTORAGE_FUNCNAME : "useOfflineStorage",
	
	/**
	 * Function name of handler name Data (getArServerData)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	GETARSERVERDATA_FUNCNAME : "getArServerData",
	
	/**
	 * Function name of handler name Data (putArServerData)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	PUTARSERVERDATA_FUNCNAME : "putArServerData",
	
	/**
	 * Function name of handler name Data (postArServerData)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	POSTARSERVERDATA_FUNCNAME : "postArServerData",
	
	/**
	 * Function name of handler name Data (deleteArServerData)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	DELETEARSERVERDATA_FUNCNAME : "deleteArServerData",

	/**
	 * Function name of handler name Data (clearResourceStorage)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	CLEARRESOURCESTORAGE_FUNCNAME : "clearResourceStorage",
	
    /** 
	 * Function name of handler name Data (cacheUrlResource)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	CACHEURLRESOURCE_FUNCNAME : "cacheUrlResource",

	/** 
	 * Function name of handler name Rendering (clear)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	CLEAR_FUNCNAME : "clear",
	
	/** 
	 * Function name of handler name Rendering (get)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	GET_FUNCNAME : "get",

    /**
     * Function name of handler name Rendering (add)
     * @type string
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    ADD_FUNCNAME : "add",

	/** 
	 * Function name of handler name Renderer (put)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	PUT_FUNCNAME : "put",
	
	/** 
	 * Function name of handler name Rendering (remove)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	REMOVE_FUNCNAME : "remove",
	
	/** 
	 * Function name of handler name Rendering (setVisible)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETVISIBLE_FUNCNAME : "setVisible",
	
	/** 
	 * Function name of handler name Rendering (getVisible)
	 * @type string
	 * @version AR Processing Server V1.1 
	 * @since AR Processing Server V1.1
	 */
	GETVISIBLE_FUNCNAME : "getVisible",
	
	/** 
	 * Function name of handler name Log (log)
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	LOG_FUNCNAME : "log",

    /** 
	 * Function name of handler name Geolocation (getGeolocationStatus)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETGEOLOCATION_FUNCNAME: "getGeolocationStatus",

    /** 
	 * Function name of handler name Geolocation (addGeolocationListener)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	ADDGEOLOCATIONLISTENER_FUNCNAME : "addGeolocationListener",

    /** 
	 * Function name of handler name Geolocation(removeGeolocationListener)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	REMOVEGEOLOCATIONLISTENER_FUNCNAME : "removeGeolocationListener",
    
    /** 
	 * Function name of handler name Geolocation(getCurrentLocation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETCURRENTLOCATION_FUNCNAME : "getCurrentLocation",

    /** 
	 * Function name of handler name Geolocation(useFakeLocation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	USEFAKELOCATION_FUNCNAME : "useFakeLocation",
    
    /** 
	 * Function name of handler name Geolocation(setFakeLocation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETFAKELOCATION_FUNCNAME : "setFakeLocation",

    /** 
	 * Function name of handler name Geolocation(useRadar)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	USERADAR_FUNCNAME : "useRadar",

    /** 
	 * Function name of handler name Geolocation(setRadarLayout)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETRADARLAYOUT_FUNCNAME: "setRadarLayout",
    
    /** 
	 * Function name of handler name Geolocation(setRadarColorMode)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETRADARCOLORMODE_FUNCNAME: "setRadarColorMode",

    /** 
	 * Function name of handler name Geolocation(getDetectArea)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETDETECTAREA_FUNCNAME : "getDetectArea",
    
    /** 
	 * Function name of handler name Geolocation(setDetectArea)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETDETECTAREA_FUNCNAME : "setDetectArea",

    /**
     * Function name of handler name Geolocation(getCameraOrientationStatus)
     * @type string
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    GETCAMERAORIENTATIONSTATUS_FUNCNAME: "getCameraOrientationStatus",

    /** 
	 * Function name of handler name Geolocation(getCameraOrientation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GETCAMERAORIENTATION_FUNCNAME: "getCameraOrientation",

    /** 
	 * Function name of handler name Geolocation(useFakeOrientation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	USEFAKEORIENTATION_FUNCNAME : "useFakeOrientation",

    /** 
	 * Function name of handler name Geolocation(setFakeOrientation)
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	SETFAKEORIENTATION_FUNCNAME : "setFakeOrientation"
};
/**
 * Log library space.
 * @namespace AR.Log
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Log = {};

/**
 * Log output level enumeration.
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Log.LevelType = {

	/** 
	 * Error log
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	ERROR : 0,
	
	/** 
	 * Warning log
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	WARNING : 1,
	
	/** 
	 * Information log
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INFO : 2
	
	/** 
	 * Debug log
	 * @private
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */

};


/**
 * A string with the log output format is output to a log file. A log is not output if the log output state of the terminal is "false".
 * The upper limit for log file size is 2MB x 10 generations, which is a total of 20 MB. If the upper limit is exceeded, files are overwritten in sequence, starting from the oldest file.
 * @static
 * @param {AR.Log.LevelType} _level Log output level
 * @param {number} _code Message code. Specify between 1 and 99999.
 * @param {string} _message Log message body. Specify between 0 and 1024 characters - if this limit is exceeded, then only the first 1024 characters are output.
 * @param {Function} _onSuccess Callback function called if log output was successful. Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion of log output is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if log output failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var level = AR.Log.LevelType.INFO;
 * var code = 999;
 * var message = "This is log message.";
 * 
 * AR.Log.log(level, code, message, onSuccess, onError);
 * 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Log.log = function(_level, _code, _message, _onSuccess, _onError) {

	if(!AR.Util.checkValInArray(AR.Log.LevelType, _level))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.LOG, 0, "Level data type", "AR.Log.LevelType", "Log#log.");
	if(!AR.Util.checkType(_code, 'number', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.LOG, 0, "Code data type", "number", "Log#log.");
	if(!AR.Util.checkType(_message, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.LOG, 0, "Message data type", "string", "Log#log.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.LOG, 0, "OnSuccess data type", "function", "Log#log.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.LOG, 0, "OnError data type", "function", "Log#log.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_level, _code, _message];

	AR.Native.callARNativeASync(AR.Native.HandleName.Log, 
			AR.Native.FunctionName.LOG_FUNCNAME, argValues, callback);
};

/**
 * Exceptions library space. If an error occurs in the JavaScript library API for an AR product, a standard Error object is thrown, with the following properties:
 * <ul>
 *   <li>name {@link AR.Error.ErrorName} Error name
 *   <li>message {string} Error message
 *   <li>code {number} Error code
 *   <li>componentName {string} Component name
 *   <li>cause {Error} Error cause
 * </ul>
 * @namespace AR.Error
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error = {};

/**
 * Generates  an error. Do not access from outside the package.
 * @static
 * @private
 * @param {string} _name Error name
 * @param {Error} _cause Error cause
 * @param {number} _code Error code
 * @param {string} _message Message, ending with period
 * @return {Error} Error
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.createError = function(_cause, _name, _code, _message){
	var error = new Error();
	error.name = _name;
	error.message = _message;
	error.componentName = AR.COMPONENTNAME;
	error.code = _code;
	error.cause = _cause;
	return error;
};

/**
 * Generates InvalidStateError
 * @static
 * @private
 * @param {Error} _cause Error cause
 * @param {number} _subComponentCode Subcomponent code
 * @param {number} _detailCode Detailed error code
 * @param {string} _message Message, ending with period
 * @return {Error} NativeError
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.createInvalidStateError = function(_cause, _subComponentCode, _detailCode, _message){
	return AR.Error.createError(_cause,
			AR.Error.ErrorName.INVALIDSTATE,
			AR.Error.createMessageCode(_subComponentCode, AR.Error.MessageTypeCode.INVALIDSTATE, _detailCode),
			_message);
};

/**
 * Generates InvalidOperationError.
 * @static
 * @private
 * @param {Error} _cause Error cause
 * @param {number} _subComponentCode Subcomponent code
 * @param {number} _detailCode Detailed error code
 * @param {string} _message Message, ending with period
 * @return {Error} NativeError
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.createInvalidOperationError = function(_cause, _subComponentCode, _detailCode, _message){
	return AR.Error.createError(_cause,
			AR.Error.ErrorName.INVALIDOPERATION,
			AR.Error.createMessageCode(_subComponentCode, AR.Error.MessageTypeCode.INVALIDOPERATION, _detailCode),
			_message);
};

/**
 * Generates InvalidParemeterError.
 * @static
 * @private
 * @param {Error} _cause Error cause
 * @param {number} _subComponentCode Subcomponent code
 * @param {number} _detailCode Detailed error code
 * @param {string} _what Name of invalid argument. If null, "_what,_mustbe" does not display.
 * @param {string} _mustbe MustBe condition. If null, "_what,_mustbe" does not display.
 * @param {string} _message Supplementary message, ending with period
 * @return {Error} InvalidTypeError
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.createInvalidParameterError = function(_cause, _subComponentCode, _detailCode, _what, _mustbe, _message){
	createMessage = function(_what, _mustbe, _message){
		return (_what && _mustbe) ? _what + " must be " + _mustbe + ". "+ _message : _message;		
	};
	return AR.Error.createError(_cause,
			AR.Error.ErrorName.INVALIDPARAMETER, 
			AR.Error.createMessageCode(_subComponentCode, AR.Error.MessageTypeCode.INVALIDPARAMETER, _detailCode),
			createMessage(_what, _mustbe, _message));	
};

/**
 * Generates UnexpectedError.
 * @static
 * @private
 * @param {Error} _cause Error cause
 * @param {number} _subComponentCode Subcomponent code
 * @param {number} _detailCode Detailed error code
 * @param {string} _message Message, ending with period
 * @return {Error} UnexpectedError
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.createUnexpectedError = function(_cause, _subComponentCode, _detailCode, _message){	
	return AR.Error.createError(_cause,
			AR.Error.ErrorName.UNEXPECTED,
			AR.Error.createMessageCode(_subComponentCode, AR.Error.MessageTypeCode.UNEXPECTED, _detailCode), 
			"Unexpected error occurred. " + _message);
};

/**
 * Generates and returns a message number.
 * @static
 * @private
 * @param {AR.Error.SubcomponentCode} _subComponentCode Subcomponent code
 * @param {AR.Error.MessageTypeCode} _messageTypeCode Message type code
 * @param {number} _detailCode Detailed code
 * @return Message number
 * @version AR Data Manager 1.0
 * @since AR Data Manager 1.0
 */
AR.Error.createMessageCode = function(_subComponentCode, _messageTypeCode, _detailCode){
	return _subComponentCode*10000 + _messageTypeCode*100 + _detailCode;
};

/**
 * Error name enumeration.
 * @static
 * @enum {string}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.ErrorName = {
	/**
	 * Parameter error exception
	 * @type {string}
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDPARAMETER : "InvalidParameterError",
	
	/**
	 * Environment error exception
	 * @type {string}
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDSTATE : "InvalidStateError",
	
	/**
	 * Operation error exception
	 * @type {string}
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDOPERATION : "InvalidOperationError",
	
	/**
	 * Unexpected exception
	 * @type {string}
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	UNEXPECTED : "UnexpectedError"
};


/**
 *  Message type code enumeration.
 *  @static
 *  @private
 *  @enum {number}
 *  @constructor
 *  @version AR Processing Server V1.0
 *  @since AR Processing Server V1.0
 */
AR.Error.MessageTypeCode = {
	/**
	 * INFO type
	 * @type {number}
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INFO : 0,
	
	/**
	 * DEBUG type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	DEBUG : 9,
	
	/**
	 * InvalidStateError type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDSTATE : 10,
	
	/**
	 * InvalidOperationError type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDOPERATION : 20,
	
	/**
	 * InvalidParameterError type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	INVALIDPARAMETER : 30,
	
	/**
	 * NativeError type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	NATIVE : 80,
	
	/**
	 * UnexpectedError type
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	UNEXPECTED : 90
};

/**
 * Subcomponent code enumeration.
 * @static
 * @private
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Error.SubcomponentCode = {
	/**
	 * Subcomponent code for AR.Camera
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	CAMERA : 1,
	
	/**
	 * Subcomponent code for AR.HTTP
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	DATA : 2,
	
	/**
	 * Subcomponent code for AR.Log
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	LOG : 3,
	
	/**
	 * Subcomponent code for AR.Native
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	NATIVE : 4,
	
	/**
	 * Subcomponent code for AR.OS
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	OS : 5,
	
	/**
	 * Subcomponent code for AR.Renderer
	 * @type number
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	RENDERER : 6,
	
	/**
	 * Subcomponent code for AR.Geolocation
	 * @type number
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
	GEOLOCATION: 7,

    /**
     * Subcomponent code for AR.Barcode
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
	BARCODE : 8,

    /**
     * Subcomponent code for AR.Bluetooth
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BLUETOOTH : 9
};



/**
 * AR recognition control library space.
 * @namespace AR.Camera
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera = {};

/**
 * Camera view type enumeration. default value is 16byte number format
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.ViewKind = {
    /** 
	 * Camera view type
	 * @type number
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    CAMERA: 0x01,

    /** 
	 * Rendering view type
	 * @type number
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    RENDERING: 0x02,

    /** 
	 * Web view type
	 * @type number
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    WEBVIEW: 0x04
};


/**
 * Launches the camera. The camera runs when an overlay application is launched.
 * @static
 * @param {Function} _onSuccess Callback function called if the camera was successfully started. Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if the camera failed to start.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}: <br>
 * <ul>
 * <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 * <ul>
 *   <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *   <li>UnexpectedError: When generation of a request to a native application fails
 *   <li>InvalidStateError: When a native application call fails
 * </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Camera.startCameraView(onSuccess, onError);
 * 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera.startCameraView = function(_onSuccess, _onError) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#startCameraView.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#startCameraView.");

	var argValues = [];
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;

	AR.Native.callARNativeASync(AR.Native.HandleName.Camera, 
			AR.Native.FunctionName.STARTCAMERAPREVIEW_FUNCNAME, argValues, callback);
};

/**
 * Stops the camera. The camera runs when an overlay application is launched. If an application is aborted using a hardware button on the terminal while the camera is stopped, the camera will run when the application is launched again.
 * @static
 * @param {Function} _onSuccess Callback function called if the camera was successfully stopped. Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if the camera failed to stop.
 Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 * <ul>
 *   <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *   <li>UnexpectedError: When generation of a request to a native application fails
 *   <li>InvalidStateError: When a native application call fails
 * </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Camera.stopCameraView(onSuccess, onError);
 * 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera.stopCameraView = function(_onSuccess, _onError) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#stopCameraView.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#stopCameraView.");

	var argValues = [];
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;

	AR.Native.callARNativeASync(AR.Native.HandleName.Camera, 
			AR.Native.FunctionName.STOPCAMERAPREVIEW_FUNCNAME, argValues, callback);
};


/**
 * Starts the native application marker detection. The callback function specified in _onSuccessListener is called if a marker was detected or was missing.
 * A maximum of 10 marker detection event listeners can be registered.
 * @static 
 * @param {Function} _onSuccess Callback function called if marker detection event listener registration was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} Listener ID
 *  </ul>
 * @param {Function} _onError Callback function called if marker detection event listener registration failed. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an attempt was made to register 11 or more marker detection event listeners:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @param {Function} _onSuccessListener Callback function called if the marker detection state was changed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Detection information
 *  </ul> 
 *    The detection information value is the following Object type:
 *  <ul>
 *    <li>markerId {number} Marker ID
 *    <li>status {boolean} true (detected), or false (missing)
 *  </ul> 
 * @param {Function} _onErrorListner Callback function called if marker detection failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Listener ID : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * onSuccessListener = function(_result){
 *   if(_result.getValue().status == true){
 *     alert("Marker"+_result.getValue().markerId + " was detected.");
 *   } else if(_result.getValue().status == false){
 *     alert("Marker"+_result.getValue().markerId + " was missing.") ;
 *   }
 * };
 * 
 * onErrorListener = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Camera.addMarkerListener(onSuccess, onError, onSuccessListener, onErrorListener);
 * 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera.addMarkerListener = function(_onSuccess, _onError, _onSuccessListener, _onErrorListener) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#addMarkerListener.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#addMarkerListener.");
	if(!AR.Util.checkType(_onSuccessListener, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type for marker listener", "function", "Camera#addMarkerListener.");
	if(!AR.Util.checkType(_onErrorListener, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type for marker listener", "function", "Camera#addMarkerListener.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var callbackListener = new Object();
	callbackListener.success = _onSuccessListener;
	callbackListener.error = _onErrorListener;
	callbackListener.release = false;
	
	var argValues = [];

	return AR.Native.callARNativeASync(AR.Native.HandleName.Camera, 
		AR.Native.FunctionName.ADDMARKERLISTENER_FUNCNAME, argValues, callback, callbackListener);
};


/**
 * Removes the marker detection event listener.
 * @static
 * @param {string} _listenerId Event listener ID that you wish to delete. Specify between 0 and 256 characters.
 * @param {Function} _onSuccess Callback function called if a marker detection event listener was successfully removed. Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if removal of an AR marker detection event listener failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an unexpected exception occurs:</b>
 *   <li>status {string} "UNEXPECTED_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Camera.removeMarkerListener("camera123", onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera.removeMarkerListener = function(_listenerId, _onSuccess, _onError) {
	if(!AR.Util.checkType(_listenerId, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "ListenerId data type", "string", "Camera#removeMarkerListener.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#removeMarkerListener.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#removeMarkerListener.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_listenerId];
	
	AR.Native.callARNativeASync(AR.Native.HandleName.Camera, 
			AR.Native.FunctionName.REMOVEMARKERLISTENER_FUNCNAME, argValues, callback);
};


/**
 * Gets the currently detected marker IDs and an array of rectangular frame-like shape (pixel) coordinates. Four markers are required to guarantee recognition.
 * @static
 * @param {Function} _onSuccess Callback function called if marker information acquisition was successful. Specify Function(AR.Native.Result) as the callback function. 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Array.&lt;Object&gt;} Detection information
 *  </ul> 
 *  A detection information value is an Object type array, with the following properties:
 *  <ul>
 *    <li>value {number} Marker value
 *    <li>rect {Object} Rectangular frame-like shape coordinates
 *  </ul> 
 *    A rectangular frame-like shape rect is an Object type, with the following properties:
 *  <ul>
 *    <li>tl {Object} Marker rectangular frame-like shape coordinates - top-left XY coordinate
 *    <li>tr {Object} Marker rectangular frame-like shape coordinates - top-right XY coordinate
 *    <li>bl {Object} Marker rectangular frame-like shape coordinates - bottom-left XY coordinate
 *    <li>br {Object} Marker rectangular frame-like shape coordinates - bottom-right XY coordinate
 *  </ul> 
 *    All XY coordinates (tl, tr, bl, and br) are Object types, with the following properties:
 *  <ul>
 *    <li>x {number} pixel coordinate value
 *    <li>y {number} pixel coordinate value
 *  </ul> 
 * @param {Function} _onError Callback function called if marker information acquisition failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var markers = _result.getValue();
 *   for(var i=0;i&ltmarkers.length; i++){
 *     alert("Marker"+ markers[i].value + "\n" +
 *           "{"+markers[i].rect.tl.x + "," + markers[i].rect.tl.y +"}," + 
 *           "{"+markers[i].rect.tr.x + "," + markers[i].rect.tr.y +"}," + 
 *           "{"+markers[i].rect.bl.x + "," + markers[i].rect.bl.y +"}," + 
 *           "{"+markers[i].rect.br.x + "," + markers[i].rect.br.y +"}");
 *   }
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Camera.getCurrentMarkers(onSuccess, onError);
 * 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Camera.getCurrentMarkers = function(_onSuccess, _onError) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#getCurrentMarkers.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#getCurrentMarkers.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [];

	AR.Native.callARNativeASync(AR.Native.HandleName.Camera, 
		AR.Native.FunctionName.GETCURRENTMARKERS_FUNCNAME, argValues, callback);

};

/**
 * Take the screen shot and save it for selected camera view type.
 *
 * @static
 * @param {number} _view {@link AR.Camera.ViewKind} as {number}.
 * @param {Function} _onSuccess Callback function called if take screen shot was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} The saved image file name
 *  </ul> 
 * @param {Function} _onError Callback function called if take screen shot failed.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var imageData = _result.getValue();
 *   alert(_result.getStatus());
 *   }
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var view = AR.Camera.ViewKind.CAMERA | AR.Camera.ViewKind.RENDERING;
 * 
 * AR.Camera.takePicture(view, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.takePicture = function (_view, _onSuccess, _onError) {
    if (!AR.Util.checkType(_view, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "ViewKind data type", "number", "Camera#takePicture.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#takePicture.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#takePicture.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_view];

    AR.Native.callARNativeASync(AR.Native.HandleName.Camera,
		AR.Native.FunctionName.TAKEPICTURE_FUNCNAME, argValues, callback);
};


/**
 * Get saved picture file using {@link AR.Camera.takePicture}.
 * @static
 * @param {string} _fileName The image file name that user wants to get.
 * @param {Function} _onSuccess Callback function called if get picture file was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {File} image file object
 *  </ul> 
 * @param {Function} _onError Callback function called if get picture file failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var imageFile = _result.getValue();
 *   document.getElementById("image" ).src = "data:image/png;base64," + imageFile;
 *   }
 * };
 * 
 * onError = function(_result){
 *   document.getElementById("image").style.display = "none";
 * };
 * 
 * var path = imageFile;
 * 
 * AR.Camera.getPictureFile(path, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.getPictureFile = function (_path, _onSuccess, _onError) {
    if (!AR.Util.checkType(_path, 'string', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "File data type", "string", "Camera#getPictureFile.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#getPictureFile.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#getPictureFile.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_path];

    AR.Native.callARNativeASync(AR.Native.HandleName.Camera,
		AR.Native.FunctionName.GETPICTUREFILE_FUNCNAME, argValues, callback);
};


/**
 * Get current camera zoom value.
 * @static
 * @param {Function} _onSuccess  Callback function called if get camera zoom value was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {number} Zoom value
 *  </ul>
 * @param {Function} _onError Callback function called if get zoom value failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     alert("Zoom value : " + _result.getValue());
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Camera.getZoom(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.getZoom = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#getZoom.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#getZoom.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Camera,
        AR.Native.FunctionName.GETZOOM_FUNCNAME, argValues, callback);
};


/**
 * Set the zoom value for camera.
 * Zoom value can be set in the range from 0 to 100 .
 * If the value is outside the range , the closest max or min value is set.
 * The zoom value will affect the hardware performance.
 * @static
 * @param {number} _zoom Zoom value
 * @param {Function} _onSuccess Callback function called if set camera zoom value was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul>
 * @param {Function} _onError Callback function called if set camera zoom value failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * var zoom = 20;
 *
 * AR.Camera.setZoom(zoom, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.setZoom = function (_zoom, _onSuccess, _onError) {
    if (!AR.Util.checkType(_zoom, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "Zoom data type", "number", "Camera#setZoom.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#setZoom.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#setZoom.");


    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_zoom];

    AR.Native.callARNativeASync(AR.Native.HandleName.Camera,
        AR.Native.FunctionName.SETZOOM_FUNCNAME, argValues, callback);
};


/**
 * Check if the device support change camera zoom level or not.
 * @static
 * @param {Function} _onSuccess Callback function called if check device zoom support was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {boolean} true(support) | false(not support)
 *  </ul>
 * @param {Function} _onError Callback function called if check device zoom support failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     if (_result.getValue()){
 *         alert("Support");
 *     } else {
 *         alert("Not Support");
 *     }
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Camera.isZoomSupported(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Camera.isZoomSupported = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnSuccess data type", "function", "Camera#isZoomSupported.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.CAMERA, 0, "OnError data type", "function", "Camera#isZoomSupported.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Camera,
        AR.Native.FunctionName.ISZOOMSUPPORTED_FUNCNAME, argValues, callback);
};
/**
 * Data communication library space.
 * @namespace AR.Data
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data = {};


/**
 * Sets information (such as URL and authentication information) for the connected AR processing server. If not using basic authentication, specify null for the ID and password.
 * An existing URL is overwritten if a different URL is set. The following characters are allowed for the ID and password: Halfwidth alphanumeric characters, space ( ), exclamation mark (!), question mark (?), at symbol (@), backslash (\), number sign (#), dollar sign ($), percent (%), ampersand (&), opening parenthesis ((), closing parenthesis ()), opening curly bracket ({), closing curly bracket (}), opening square bracket ([), closing square bracket, (]), plus (+), hyphen (-), equals (=), slash (/), vertical bar (|), underscore (_), double quotation mark ("), single quotation mark ('), colon (:), semicolon (;), comma (,), period (.), caret (^), grave accent (`) and tilde (~).
 * @static
 * @param {string} _url Specify between 0 and 256 characters for the AR processing server URL. Only http(s) is supported.
 * @param {string} _id Specify between 0 and 256 characters for the basic authentication ID.
 * @param {string} _password Specify between 0 and 256 characters for the basic authentication password.
 * @param {Function} _onSuccess Callback function called if AR processing server information setup was successful.
 * Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if AR processing server information setup failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var url = "http://192.0.2.0:9102";
 * var id = "aruser";
 * var password = "aruser";
 * 
 * AR.Data.setArServerInfo(url, id, password, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data.setArServerInfo = function(_url, _id, _password, _onSuccess, _onError){
	if(!AR.Util.checkType(_url, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "URL data type", "string", "Data#setArServerInfo.");
	if(!AR.Util.checkType(_id, 'string', true)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "ID data type", "string", "Data#setArServerInfo.");
	if(!AR.Util.checkType(_password, 'string', true)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Password data type", "string", "Data#setArServerInfo.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#setArServerInfo.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#setArServerInfo.");

	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_url,_id,_password];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.SETARSERVERINFO_FUNCNAME, argValues, callback);
};


/**
 * Sets whether to use offline storage. Always ensure to use storage if working in an offline environment. Offline storage can save up to the capacity of the terminal's internal storage.
 * @static
 * @param {boolean} _useStorage Set to "true" to use storage, or "false" otherwise.
 * @param {Function} _onSuccess Callback function called if storage setup was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if storage setup failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Data.useOfflineStorage(true, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data.useOfflineStorage = function(_useStorage, _onSuccess, _onError){
	if(!AR.Util.checkType(_useStorage, 'boolean', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "UseStorage data type", "boolean", "Data#useOfflineStorage.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#useOfflineStorage.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#useOfflineStorage.");

	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_useStorage];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.USEOFFLINESTORAGE_FUNCNAME, argValues, callback);
	
};

/**
 * Sends a request to the AR processing server to acquire (GET) data. If offline storage has been set, query strings are used as a key when saving acquisition results to the offline storage. For the second and later data acquisition attempts using the same query, the data is obtained from the offline storage. If forced reading is specified, or if the results do not exist in the offline storage, the data will be acquired from the AR processing server.
 * @static
 * @param {string} _query Query string for the AR processing server API. The string length must be between 0 and 4096 characters.
 * @param {boolean} _isSuperReload Specifies whether to perform forced reading from the AR processing server without acquiring data from offline storage. Set to "true" to perform forced reading, or "false" otherwise.
 * @param {Function} _onSuccess Callback function called if data acquisition was successful.
 * Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} AR processing server response
 *  </ul> 
 * @param {Function} _onError Callback function called if data acquisition failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an IO error occurs in a native application:</b>
 *   <li>status {string} "ARIO_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an HTTP exception occurs in a native application:</b>
 *   <li>status {string} "AR_HTTP_EXCEPTION"
 *   <li>value {Object} Object type with the following properties:
 *     <ul>
 *       <li>status {number} HTTP response status code
 *       <li>statusText {string} HTTP response status string
 *       <li>responseText {string} HTTP response body string
 *     </ul>
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 *   var quads = _result.getValue();
 *   var records = quads.records;
 *   for(var i=0;i&ltrecords.length; i++){
 *     var qvalues = records[i].qvalues;
 *     var quad = "";
 *     for(var j=0;j&ltqvalues.length;j++){
 *       quad += qvalues[j].qattributeName + " : ";
 *       if(qvalues[j].stringValue !== null) quad += qvalues[j].stringValue + "\n";
 *       if(qvalues[j].longValue !== null) quad += qvalues[j].longValue + "\n";
 *       if(qvalues[j].floatValue !== null) quad += qvalues[j].floatValue + "\n";
 *     }
 *     alert(quad);
 *   }
 * };
 * 
 * onError = function(_result){
 *   if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
 *     alert(_result.getStatus() + "\n" + 
 *           _result.getValue().status + " : " + _result.getValue().statusText + "\n" +
 *           _result.getValue().responseText);
 *   } else {
 *     alert(_result.getStatus() + "\n" + _result.getValue());
 *   }
 * };
 * 
 * var query = "quads?type=RECORDSANDCOUNT&limitRange={\"start\":1,\"end\":10}&whereExpressions=[{\"qattributeNameRanges\":[{\"start\":\"age\",\"end\":\"age\"}],\"qvalueType\":\"LONG\",\"qvalueRanges\":[{\"start\":10,\"end\":30}]}]"
 * 
 * AR.Data.getArServerData(query, true, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 * 
 */
AR.Data.getArServerData = function(_query, _isSuperReload, _onSuccess, _onError){
	if(!AR.Util.checkType(_query, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Query data type", "string", "Data#getArServerData.");
	if(!AR.Util.checkType(_isSuperReload, 'boolean', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "IsSuperReload data type", "boolean", "Data#getArServerData.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#getArServerData.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#getArServerData.");

	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_query, _isSuperReload];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.GETARSERVERDATA_FUNCNAME, argValues, callback);
};

/**
 * Updates (PUT) AR processing server data. This cannot be run offline. Note: Unsupported method
 * @private 
 * @static
 * @param {string} _query Query string for AR processing server API. The string length must be between 0 and 4096 characters.
 * @param {string} _body Body string for AR processing server API. The string length must be between 0 and 1000000 characters.
 * @param {number} _version Version of the data to be updated. The value range is between 1 and 2147483647.
 * @param {Function} _onSuccess Callback function called if data updating was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} AR processing server response
 *  </ul> 
 * @param {Function} _onError Callback function called if data updating failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an IO error occurs in a native application:</b>
 *   <li>status {string} "ARIO_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an HTTP exception occurs in a native application:</b>
 *   <li>status {string} "AR_HTTP_EXCEPTION"
 *   <li>value {Object} The following Object type:
 *     <ul>
 *       <li>status {number} HTTP response status code
 *       <li>statusText {string} HTTP response status string
 *       <li>responseText {string} HTTP response body string
 *     </ul>
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 * 	alert(_result.getStatus());
 * 	var qType = JSON.parse(_result.getValue());
 *  var name = qType.name;
 *  var description = qType.description;
 *  var version = qType.version;
 * };
 * 
 * onError = function(_result){
 *   if(_result.getStatus() == "AR_HTTP_EXCEPTION");
 *     alert(_result.getStatus() + "\n" + 
 *           _result.getValue().status + " : " + _result.getValue().statusText + "\n" +
 *           _result.getValue().responseText);
 *   else{
 *     alert(_result.getStatus() + "\n" + _result.getValue());
 *   }
 * };
 * 
 * var query = "qtypes/arscn_scenario";
 * var body = "{\"name\":"arscn_scenario", \"description\" : \"Manages usage scenarios. \", \"version\": 1}"; 
 * AR.Data.putArServerData(query, body, 1, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 * 
 */
AR.Data.putArServerData = function(_query, _body, _version, _onSuccess, _onError){
	if(!AR.Util.checkType(_query, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Query data type", "string", "Data#putArServerData.");
	if(!AR.Util.checkType(_body, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Body data type", "string", "Data#putArServerData.");
	if(!AR.Util.checkType(_version, 'number', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Version data type", "string", "Data#putArServerData.");	
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#putArServerData.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#putArServerData.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_query, _body, _version];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.PUTARSERVERDATA_FUNCNAME, argValues, callback);
};

/**
 * Sends a data registration (POST) request to the AR processing server. This cannot be run offline.
 * @static
 * @param {string} _query Query string for AR processing server API. The string length must be between 0 and 4096 characters.
 * @param {string} _body Body string for AR processing server API. The string length must be between 0 and 1000000 characters.
 * @param {Function} _onSuccess Callback function called when data registration was successful.
 * Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} AR processing server response
 *  </ul> 
 * @param {Function} _onError Callback function called if data registration failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an IO error occurs in a native application</b>
 *   <li>status {string} "ARIO_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an HTTP exception occurs in a native application</b>
 *   <li>status {string} "AR_HTTP_EXCEPTION"
 *   <li>value {Object} Object type with the following properties:
 *     <ul>
 *       <li>status {number} HTTP response status code
 *       <li>statusText {string} HTTP response status string
 *       <li>responseText {string} HTTP response body string
 *     </ul>
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus()+ "\n" +
 *         _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
 *     alert(_result.getStatus() + "\n" + 
 *           _result.getValue().status + " : " + _result.getValue().statusText + "\n" +
 *           _result.getValue().responseText);
 *   } else{
 *     alert(_result.getStatus() + "\n" + _result.getValue());
 *   }
 * };
 * 
 * var query = "quads";
 * // create superimposedGraphic...
 * var superimposedGraphic = new AR.Renderer.SuperimposedGraphic();
 *
 * // create body
 * var arId = {"qtypeName":"arpoiarmk_default", "qattributeName":"ar_id","stringValue":null, "longValue":1, "floatValue":null};
 * var arName = {"qtypeName":"arpoiarmk_default", "qattributeName":"ar_name", "stringValue":"sample", "longValue":null, "floatValue":null};
 * var arscnScenarioid = {"qtypeName":"arpoiarmk_default", "qattributeName":"arscn_scenarioid", "stringValue":null, "longValue":1, "floatValue":null};
 * var arsenSceneid = {"qtypeName":"arpoiarmk_default", "qattributeName":"arsen_sceneid", "stringValue":null, "longValue":1, "floatValue":null};
 * var armkMarkerid = {"qtypeName":"arpoiarmk_default", "qattributeName":"armk_markerid", "stringValue":null, "longValue":1, "floatValue":null};
 * var arpoiSuperimposedgraphic = {"qtypeName":"arpoiarmk_default", "qattributeName":"arpoi_superimposedgraphic", "stringValue":JSON.stringify(superimposedGraphic), "longValue":null, "floatValue":null};
 * var body = JSON.stringify({"qtypeName":"arpoiarmk_default", "qvalues":[arId, arName, arscnScenarioid, arsenSceneid, armkMarkerid, arpoiSuperimposedgraphic]});
 * 
 * AR.Data.postArServerData(query, body, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data.postArServerData = function(_query, _body, _onSuccess, _onError){
	if(!AR.Util.checkType(_query, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Query data type", "string", "Data#postArServerData.");
	if(!AR.Util.checkType(_body, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Body data type", "string", "Data#postArServerData.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#postArServerData.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#postArServerData.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_query, _body];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.POSTARSERVERDATA_FUNCNAME, argValues, callback);
};

/**
 * Sends a data deletion (DELETE) request to the AR processing server. This cannot be run offline.
 * @static
 * @param {string} _query Query string for AR processing server API. The string length must be between 0 and 4096 characters.
 * @param {number} _version Version of the data to be deleted. The value range is between 1 and 2147483647.
 * @param {Function} _onSuccess Callback function called if data removal was successful.
 * Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if data removal failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an IO error occurs in a native application</b>
 *   <li>status {string} "ARIO_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an HTTP exception occurs in a native application</b>
 *   <li>status {string} "AR_HTTP_EXCEPTION"
 *   <li>value {Object} Object type with the following properties:
 *     <ul>
 *       <li>status {number} HTTP response status code
 *       <li>statusText {string} HTTP response status string
 *       <li>responseText {string} HTTP response body string
 *     </ul>
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
 *     alert(_result.getStatus() + "\n" + 
 *           _result.getValue().status + " : " + _result.getValue().statusText + "\n" +
 *           _result.getValue().responseText);
 *   } else{
 *     alert(_result.getStatus() + "\n" + _result.getValue());
 *   }
 * };
 * 
 * var query = "qentities/arpoiarmk_default/12345";
 * var version = 1;
 * 
 * AR.Data.deleteArServerData(query, version, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data.deleteArServerData = function(_query, _version, _onSuccess, _onError){
	if(!AR.Util.checkType(_query, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Query data type", "string", "Data#deleteArServerData.");
	if(!AR.Util.checkType(_version, 'number', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Version data type", "number", "Data#deleteArServerData.");	
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#deleteArServerData.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#deleteArServerData.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	var argValues = [_query, _version];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.DELETEARSERVERDATA_FUNCNAME, argValues, callback);
};


/**
 * Clears all data saved in offline storage. The AR overlay definition data and resource files are cleared.
 * @static 
 * @param {Function} _onSuccess Callback function called if successful.
 * Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called upon failure.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Data.clearResourceStorage(onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Data.clearResourceStorage = function(_onSuccess, _onError){
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#clearResourceStorage.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#clearResourceStorage.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [];

	AR.Native.callARNativeASync(AR.Native.HandleName.Data, 
		AR.Native.FunctionName.CLEARRESOURCESTORAGE_FUNCNAME, argValues, callback);
	
};


/**
 * Get current AR server URL
 * @static
 * @param {Function} _onSuccess Callback function called if get AR server URL was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} AR server URL.�Will return null if there is no AR server set before.
 *  </ul> 
 * @param {Function} _onError Callback function called if get AR server URL failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     alert("AR Server: " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Data.getArServerInfo(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Data.getArServerInfo = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#getArServerInfo.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#getArServerInfo.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Data,
			AR.Native.FunctionName.GETARSERVERINFO_FUNCNAME, argValues, callback);
};


/**
 * Save the resources of the specified URL to offline storage. There will be an error if the application is in offline or standalone mode.
 * Only support http(s) Protocol. Use it to enable the offline storage .
 * When the network communication is starting the onSuccess function will be called.
 * If the communication failed or there is no resource under the URL, an error message popup dialog will appear.
 * @static
 * @param {string} _url resource URL
 * @param {Function} _onSuccess Callback function called if cache URL resource was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if cache URL resource failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an IO error occurs in a native application</b>
 *   <li>status {string} "ARIO_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var url = "http://192.0.2.0/sample.pdf";
 * 
 * AR.Data.cacheUrlResource(url, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Data.cacheUrlResource = function (_url, _onSuccess, _onError) {
    if (!AR.Util.checkType(_url, 'string', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "Url data type", "string", "Data#cacheUrlResource.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnSuccess data type", "function", "Data#cacheUrlResource.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.DATA, 0, "OnError data type", "function", "Data#cacheUrlResource.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_url];

    AR.Native.callARNativeASync(AR.Native.HandleName.Data,
		AR.Native.FunctionName.CACHEURLRESOURCE_FUNCNAME, argValues, callback);
};
/**
 * Operating system control library space.
 * @namespace AR.OS
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.OS = {};

/**
 * AR Detect mode number list
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1
 */
AR.OS.DetectMode = {
    /** 
	 * AR marker
	 * @type number
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    ARMARKER: 0x01,

    /**
     * Location data
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    GEOLOCATION: 0x02,

    /**
     * Beacon
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     * @supported Android
     */
    BEACON: 0x04,

    /**
     * Universal Product Code A (UPC-A)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BARCODE_UPC_A: 0x08,

    /**
     * Universal Product Code E (UPC-E)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BARCODE_UPC_E: 0x10,

    /**
     * European Article Number 8 (EAN-8)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BARCODE_EAN_8: 0x20,

    /**
     * European Article Number 13 (EAN-13)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BARCODE_EAN_13: 0x40,

    /**
     * Quick Response Code (QRCODE)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     */
    BARCODE_QRCODE: 0x80
};


/**
 * Gets the operation mode for overlay applications. The following two operation modes are available:
 *      <ul>
 *        <li>serverMode : server connection mode
 *        <li>standAloneMode : standalone mode
 *      </ul>
 * @static
 * @param {Function} _onSuccess Callback function called if successful. Specify Function(AR.Native.Result).
 * The argument that is passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} Operation mode
 *  </ul> 
 * @param {Function} _onError Callback function that is called when an error occurs.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs within a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument type is not the expected type, or null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     alert("Operation mode : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.OS.getOperationMode(onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.OS.getOperationMode = function(_onSuccess, _onError) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#getOperationMode.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#getOperationMode.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [];

	AR.Native.callARNativeASync(AR.Native.HandleName.OS, 
			AR.Native.FunctionName.GETOPERATIONMODE_FUNCNAME, argValues, callback);
};


/**
 * Displays the content of the specified URL. Calls and displays external applications that have been installed on a terminal in accordance with the content file format (for example, PDF file -> adobe.reader, etc.) A dialog box is displayed to confirm the file name and application name prior to launch, in order to avoid launching unexpected files or applications. An error occurs if the terminal does not have an application that is capable of displaying the content. Only the http(s) protocol is supported. If the connection is online, content is displayed on the network using HTTP communication. If the connection is offline, the content cached in the terminal will be displayed. This assumes that content has been displayed in an online state and content has been saved to the cache in advance.
 * Returns "onSuccess" as soon as communication starts over the network. If there is no content at the URL location, or if communication fails, a dialog box with an error message is displayed.
 * @static
 * @param {string} _url Content URL
 * @param {Function} _onSuccess Callback function called if successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if an error occurred.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs within a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var url = "http://192.0.2.0/sample.pdf";
 * 
 * AR.OS.openUrl(url, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.OS.openUrl = function(_url, _onSuccess, _onError) {
	if(!AR.Util.checkType(_url, 'string', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "URL data type", "string", "OS#openUrl.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#openUrl.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#openUrl.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_url];

	AR.Native.callARNativeASync(AR.Native.HandleName.OS, 
		AR.Native.FunctionName.OPENURL_FUNCNAME, argValues, callback);
};


/**
 * Passes the coordinates from a click event in WebView to a native application. Tap actions are performed if there is AR content that has tap actions specified for the notified coordinates.
 * @static
 * @param {Object} _event Click event object. For coordinate values, Android and Windows use _event.clientX/Y, while iOS uses _event.touches[0].clientX/Y.
 * @param {Function} _onSuccess Callback function called if successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application when passing click event is completed normally is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if an error occurred.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs within a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * 
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * clickEvent = function(){
 *     AR.OS.onBodyClick(event, onSuccess, onError);
 * };
 * 
 * if(window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) //iOS
 *   document.addEventListener("touchstart", clickEvent, false);
 * else if(window.navigator.userAgent.match(/(android)/i) || window.navigator.userAgent.match(/(windows)/)) //android, windows
 *   document.addEventListener("click", clickEvent, false);
 * 
 * @version AR Processing Server V1.0.1
 * @since AR Processing Server V1.0
 */
AR.OS.onBodyClick = function(_event, _onSuccess, _onError){
	if(_event == null)
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "Event", "not null", "OS#onBodyClick.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#onBodyClick.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#onBodyClick.");
	
	var x, y;
	//For iOS
	if(AR.Native.isIOS()) {
		if(_event.touches[0]==null) 
			throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "Event.touches[0]", "not null", "OS#onBodyClick.");
		x = _event.touches[0].clientX;
		y = _event.touches[0].clientY;
	//For Android and Windows
	} else if (AR.Native.isAndroid() || AR.Native.isWindows()){
		x = _event.clientX;
		y = _event.clientY;
	//Other browser
	} else {
		x = _event.clientX;
		y = _event.clientY;
	}
	
	if(!AR.Util.checkType(x,'number',false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "X data type", "number", "OS#onBodyClick.");
	if(!AR.Util.checkType(y,'number',false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "Y data type", "number", "OS#onBodyClick.");

	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [x, y];

	AR.Native.callARNativeASync(AR.Native.HandleName.OS, 
		AR.Native.FunctionName.ONBODYCLICK_FUNCNAME, argValues, callback);
};


/**
 * Calls the configuration window in a native application.
 * @param {Function} _onSuccess Callback function called if the call to the configuration window was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if the call to the configuration window failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * AR.OS.openPreference(onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.OS.openPreference = function(_onSuccess, _onError){
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#openPreference.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#openPreference.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [];
	AR.Native.callARNativeASync(AR.Native.HandleName.OS, 
			AR.Native.FunctionName.OPENPREFERENCE_FUNCNAME, argValues, callback);
};


/**
 * Check if current device is online. The network status is a value from {@link AR.OS.getOperationMode}
 * The network status is represented as following .
 *      <ul>
 *        <li>true : Online
 *        <li>false : Offline
 *      </ul>
 * @static
 * @param {Function} _onSuccess Callback function called if the call to check network status was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {boolean} Network status
 *  </ul> 
 * @param {Function} _onError Callback function called if the call to check network status failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     if (_result.getValue()){
 *         alert("online");
 *     } else {
 *         alert("offline");
 *     }
 *     
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.OS.isOnline(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.OS.isOnline = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#isOnline.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#isOnline.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.OS,
			AR.Native.FunctionName.ISONLINE_FUNCNAME, argValues, callback);
};


/**
 * Load authoring application
 * @private
 * @param {Function} _onSuccess Callback function called if start authoring application was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if start authoring application failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * AR.OS.openAuthoring(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.OS.openAuthoring = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#openAuthoring.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#openAuthoring.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];
    AR.Native.callARNativeASync(AR.Native.HandleName.OS,
			AR.Native.FunctionName.OPENAUTHORING_FUNCNAME, argValues, callback);
};


/**
 * Close AR application. After the AR application is closed, the display will change back to the screen before the AR application started.
 * If function called from another process, the user will to notified.
 * @param {Function} _onSuccess Callback function called if close authoring application was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if close authoring application failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * AR.OS.closeApplication(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.OS.closeApplication = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#closeApplication.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#closeApplication.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];
    AR.Native.callARNativeASync(AR.Native.HandleName.OS,
			AR.Native.FunctionName.CLOSEAPPLICATION_FUNCNAME, argValues, callback);
};


/**
 * Get current AR application selected detection mode. Returned detection mode is from {@link AR.OS.DetectMode} as bitmap {number}.
 * @static
 * @param {Function} _onSuccess Callback function called if get detection mode was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {number} {@link AR.OS.DetectMode} bitmap
 *  </ul> 
 * @param {Function} _onError Callback function called if get detection mode failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     var detectList = "";
 *     var detectModeFlag = _result.getValue();
 *     if ((detectModeFlag & AR.OS.DetectMode.ARMARKER) != 0){
 *         detectList += "arMarker ";
 *     }
 *     if ((detectModeFlag & AR.OS.DetectMode.GEOLOCATION) != 0){
 *         detectList += "geolocation ";
 *     }
 *     alert("Current detection mode list: " + detectList);
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.OS.getDetectMode(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.OS.getDetectMode = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#getDetectMode.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#getDetectMode.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.OS,
			AR.Native.FunctionName.GETDETECTMODE_FUNCNAME, argValues, callback);
};


/**
 * Set AR application detection mode. Configurable detection mode is from {@link AR.OS.DetectMode} as bitmap {number}.
 * Multiple detection modes can be selected.
 * @static
 * @param {number} _mode {@link AR.OS.DetectMode} bitmap number
 * @param {Function} _onSuccess Callback function called if set detection mode was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if set detection mode failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var mode = AR.OS.DetectMode.ARMARKER | AR.OS.DetectMode.GEOLOCATION;
 * 
 * AR.OS.setDetectMode(mode, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.OS.setDetectMode = function (_mode, _onSuccess, _onError) {
    if (!AR.Util.checkType(_mode, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "DetectMode data type", "number", "OS#setDetectMode.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnSuccess data type", "function", "OS#setDetectMode.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.OS, 0, "OnError data type", "function", "OS#setDetectMode.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_mode];

    AR.Native.callARNativeASync(AR.Native.HandleName.OS,
		AR.Native.FunctionName.SETDETECTMODE_FUNCNAME, argValues, callback);
};


/**
 * AR rendering library space.
 * @namespace AR.Renderer
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer = {};


/**
 * Deletes all AR content set for the native AR display layer.
 * @static
 * @param {Function} _onSuccess Callback function called if AR content removal was successful.
 * Specify Function(AR.Native.Result).
 * The callback function argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if AR content deletion failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Renderer.clear(onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.clear = function(_onSuccess, _onError){
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnSuccess data type", "function", "Renderer#clear.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnError data type", "function", "Renderer#clear.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
				AR.Native.FunctionName.CLEAR_FUNCNAME, argValues, callback);

};


/**
 * Gets AR overlay definition data for AR content set in the specified coordinate system from the native AR display layer.
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem Coordinate system. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJGeolocationCoordinateSystem} and {@link AR.Renderer.FJBeaconCoordinateSystem}, can be used.
 * @param {Function} _onSuccess Callback function called if AR overlay definition data acquisition was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} value {string}JSON string of the AR overlay definition data array set in the coordinate system 
 *  </ul> 
 * @param {Function} _onError Callback function called if AR overlay definition data acquisition failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var superimposedGraphics = _result.getValue();
 *   alert(JSON.stringify(superimposedGraphics));
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 * 
 * AR.Renderer.get(coordinateSystem, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.get = function(_coordinateSystem, _onSuccess, _onError){
	if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "CoordinateSystem data type", "AR.Renderer.AbstractCoordinateSystem", "Renderer#get.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnSuccess data type", "function", "Renderer#get.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnError data type", "function", "Renderer#get.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_coordinateSystem];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
				AR.Native.FunctionName.GET_FUNCNAME, argValues, callback);
};

/**
 * Adds the AR overlay definition data to the specified coordinate system to the native AR display layer. If the AR overlay definition data already exists in the coordinate system, then it will be overwritten. Up to 100 AR content items can be added to the same scene.
 * If AR content contains external URL for resources such as image textures or tap actions, then they will be downloaded when the AR content is added to the native AR display layer. A warning dialog box is displayed if there are no resources in the specified URL, or if there is no data in offline storage.
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem  Coordinate system. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJBeaconCoordinateSystem} and {@link AR.Renderer.FJGeolocationCoordinateSystem}can be specified.
 * @param {(AR.Renderer.SuperimposedGraphic[])} _superimposedGraphics AR overlay definition data array for AR content to be added.
 * @param {Function} _onSuccess Callback function called if AR content addition was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul>
 * @param {Function} _onError Callback function called if AR content addition failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an operation error occurs in a native application:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * var superimposedGraphic = new AR.Renderer.SuperimposedGraphic();
 * var squareModelGraphic = new AR.Renderer.SquareModelGraphic();
 *
 * var scale = new AR.Renderer.Point();
 * scale.setX(1.0);
 * scale.setY(1.0);
 * scale.setZ(1.0);
 * squareModelGraphic.setScale(scale);
 *
 * var texture = new AR.Renderer.TextTexture();
 * texture.setColor(4289720046);
 * texture.setText("text");
 * squareModelGraphic.setTexture(texture);
 *
 * superimposedGraphic.setGraphic(squareModelGraphic);
 * superimposedGraphic.setProjectionType(AR.Renderer.SuperimposedGraphic.ProjectionType.ORTHO2D);
 *
 * var rotation = new AR.Renderer.Point();
 * rotation.setX(0.0);
 * rotation.setY(0.0);
 * rotation.setZ(0.0);
 * superimposedGraphic.setRotation(rotation);
 *
 * var translation = new AR.Renderer.Point();
 * translation.setX(1.0);
 * translation.setY(1.0);
 * translation.setZ(0.0);
 * superimposedGraphic.setTranslation(translation);
 *
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 *
 * AR.Renderer.add(coordinateSystem, [superimposedGraphic], onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.add = function(_coordinateSystem, _superimposedGraphics, _onSuccess, _onError){
    if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "CoordinateSystem data type", "AR.Renderer.AbstractCoordinateSystem", "Renderer#add.");
    if(!AR.Util.checkArrayType(_superimposedGraphics, AR.Renderer.SuperimposedGraphic, false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "SuperimposedGraphics data type", "array of AR.Renderer.SuperimposedGraphic", "Renderer#add.");
    if(!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnSuccess data type", "function", "Renderer#add.");
    if(!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnError data type", "function", "Renderer#add.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_coordinateSystem, _superimposedGraphics];

    AR.Native.callARNativeASync(AR.Native.HandleName.Renderer,
        AR.Native.FunctionName.ADD_FUNCNAME, argValues, callback);
};


/**
 * Adds to the native AR display layer the specified AR content in the specified coordinate system. If AR content already exists in the coordinate system, then it will be overwritten. Up to 100 AR content items can be added to the same scene.
 * If AR content contains external URL for resources such as image textures or tap actions, then they will be downloaded when the AR content is added to the native AR display layer. A warning dialog box is displayed if there are no resources in the specified URL, or if there is no data in offline storage.
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem Coordinate system object. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJGeolocationCoordinateSystem} and {@link AR.Renderer.FJBeaconCoordinateSystem}, can be specified.
 * @param {(AR.Renderer.SuperimposedGraphic[])} _superimposedGraphics AR overlay definition data array for AR content to be added.
 * @param {Function} _onSuccess Callback function called if AR content addition was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if AR content addition failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an operation error occurs in a native application:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var superimposedGraphic = new AR.Renderer.SuperimposedGraphic();
 * var squareModelGraphic = new AR.Renderer.SquareModelGraphic();
 * 
 * var scale = new AR.Renderer.Point();
 * scale.setX(1.0);
 * scale.setY(1.0);
 * scale.setZ(1.0);
 * squareModelGraphic.setScale(scale);
 * 
 * var texture = new AR.Renderer.TextTexture();
 * texture.setColor(4289720046);
 * texture.setText("text");
 * squareModelGraphic.setTexture(texture);
 * 
 * superimposedGraphic.setGraphic(squareModelGraphic);
 * superimposedGraphic.setProjectionType(AR.Renderer.SuperimposedGraphic.ProjectionType.ORTHO2D);
 * 
 * var rotation = new AR.Renderer.Point();
 * rotation.setX(0.0);
 * rotation.setY(0.0);
 * rotation.setZ(0.0);
 * superimposedGraphic.setRotation(rotation);
 * 
 * var translation = new AR.Renderer.Point();
 * translation.setX(1.0);
 * translation.setY(1.0);
 * translation.setZ(0.0);
 * superimposedGraphic.setTranslation(translation);
 * 
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 * 
 * AR.Renderer.put(coordinateSystem, [superimposedGraphic], onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.put = function(_coordinateSystem, _superimposedGraphics, _onSuccess, _onError){
	if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "CoordinateSystem data type", "AR.Renderer.AbstractCoordinateSystem", "Renderer#put.");
	if(!AR.Util.checkArrayType(_superimposedGraphics, AR.Renderer.SuperimposedGraphic, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "SuperimposedGraphics data type", "array of AR.Renderer.SuperimposedGraphic", "Renderer#put.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnSuccess data type", "function", "Renderer#put.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnError data type", "function", "Renderer#put.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_coordinateSystem, _superimposedGraphics];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
				AR.Native.FunctionName.PUT_FUNCNAME, argValues, callback);
};


/**
 * Removes from the native AR display layer AR content in the specified coordinate system.
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem Coordinate system object. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJGeolocationCoordinateSystem} and {@link AR.Renderer.FJBeaconCoordinateSystem}, can be specified.
 * @param {Function} _onSuccess Callback function called if AR content removal was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if AR content deletion failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 * 
 * AR.Renderer.remove(coordinateSystem, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.remove = function(_coordinateSystem, _onSuccess, _onError){
	if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "CoordinateSystem data type", "AR.Renderer.AbstractCoordinateSystem", "Renderer#remove.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnSuccess data type", "function", "Renderer#remove.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "OnError data type", "function", "Renderer#remove.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_coordinateSystem];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
					AR.Native.FunctionName.REMOVE_FUNCNAME, argValues, callback);
};

/**
 * Converts the specified JSON string into an AR overlay definition data object.
 * @static
 * @param {string} _jsonString JSON string to be converted into an object. Must be between 0 and 100000 characters.
 * @throws {Error} InvalidParameterError: When the argument is not the expected type, or is not a JSON string
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.parseSuperimposedGraphic = function(_jsonString){
	if(!AR.Util.checkType(_jsonString, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "JsonString data type", "string", "Renderer#parseSuperimposedGraphic.");
	if(_jsonString.length > 100000)
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "JsonString length", "less than 100000 or equal to 100000 characters.", "Renderer#parseSuperimposedGraphic.")
	var superimposedGraphic;
	try{
		superimposedGraphic = JSON.parse(_jsonString, AR.Util.reviver);
	}
	catch(e){
		if(e.name == "InvalidParameterError") throw e;
		else throw AR.Error.createInvalidParameterError(e,AR.Error.SubcomponentCode.RENDERER, 0, "The jsonString", "valid as JSON format", "Renderer#parseSuperimposedGraphic.");
	}
	return superimposedGraphic;
};


/**
 * Change AR object's visibility on specified coordinate system
 * @private
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem Coordinate system object. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJBeaconCoordinateSystem} and {@link AR.Renderer.FJGeolocationCoordinateSystem}can be specified.
 * @param {string} _arName The name of AR graphic object {AR.Renderer.SuperimposedGraphic} which should be changed.
 * @param {boolean} _isVisible true: show AR graphic object, false: hide AR graphic object
 * @param {Function} _onSuccess Callback function called if set AR content display was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if set AR content display failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 * 
 * AR.Renderer.setVisible(coordinateSystem,"arname",true, onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.setVisible = function(_coordinateSystem, _arName, _isVisible, _onSuccess, _onError){
	if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of coordinateSystem", "AR.Renderer.AbstractCoordinateSystem", "Renderer#setVisible.");
	if(!AR.Util.checkType(_arName, 'string', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of arName", "string", "Renderer#setVisible.");
	if(!AR.Util.checkType(_isVisible, 'boolean', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of isVisible", "boolean", "Renderer#setVisible.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of onSuccess", "function", "Renderer#setVisible.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of onError", "function", "Renderer#setVisible.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_coordinateSystem,_arName,_isVisible];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
					AR.Native.FunctionName.SETVISIBLE_FUNCNAME, argValues, callback);
};


/**
 * Return the AR object's current visibility state on speicified coordinate system
 * @private
 * @static
 * @param {AR.Renderer.AbstractCoordinateSystem} _coordinateSystem  Coordinate system object. {@link AR.Renderer.FJARMarkerCoordinateSystem}, {@link AR.Renderer.FJBarcodeCoordinateSystem}, {@link AR.Renderer.FJBeaconCoordinateSystem} and {@link AR.Renderer.FJGeolocationCoordinateSystem}can be specified.
 * @param {string} _arName The name of AR graphic object {AR.Renderer.SuperimposedGraphic} which need be checked.
 * @param {Function} _onSuccess Callback function called if get AR content display was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {boolean} true: AR graphic object is shown, false: AR graphic object is hidden
 *  </ul> 
 * @param {Function} _onError Callback function called if get AR content display failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
 * coordinateSystem.setValue(1);
 * 
 * AR.Renderer.getVisible(coordinateSystem,"arname", onSuccess, onError);
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.getVisible = function(_coordinateSystem, _arName, _onSuccess, _onError){
	if(!AR.Util.checkType(_coordinateSystem, AR.Renderer.AbstractCoordinateSystem, false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of coordinateSystem", "AR.Renderer.AbstractCoordinateSystem", "Renderer#getVisible.");
	if(!AR.Util.checkType(_arName, 'string', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of arName", "string", "Renderer#getVisible.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of onSuccess", "function", "Renderer#getVisible.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "The data type of onError", "function", "Renderer#getVisible.");

	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_coordinateSystem,_arName];

	AR.Native.callARNativeASync(AR.Native.HandleName.Renderer, 
					AR.Native.FunctionName.GETVISIBLE_FUNCNAME, argValues, callback);
};

/**
 * Image base class.
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractElement = function(){
	this.typeName = "AbstractElement";
};


/**
 * Gets ID.
 * @private
 * @return {string} id
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractElement.prototype.getId = function(){ return this.id; };


/**
 * Sets ID.
 * @private
 * @param {string} _id The ID must be between 0 and 32 characters
 * @throws {Error} InvalidParameterError: When _id is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractElement.prototype.setId = function(_id){ 
	if(!AR.Util.checkType(_id, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "ID data type", "string", "");
	this.id = _id; 
};


/**
 * Named image base class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractNamedElement = function(){
	this.typeName = "AbstractNamedElement";
};

AR.Util.inherit(AR.Renderer.AbstractNamedElement, AR.Renderer.AbstractElement);


/**
 * Gets name.
 * @return {string} Name
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractNamedElement.prototype.getName = function(){ return this.name; };


/**
 * Sets name.
 * @param {string} _name The name must be between 0 and 256 characters.
 * @throws {Error} InvalidParameterError: When _name is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractNamedElement.prototype.setName = function(_name){ 
	if(!AR.Util.checkType(_name, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Name data type", "string", "");
	this.name = _name; 
};

/**
 * Action base class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractAction = function(){
	this.typeName = "AbstractAction";
};

AR.Util.inherit(AR.Renderer.AbstractAction, AR.Renderer.AbstractElement);


/**
 * URL action element class.
 * @constructor
 * @extends AR.Renderer.AbstractAction
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.URLAction = function(){
	this.typeName = "URLAction";
};

AR.Util.inherit(AR.Renderer.URLAction, AR.Renderer.AbstractAction);


/**
 * Gets content URL.
 * @return {string} Content URL 
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.URLAction.prototype.getSrc = function(){ return this.src; };


/**
 * Sets content URL. Must be between 0 and 256 characters. Supports the RFC2369 format and http(s) protocol only.
 * @param {string} _src Content URL
 * @throws {Error} InvalidParameterError: When _src is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.URLAction.prototype.setSrc = function(_src){ 
	if(!AR.Util.checkType(_src, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Src data type", "string", "");
	this.src = _src; 
};


/**
 * Script action element class.
 * @constructor
 * @extends AR.Renderer.AbstractAction
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ScriptAction = function(){
	this.typeName = "ScriptAction";
};

AR.Util.inherit(AR.Renderer.ScriptAction, AR.Renderer.AbstractAction);


/**
 * Gets the script expression.
 * @return {string} Script expression
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ScriptAction.prototype.getExpression = function(){ return this.expression; };


/**
 * Sets the script expression. Must be between 0 and 256 characters.
 * @param {string} _expression Script expression
 * @throws {Error} InvalidParameterError: When _expression is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ScriptAction.prototype.setExpression = function(_expression){ 
	if(!AR.Util.checkType(_expression, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Expression data type", "string", "");
	this.expression = _expression;	
};


/**
 * Coordinate element class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point = function(){
	this.typeName = "Point";
};

AR.Util.inherit(AR.Renderer.Point, AR.Renderer.AbstractElement);


/**
 * Gets x-coordinate.
 * @return {number} x-coordinate
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.getX = function(){ return this.x; };


/**
 * Sets x-coordinate. The range of values that can be set depends on the object that has Point as a property.
 * @param {number} _x x-coordinate
 * @throws {Error} InvalidParameterError: When _x is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.setX = function(_x){ 
	if(!AR.Util.checkType(_x, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "X data type", "number", "");
	this.x = _x;
};


/**
 * Gets y-coordinate.
 * @return {number} y-coordinate
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.getY = function(){ return this.y; };


/**
 * Sets y-coordinate. The range of values that can be set depends on the object that has Point as a property.
 * @param {number} _y y-coordinate
 * @throws {Error} InvalidParameterError: When _y is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.setY = function(_y){
	if(!AR.Util.checkType(_y, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Y data type", "number", "");
	this.y = _y; 
};


/**
 * Gets z-coordinate.
 * @return {number} z-coordinate
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.getZ = function(){ return this.z; };


/**
 * Sets z-coordinate. The range of values that can be set depends on the object that has Point as a property.
 * @param {number} _z z-coordinate
 * @throws {Error} InvalidParameterError: When _z is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Point.prototype.setZ = function(_z){
	if(!AR.Util.checkType(_z, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Z data type", "number", "");
	this.z = _z;
};


/**
 * Size element class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size = function(){
	this.typeName = "Size";
};

AR.Util.inherit(AR.Renderer.Size, AR.Renderer.AbstractElement);


/**
 * Gets width.
 * @return {number} Width
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.getWidth = function(){return this.width; };


/**
 * Sets width. Must be between 10 and 1024. The unit of measure is pix.
 * @param {number} _width Width
 * @throws {Error} InvalidParameterError: When _width is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.setWidth = function(_width){
	if(!AR.Util.checkType(_width, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Width data type", "number", "");
	this.width = _width; 
};


/**
 * Gets height.
 * @return {number} Height
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.getHeight = function(){ return this.height; };


/**
 * Sets height. Must be between 10 and 1024. The unit of measure is pix.
 * @param {number} _height Height
 * @throws {Error} InvalidParameterError: When _height is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.setHeight = function(_height){
	if(!AR.Util.checkType(_height, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Height data type", "number", "");
	this.height = _height;
};

/**
 * Gets depth.
 * @private
 * @return {number} Depth
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.getDepth = function(){ return this.depth; };


/**
 * Sets depth. Must be between 10 and 1024.
 * @private
 * @param {number} _depth Depth
 * @throws {Error} InvalidParameterError: When _depth is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.Size.prototype.setDepth = function(_depth){
	if(!AR.Util.checkType(_depth, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Depth data type", "number", "");
	this.depth = _depth;
};


/**
 * Coordinate system base class.
 * @constructor
 * @extends AR.Renderer.AbstractNamedElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractCoordinateSystem = function(){
	this.typeName = "AbstractCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.AbstractCoordinateSystem, AR.Renderer.AbstractNamedElement);


/**
 * Marker coordinate system base class.
 * @constructor
 * @extends AR.Renderer.AbstractCoordinateSystem
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractMarkerCoordinateSystem = function(){
	this.typeName = "AbstractMarkerCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.AbstractMarkerCoordinateSystem, AR.Renderer.AbstractCoordinateSystem);


/**
 * FJAR marker coordinate system element class.
 * @constructor
 * @extends AR.Renderer.AbstractMarkerCoordinateSystem
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.FJARMarkerCoordinateSystem = function(){
	this.typeName = "FJARMarkerCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.FJARMarkerCoordinateSystem, AR.Renderer.AbstractMarkerCoordinateSystem);


/**
 * Gets AR marker ID.
 * @return {number} Marker ID
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.FJARMarkerCoordinateSystem.prototype.getValue = function(){ return this.value; };


/**
 * Sets AR marker ID. Must be between 1 and 999999999999.
 * @param {number} _value Marker ID
 * @throws {Error} InvalidParameterError: When _value is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.FJARMarkerCoordinateSystem.prototype.setValue = function(_value){
	if(!AR.Util.checkType(_value, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Value data type", "number", "");
	this.value = _value;
};

/**
 * FJ Barcode coordinate system base class.
 * @constructor
 * @extends AR.Renderer.AbstractCoordinateSystem
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.AbstractBarcodeCoordinateSystem = function(){
    this.typeName = "AbstractBarcodeCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.AbstractBarcodeCoordinateSystem, AR.Renderer.AbstractCoordinateSystem);


/**
 * FJ Barcode coordinate system element class.
 * @constructor
 * @extends AR.Renderer.AbstractBarcodeCoordinateSystem
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBarcodeCoordinateSystem = function(){
    this.typeName = "FJBarcodeCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.FJBarcodeCoordinateSystem, AR.Renderer.AbstractBarcodeCoordinateSystem);


/**
 * Gets Barcode Value.
 * @return {string} Barcode Value, the value contains barcode's format and content in certain pattern: "format:content"
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBarcodeCoordinateSystem.prototype.getValue = function(){ return this.value; };


/**
 * Sets Barcode content.
 * @param {string} _content Barcode Content
 * @throws {Error} InvalidParameterError: When _content is not the expected type
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBarcodeCoordinateSystem.prototype.setValue = function(_content){
    if(!AR.Util.checkType(_content, 'string', true))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Value data type", "string", "");
    this.value = _content;
};

/**
 * FJ geolocation coordinate system base class.
 * @constructor
 * @extends AR.Renderer.AbstractCoordinateSystem
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.AbstractGeolocationCoordinateSystem = function(){
    this.typeName = "AbstractGeolocationCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.AbstractGeolocationCoordinateSystem, AR.Renderer.AbstractCoordinateSystem);


/**
 * FJ Geolocation coordinate system element class.
 * @constructor
 * @extends AR.Renderer.AbstractGeolocationCoordinateSystem
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.FJGeolocationCoordinateSystem = function(){
    this.typeName = "FJGeolocationCoordinateSystem";
    this.value = "GPS";
};


AR.Util.inherit(AR.Renderer.FJGeolocationCoordinateSystem, AR.Renderer.AbstractGeolocationCoordinateSystem);


/**
 * FJ Beacon coordinate system base class.
 * @constructor
 * @extends AR.Renderer.AbstractCoordinateSystem
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.AbstractBeaconCoordinateSystem = function(){
    this.typeName = "AbstractBeaconCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.AbstractBeaconCoordinateSystem, AR.Renderer.AbstractCoordinateSystem);


/**
 * FJ Beacon coordinate system element class.
 * @constructor
 * @extends AR.Renderer.AbstractBeaconCoordinateSystem
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBeaconCoordinateSystem = function(){
    this.typeName = "FJBeaconCoordinateSystem";
};

AR.Util.inherit(AR.Renderer.FJBeaconCoordinateSystem, AR.Renderer.AbstractBeaconCoordinateSystem);


/**
 * Gets Beacon Value.
 * @return {string} Barcode Value, the value contains beacon's uuid
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBeaconCoordinateSystem.prototype.getValue = function(){ return this.value; };


/**
 * Sets Beacon content. Fomat is the hexadecimal notation in the case of 16-bit and 32 bit format. add the '-' in the case of 128-bit format. For example:123e4567-e89b-12d3-a456-426655440000.
 * @param {string} _uuid Beacon's UUID
 * @throws {Error} InvalidParameterError: When _uuid is not the expected type
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Renderer.FJBeaconCoordinateSystem.prototype.setValue = function(_uuid){
    if(!AR.Util.checkType(_uuid, 'string', true))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Value data type", "string", "");
    this.value = _uuid;
};

/**
 * Overlay graphic element class.
 * @constructor
 * @extends AR.Renderer.AbstractNamedElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic = function(){
	this.typeName = "SuperimposedGraphic";
};

AR.Util.inherit(AR.Renderer.SuperimposedGraphic, AR.Renderer.AbstractNamedElement);


/**
 * Gets translation coordinate.
 * @return {AR.Renderer.Point} Translation coordinate
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.getTranslation = function(){ return this.translation; };


/**
 * Sets translation coordinates. Each coordinate value must be between -32 and 32 when using the AR marker, Barcode or Beacon. The unit of measure is the length of one side of a marker on the display. Latitude of coordinate value must be between -90 and 90, longitude of coordinate value must be between -180 and 180 or altitude of coordinate value must be between -100000 and 100000 when using the Location data.
 * @param {AR.Renderer.Point} _translation Translation coordinate
 * @throws {Error} InvalidParameterError: When _translation is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.setTranslation = function(_translation){
	if(!AR.Util.checkType(_translation, AR.Renderer.Point, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Translation data type", "AR.Renderer.Point", "");
	this.translation = _translation;
};


/**
 * Gets rotation coordinate.
 * @return {AR.Renderer.Point} Rotation coordinate
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.getRotation = function(){ return this.rotation; };


/**
 * Sets rotation coordinates. Each coordinate value must be between -360 and 360. The unit of measure is degrees.
 * @param {AR.Renderer.Point} _rotation Rotation coordinate
 * @throws {Error} InvalidParameterError: When _rotation is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.setRotation = function(_rotation){ 
	if(!AR.Util.checkType(_rotation, AR.Renderer.Point, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Rotation data type", "AR.Renderer.Point", "");
	this.rotation = _rotation; 
};


/**
 * Gets projection type.
 * @return {AR.Renderer.SuperimposedGraphic.ProjectionType} Projection type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.getProjectionType = function(){ return this.projectionType; };


/**
 * Sets projection type.
 * @param {AR.Renderer.SuperimposedGraphic.ProjectionType} _projectionType Projection type
 * @throws {Error} InvalidParameterError: When _projection is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.setProjectionType = function(_projectionType){ 
	if(!AR.Util.checkValInArray(AR.Renderer.SuperimposedGraphic.ProjectionType, _projectionType, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "ProjectionType data type", "AR.Renderer.SuperimposedGraphic.ProjectionType", "");
	this.projectionType = _projectionType;
};


/**
 * Gets tap action.
 * @return {AR.Renderer.AbstractAction} Tap action
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.getTapAction = function(){ return this.tapAction; };


/**
 * Sets tap action. {@link AR.Renderer.ScriptAction} or {@link AR.Renderer.URLAction} can be specified.
 * @param {AR.Renderer.AbstractAction} _tapAction Tap action
 * @throws {Error} InvalidParameterError: When _tapAction is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.setTapAction = function(_tapAction){
	if(!AR.Util.checkType(_tapAction, AR.Renderer.AbstractAction, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "TapAction data type", "AR.Renderer.AbstractAction", "");
	this.tapAction = _tapAction; 
};


/**
 * Gets graphic.
 * @return {AR.Renderer.AbstractGraphic} Graphic
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.getGraphic = function(){ return this.graphic; };


/**
 * Sets graphic. Only {@link AR.Renderer.SquareModelGraphic} can be specified.
 * @param {AR.Renderer.AbstractGraphic} _graphic Graphic
 * @throws {Error} InvalidParameterError: When _graphic is not the expected type
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.prototype.setGraphic = function(_graphic){
	if(!AR.Util.checkType(_graphic, AR.Renderer.AbstractGraphic, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Graphic data type", "AR.Renderer.AbstractGraphic", "");
	this.graphic = _graphic;
};


/**
 * Projection type enumeration.
 * @static
 * @enum {string}
 * @constructor
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SuperimposedGraphic.ProjectionType = {
	/** 
	 * Perspective projection
	 * @static
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	PERSPECTIVE : "PERSPECTIVE",
	
	/** 
	 * Orthogonal projection
	 * @static
	 * @type string
	 * @version AR Processing Server V1.0
	 * @since AR Processing Server V1.0
	 */
	ORTHO2D : "ORTHO2D"
};


/**
 * Texture base class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture = function(){
	this.typeName = "AbstractTexture";
};

AR.Util.inherit(AR.Renderer.AbstractTexture, AR.Renderer.AbstractElement);


/**
 * Gets border width.
 * @private
 * @return {number} Border width
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.getBorderWidth = function(){ return this.borderWidth; };


/**
 * Sets border width. Must be between 1 and 1024. The unit of measure is pix.
 * @private
 * @param {number} _borderWidth Border width
 * @throws {Error} InvalidParameterError: When _borderWidth is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.setBorderWidth = function(_borderWidth){
	if(!AR.Util.checkType(_borderWidth, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "BorderWidth data type", "number", "");
	this.borderWidth = _borderWidth;
};


/**
 * Gets border color.
 * @private
 * @return {number} ARGB-format border color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.getBorderColor = function(){ return this.borderColor; };


/**
 * Sets border color. Must be between 0 and 4294967295.
 * @private
 * @param {number} _borderColor ARGB-format border color
 * @throws {Error} InvalidParameterError: When _borderColor is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.setBorderColor = function(_borderColor){
	if(!AR.Util.checkType(_borderColor, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "BorderColor data type", "AR.Renderer.number", "");
	this.borderColor = _borderColor;
};


/**
 * Gets background color.
 * @private
 * @return {number} ARGB-format background color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.getBackgroundColor = function(){ return this.backgroundColor; };


/**
 * Sets background color. Must be between 0 and 4294967295.
 * @private
 * @param {number} _backgroundColor ARGB-format background color
 * @throws {Error} InvalidParameterError: When _backgroundColor is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.setBackgroundColor = function(_backgroundColor){
	if(!AR.Util.checkType(_backgroundColor, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "BackgroundColor data type", "number", "");
	this.backgroundColor = _backgroundColor;
};


/**
 * Gets size.
 * @private
 * @return {AR.Renderer.Size} Size
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.getSize = function(){ return this.size; };


/**
 * Sets size. When word wrap is enabled, it is compulsory to set the size. Do not set the size if wordwrap is disabled.
 * @private
 * @param {AR.Renderer.Size} _size Size
 * @throws {Error} InvalidParameterError: When _size is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractTexture.prototype.setSize = function(_size){
	if(!AR.Util.checkType(_size, AR.Renderer.Size, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Size data type", "AR.Renderer.Size", "");
	this.size = _size;
};


/**
 * Class for rendering image texture.
 * @constructor
 * @extends AR.Renderer.AbstractTexture
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ImageTexture = function(){
	this.typeName = "ImageTexture";
};

AR.Util.inherit(AR.Renderer.ImageTexture, AR.Renderer.AbstractTexture);


/**
 * Gets image texture URL.
 * @return {string} Image texture URL
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ImageTexture.prototype.getSrc = function(){ return this.src; };


/**
 * Sets image texture URL. Must be between 0 and 256 characters. Only http(s) can be specified. Supported image file formats are jpg (jpeg) and png, and the vertical and horizontal size for image resource files must be between 10 and 1024 pixels.
 * @param {string} _src Image texture URL
 * @throws {Error} InvalidParameterError: When _src is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.ImageTexture.prototype.setSrc = function(_src){
	if(!AR.Util.checkType(_src, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Src data type", "string", "");
	this.src = _src;
};


/**
 * Class for rendering string textures.
 * @constructor
 * @extends AR.Renderer.AbstractTexture
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture = function(){
	this.typeName = "TextTexture";
};

AR.Util.inherit(AR.Renderer.TextTexture, AR.Renderer.AbstractTexture);


/**
 * Gets string value.
 * @return {string} String value
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getText = function(){ return this.text; };


/**
 * Sets string value. Must be between 1 and 256 characters.
 * @param {string} _text String value
 * @throws {Error} InvalidParameterError: When _text is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setText = function(_text){
	if(!AR.Util.checkType(_text, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Text data type", "string", "");
	this.text = _text;
};


/**
 * Gets font size.
 * @return {number} Font size
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getFontSize = function(){ return this.fontSize; };


/**
 * Sets font size. Must be between 10 and 750.
 * @param {number} _fontSize Font size
 * @throws {Error} InvalidParameterError: When _fontSize is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setFontSize = function(_fontSize){
	if(!AR.Util.checkType(_fontSize, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "FontSize data type", "number", "");
	this.fontSize = _fontSize;
};


/**
 * Gets text color.
 * @return {number} ARGB-format text color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getColor = function(){ return this.color; };


/**
 * Sets text color. Must be between 0 and 4294967295.
 * @param {number} _color ARGB-format text color
 * @throws {Error} InvalidParameterError: When _color is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setColor = function(_color){
	if(!AR.Util.checkType(_color, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Color data type", "number", "");
	this.color = _color;
};


/**
 * Gets whether word wrap is enabled.
 * @return {boolean} Whether word wrap is enabled
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getWordWrap = function(){ return this.wordWrap; };


/**
 * Sets whether to enable word wrap. If enabled, ensure to set a size.
 * @param {boolean} _wordWrap  Set to "true" to enable word wrap, or "false" otherwise
 * @throws {Error} InvalidParameterError: When _wordWrap is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setWordWrap = function(_wordWrap){
	if(!AR.Util.checkType(_wordWrap, 'boolean', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "WordWrap data type", "boolean", "");
	this.wordWrap = _wordWrap;
};


/**
 * Gets background color.
 * @return {number} ARGB-format background color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getBackgroundColor = function(){ return this.backgroundColor; };


/**
 * Sets background color. Must be between 0 and 4294967295.
 * @param {number} _backgroundColor ARGB-format background color
 * @throws {Error} InvalidParameterError: When _backgroundColor is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setBackgroundColor = function(_backgroundColor){
	if(!AR.Util.checkType(_backgroundColor, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "BackgroundColor data type", "number", "");
	this.backgroundColor = _backgroundColor;
};


/**
 * Gets size.
 * @return {AR.Renderer.Size} Size
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.getSize = function(){ return this.size; };


/**
 * Sets size. If word wrap is enabled, then the size must be set. Conversely, do not set the size if word wrap is disabled.
 * @param {AR.Renderer.Size} _size Size
 * @throws {Error} InvalidParameterError: When _size is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.TextTexture.prototype.setSize = function(_size){
	if(!AR.Util.checkType(_size, AR.Renderer.Size, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Size data type", "AR.Renderer.Size", "");
	this.size = _size;
};


/**
 * Class for rendering handwriting textures.
 * @constructor
 * @extends AR.Renderer.AbstractTexture
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.HandwritingTexture = function(){
	this.typeName = "HandwritingTexture";
};

AR.Util.inherit(AR.Renderer.HandwritingTexture, AR.Renderer.AbstractTexture);


/**
 * Gets handwriting image texture URL.
 * @return {string} Handwriting image texture URL
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.HandwritingTexture.prototype.getSrc = function(){
	return this.src;
};

/**
 * Sets handwriting image texture URL. Must be between 0 and 256 characters. Only http(s) can be specified. Supported image file formats are jpg (jpeg) and png, and the vertical and horizontal size for image resource files must be between 10 and 1024 pixels.
 * @param {string} _src Handwriting image texture URL
 * @throws {Error} InvalidParameterError: When _src is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.HandwritingTexture.prototype.setSrc = function(_src){
	if(!AR.Util.checkType(_src, 'string', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Src data type", "string", "");
	this.src = _src;
};


/**
 * Gets handwriting text color.
 * @private
 * @return {number} ARGB-format text color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.HandwritingTexture.prototype.getHandwritingColor = function(){
	return this.HandwritingColor;
};

/**
 * Sets handwriting text color. Must be between 0 and 4294967295.
 * @private
 * @param {number} _color ARGB-format text color
 * @throws {Error} InvalidParameterError: When _color is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.HandwritingTexture.prototype.setHandwritingColor = function(_handwritingColor){
	if(!AR.Util.checkType(_handwritingColor, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "HandwritingColor data type", "number", "");
	this.HandwritingColor = _handwritingColor;
};


/**
 * Graphic base class.
 * @constructor
 * @extends AR.Renderer.AbstractElement
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractGraphic = function(){
	this.typeName = "AbstractGraphic";
};

AR.Util.inherit(AR.Renderer.AbstractGraphic, AR.Renderer.AbstractElement);


/**
 * Gets scale.
 * @return {AR.Renderer.Point} Scale
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractGraphic.prototype.getScale = function(){ return this.scale; };


/**
 * Sets scale. Each Point object value must be between 0.1 and 32 when using the AR marker, Barcode or Beacon. Each Point object value must be between 0.1 and 150000 when using the Location data. The unit of measure is multiples.
 * @param {AR.Renderer.Point} _scale Scale
 * @throws {Error} InvalidParameterError: When _scale is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractGraphic.prototype.setScale = function(_scale){
	if(!AR.Util.checkType(_scale, AR.Renderer.Point, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Scale data type", "AR.Renderer.Point", "");
	this.scale = _scale;
};


/**
 * External model base class (for displaying AR content).
 * @constructor
 * @extends AR.Renderer.AbstractGraphic
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.AbstractOpenModelGraphic = function(){
	this.typeName = "AbstractOpenModelGraphic";
};

AR.Util.inherit(AR.Renderer.AbstractOpenModelGraphic, AR.Renderer.AbstractGraphic);


/**
 * External model base class (for displaying AR content).
 * @constructor
 * @extends AR.Renderer.AbstractOpenModelGraphic
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.ObjModelGraphic = function(){
	this.typeName = "ObjModelGraphic";
};

AR.Util.inherit(AR.Renderer.ObjModelGraphic, AR.Renderer.AbstractOpenModelGraphic);


/**
 * Gets object file path URL.
 * @return {string} Object file path URL
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.ObjModelGraphic.prototype.getSrc = function(){ return this.src; };


/**
 * Sets object file path URL.
 * @param {string} _src Object file path URL
 * @throws {Error} InvalidParameterError: When _objSrc is not the expected type
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Renderer.ObjModelGraphic.prototype.setSrc = function(_src){
    if(!AR.Util.checkType(_src, 'string', true))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Src data type", "string", "");
    this.src = _src;
};

/**
 * Class for setting AR content information created in object files.
 * @constructor
 * @extends AR.Renderer.AbstractGraphic
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractBuiltinModelGraphic = function(){
	this.typeName = "AbstractBuiltinModelGraphic";
};

AR.Util.inherit(AR.Renderer.AbstractBuiltinModelGraphic, AR.Renderer.AbstractGraphic);


/**
 * Gets color.
 * @private
 * @return {number} ARGB-format color
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractBuiltinModelGraphic.prototype.getColor = function(){ return this.color; };


/**
 * Sets color. Must be between 0 and 4294967295.
 * @private
 * @param {number} _color ARGB-format color
 * @throws {Error} InvalidParameterError: When _color is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractBuiltinModelGraphic.prototype.setColor = function(_color){ 
	if(!AR.Util.checkType(_color, 'number', true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Color data type", "number", "");
	this.color = _color;
};


/**
 * Gets texture class.
 * @return {AR.Renderer.AbstractTexture} Texture class
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractBuiltinModelGraphic.prototype.getTexture = function(){ return this.texture; };


/**
 * Sets texture class. {@link AR.Renderer.ImageTexture}, {@link AR.Renderer.TextTexture}, or {@link AR.Renderer.HandwritingTexture} can be specified.
 * @param {AR.Renderer.AbstractTexture} _texture Texture class
 * @throws {Error} InvalidParameterError: When _texture is not the expected type
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.AbstractBuiltinModelGraphic.prototype.setTexture = function(_texture){
	if(!AR.Util.checkType(_texture, AR.Renderer.AbstractTexture, true))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.RENDERER, 0, "Texture data type", "AR.Renderer.AbstractTexture", "");
	this.texture = _texture;
};


/**
 * Class for setting overlay information created using standard polygons (rectangles).
 * @constructor
 * @extends AR.Renderer.AbstractBuiltinModelGraphic
 * @version AR Processing Server V1.0
 * @since AR Processing Server V1.0
 */
AR.Renderer.SquareModelGraphic = function(){
	this.typeName = "SquareModelGraphic";
};

AR.Util.inherit(AR.Renderer.SquareModelGraphic, AR.Renderer.AbstractBuiltinModelGraphic);



/**
 * AR geolocation control library space.
 * @namespace AR.Geolocation
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation = {};

/**
 * GPS location information enumeration. Default Value represented as a hexadecimal number
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.GeolocationStatus = {
    /**
     * High accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    HIGH_ACCURACY: 0x01,

    /**
     * Medium accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    MIDDLE_ACCURACY: 0x02,

    /**
     * Low accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    LOW_ACCURACY: 0x04,

    /**
     * Loading current location
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    LOADING: 0x10,

    /**
     * AR GPS location detection turned OFF
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    DISABLE: 0x20,

    /**
     * OS GPS function is turned off
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    NOT_SUPPORTED: 0x40,

    /**
     * Get current location failed
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    FAILURE: 0x80
}

/**
 * Current device camera orientation status enumeration. Default Value represented as a hexadecimal number
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.CameraOrientationStatus = {
    /**
     * High accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    HIGH_ACCURACY: 0x01,

    /**
     * Medium accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    MIDDLE_ACCURACY: 0x02,

    /**
     * Low accuracy
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    LOW_ACCURACY: 0x04,

    /**
     * AR GPS location detection turned OFF
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    DISABLE: 0x20,

    /**
     * Get camera orientation is not supported by device
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    NOT_SUPPORTED: 0x40,

    /**
     * get camera orientation failed
     * @type number
     * @version AR Processing Server V1.1
     * @since AR Processing Server V1.1
     */
    FAILURE: 0x80
}


/**
 * Redar panel color enumeration.
 * @static
 * @enum {string}
 * @constructor
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.RadarColorMode = {
    /** 
	 * gray
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    GRAY: "Gray",

    /** 
	 * red
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    RED: "Red",

    /** 
	 * orange
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    ORANGE: "Orange",

    /**
	 * green
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    GREEN: "Green",

    /** 
	 * blue
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    BLUE: "Blue",

    /** 
	 * brown
	 * @type string
	 * @version AR Processing Server V1.1
	 * @since AR Processing Server V1.1
	 */
    BROWN: "Brown"
}

/**
 * Get current geolocation status. Status to be acquired is {@link AR.Geolocation.GeolocationStatus} as {number}.
 * @static
 * @param {Function} _onSuccess  Callback function called if get current geolocation was successful.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {number} A {number} from {@link AR.Geolocation.GeolocationStatus}
 *  </ul> 
 * @param {Function} _onError Callback function called if get current geolocation failed.
 * Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     alert("Geolocation Status : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.getGeolocationStatus(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.getGeolocationStatus = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#getGeolocationStatus.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#getGeolocationStatus.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
			AR.Native.FunctionName.GETGEOLOCATION_FUNCNAME, argValues, callback);
};


/**
 * Starts the native application geolocation information detection.
 * The callback function specified in _onSuccessListener is called if a geolocation information was detected or was missing.
 * A maximum of 10 geolocation detection event listeners can be registered.
 * @static 
 * @param {Function} _onSuccess Callback function called if geolocation detection event listener registration was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} ListenerId
 *  </ul>
 * @param {Function} _onError Callback function called if geolocation detection event listener registration failed. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an attempt was made to register 11 or more Geolocation detection event listeners:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @param {Function} _onSuccessListener Callback function called if the geolocation detection state was changed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Detection information
 *  </ul> 
 *    The detection information value is the following Object type:
 *  <ul>
 *    <li>latitude {number} Latitude
 *    <li>longitude {number} Longitude
 *    <li>altitude {number} Altitude
 *  </ul> 
 * @param {Function} _onErrorListner Callback function called if geolocation detection failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Listener ID : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * onSuccessListener = function(_result){
 *   alert("Latitude:" + _result.getValue().latitude + "\n" +
 *         "Longitude:"+_result.getValue().longitude + "\n" +
 *         "Altitude:" + _result.getValue().altitude);
 * };
 * 
 * onErrorListener = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.addGeolocationListener(onSuccess, onError, onSuccessListener, onErrorListener);
 * 
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.addGeolocationListener = function (_onSuccess, _onError, _onSuccessListener, _onErrorListener) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#addGeolocationListener.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#addGeolocationListener.");
    if (!AR.Util.checkType(_onSuccessListener, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type for geolocation listener", "function", "Geolocation#addGeolocationListener.");
    if (!AR.Util.checkType(_onErrorListener, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type for geolocation listener", "function", "Geolocation#addGeolocationListener.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var callbackListener = new Object();
    callbackListener.success = _onSuccessListener;
    callbackListener.error = _onErrorListener;
    callbackListener.release = false;

    var argValues = [];

    return AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.ADDGEOLOCATIONLISTENER_FUNCNAME, argValues, callback, callbackListener);
};


/**
 * Removes the geolocation information detection event listener.
 * @static
 * @param {string} _listenerId Event listener ID that you wish to delete. Specify between 0 and 256 characters.
 * @param {Function} _onSuccess Callback function called if a geolocation information detection event listener was successfully removed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if removal of an geolocation information detection event listener failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an unexpected exception occurs:</b>
 *   <li>status {string} "UNEXPECTED_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.removeGeolocationListener("geolocation123", onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.removeGeolocationListener = function (_listenerId, _onSuccess, _onError) {
    if (!AR.Util.checkType(_listenerId, 'string', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "ListenerId data type", "string", "Geolocation#removeGeolocationListener.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#removeGeolocationListener.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#removeGeolocationListener.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_listenerId];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
			AR.Native.FunctionName.REMOVEGEOLOCATIONLISTENER_FUNCNAME, argValues, callback);
};


/**
 * Get current location.
 * @static
 * @param {Function} _onSuccess Callback function called if get current location was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} location information object
 *  </ul> 
 *      A location information value is an Object type, with the following properties:
 *  <ul>
 *    <li>latitude {number} Latitude
 *    <li>longitude {number} Longitude
 *    <li>altitude {number} Altitude
 *  </ul> 
 * @param {Function} _onError  function called if get current location failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Latitude:" + _result.getValue().latitude + "\n" +
 *         "Longitude:" + _result.getValue().longitude + "\n" +
 *         "Altitude:" + _result.getValue().altitude);
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.getCurrentLocation(onSuccess, onError);
 * 
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.getCurrentLocation = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#getCurrentLocation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#getCurrentLocation.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.GETCURRENTLOCATION_FUNCNAME, argValues, callback);

};


/**
 * Set whether or not AR application to using fake location
 * @private
 * @static
 * @param {boolean} _useFake true: use fake location, false: do not use fake location.
 * @param {Function} _onSuccess Callback function called if set fake location usage was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set fake location usage failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.useFakeLocation(true, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.useFakeLocation = function (_useFake, _onSuccess, _onError) {
    if (!AR.Util.checkType(_useFake, 'boolean', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "UseFake data type", "boolean", "Geolocation#useFakeLocation.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#useFakeLocation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#useFakeLocation.");


    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;
    var argValues = [_useFake];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.USEFAKELOCATION_FUNCNAME, argValues, callback);

};


/**
 * Set fake location value
 * @private
 * @static
 * @param {number} latitude  Latitude value
 * @param {number} longitude Longitude value
 * @param {number} altitude Altitude value
 * @param {Function} _onSuccess Callback function called if set fake location value was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set fake location value failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var latitude = 35.680307;
 * var longitude  = 139.769238;
 * var altitude = 3.0;
 * 
 * AR.Geolocation.setFakeLocation(latitude, longitude, altitude, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.setFakeLocation = function (_latitude, _longitude, _altitude, _onSuccess, _onError) {
    if (!AR.Util.checkType(_latitude, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "Latitude data type", "number", "Geolocation#setFakeLocation.");
    if (!AR.Util.checkType(_longitude, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "longitude data type", "number", "Geolocation#setFakeLocation.");
    if (!AR.Util.checkType(_altitude, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "Altitude data type", "number", "Geolocation#setFakeLocation.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#setFakeLocation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#setFakeLocation.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_latitude, _longitude, _altitude];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.SETFAKELOCATION_FUNCNAME, argValues, callback);
};


/**
 * Set whether or not AR application should show the radar panel
 * @static
 * @param {boolean} _useRadar true: use radar panel縲’alse: do not use radar panel.
 * @param {Function} _onSuccess Callback function called if set use radar panel was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set use radar panel failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * var useRadar = true;
 *
 * AR.Geolocation.useRadar(useRadar, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.useRadar = function (_useRadar, _onSuccess, _onError) {
    if (!AR.Util.checkType(_useRadar, 'boolean', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "UseRadar data type", "boolean", "Geolocation#useRadar.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#useRadar.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#useRadar.");


    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;
    var argValues = [_useRadar];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.USERADAR_FUNCNAME, argValues, callback);

};


/**
 * Set radar panel display size and position
 * @static
 * @param {number} _centerX X Coordinate position
 * @param {number} _centerY Y Coordinate position
 * @param {number} _radius The size of the radar panel. The unit is in pixels. The minimum value of the Android version is 60 [dip]. The minimum value of the iOS version is 60 [pixel]. If the set value is less than minimum value, the minimum value will be set.
 * @param {Function} _onSuccess Callback function called if set radar panel layout was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set radar panel layout failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * adjustSize = function(_size) {
 *     //Android dip size transfer to pixel.
 *   if (navigator.userAgent.match(/(Android)/)) {
 *     return _size * window.devicePixelRatio;
 *   }
 *     //iOS pixel value.
 *   if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) {
 *     return _size;
 *   }
 *   return _size;
 * };
 *
 * var radarMargin = Math.floor(adjustSize(10));
 * var radarRadius = Math.floor(adjustSize(60));
 * var centerX = radarRadius + radarMargin;
 * var centerY = window.screen.height - radarRadius - (radarMargin * 6);
 * AR.Geolocation.setRadarLayout(centerX, centerY, radius, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.setRadarLayout = function (_centerX, _centerY, _radius, _onSuccess, _onError) {
    if (!AR.Util.checkType(_centerX, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "CenterX data type", "number", "Geolocation#setRadarLayout.");
    if (!AR.Util.checkType(_centerY, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "CenterY data type", "number", "Geolocation#setRadarLayout.");
    if (!AR.Util.checkType(_radius, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "Radius data type", "number", "Geolocation#setRadarLayout.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#setRadarLayout.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#setRadarLayout.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_centerX, _centerY, _radius];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.SETRADARLAYOUT_FUNCNAME, argValues, callback);
};

/**
 * Set radar panel display color. Avaliable color can be found {@link AR.Geolocation.RadarColorMode}.
 * @static
 * @param {string} _mode Color name from {@link AR.Geolocation.RadarColorMode}
 * @param {Function} _onSuccess Callback function called if set radar panel display color was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set radar panel display color failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var mode = AR.Geolocation.RadarColorMode.GRAY;
 * 
 * AR.Geolocation.setRadarColorMode(mode, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.setRadarColorMode = function (_mode, _onSuccess, _onError) {
    if (!AR.Util.checkType(_mode, 'string', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "ColorMode data type", "string", "Geolocation#setRadarColorMode.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#setRadarColorMode.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#setRadarColorMode.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_mode];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.SETRADARCOLORMODE_FUNCNAME, argValues, callback);
};


/**
 * Get the current object detect range. The unit is meters.
 * @static
 * @param {Function} _onSuccess Callback function called if get detect area was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Object detect range
 *  </ul> 
 *    Object detect range value is stored as {Object} type.
 *  <ul>
 *    <li>distance {number} Recognition maximum distance
 *  </ul> 
 * @param {Function} _onError function called if get detect area failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Recognition maximum distance:" + _result.getValue().distance);
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.getDetectArea(onSuccess, onError);
 * 
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.getDetectArea = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#getDetectArea.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#getDetectArea.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.GETDETECTAREA_FUNCNAME, argValues, callback);

};


/**
 * Set the object detect range. Must be between 50 and 200000. The unit is meters.
 * @static
 * @param {number} _distance Recognition maximum distance. the detect distance range is 50 ~ 200000 (200,000m). The unit is meters.
 * @param {Function} _onSuccess Callback function called if get detect area was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if get detect area failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var distance = 1000;
 * 
 * AR.Geolocation.setDetectArea(distance, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.setDetectArea = function (_distance, _onSuccess, _onError) {
    if (!AR.Util.checkType(_distance, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "MaxDistance data type", "number", "Geolocation#setDetectArea.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#setDetectArea.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#setDetectArea.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_distance];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.SETDETECTAREA_FUNCNAME, argValues, callback);
};


/**
 * Get camera orientation status. Returned status is represent as {number} from {@link AR.Geolocation.CameraOrientationStatus}.
 * @static
 * @param {Function} _onSuccess Callback function called if get camera orientation status was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {number} bitmap number from {@link AR.Geolocation.CameraOrientationStatus}
 *  </ul>
 * @param {Function} _onError function called if get camera orientation status failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *     alert("Camera orientation status : " + _result.getValue());
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Geolocation.getCameraOrientationStatus(onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.getCameraOrientationStatus = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#getCameraOrientationStatus.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#getCameraOrientationStatus.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
        AR.Native.FunctionName.GETCAMERAORIENTATIONSTATUS_FUNCNAME, argValues, callback);
};

/**
 * Get current camera orientation. The unit is radians. The returned value range is different on different devices.
 * @static
 * @param {Function} _onSuccess Callback function called if get camera orientation was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Orientation information
 *  </ul> 
 *    Orientation information value type is {Object} with following attributes.
 *  <ul>
 *    <li>pitch {number} Pitch value
 *    <li>azimuth {number} Azimuth value
 *    <li>roll {number} Roll value
 *  </ul> 
 * @param {Function} _onError function called if get camera orientation failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Pitch:" + _result.getValue().pitch + "\n" +
 *         "Azimuth:" + _result.getValue().azimuth + "\n" +
 *         "Roll:" + _result.getValue().roll);
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.getCameraOrientation(onSuccess, onError);
 * 
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.getCameraOrientation = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#getCameraOrientation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#getCameraOrientation.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.GETCAMERAORIENTATION_FUNCNAME, argValues, callback);

};


/**
 * Set whether or not to use fake orientation
 * @private
 * @static
 * @param {boolean} _useFake true: use fake orientation, false: do not use fake orientation
 * @param {Function} _onSuccess Callback function called if set use fake orientation was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set use fake orientation failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Geolocation.useFakeOrientation(useFake, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.useFakeOrientation = function (_useFake, _onSuccess, _onError) {
    if (!AR.Util.checkType(_useFake, 'boolean', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "UseFakeOrientation data type", "boolean", "Geolocation#useFakeOrientation.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#useFakeOrientation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#useFakeOrientation.");


    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;
    var argValues = [_useFake];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.USEFAKEORIENTATION_FUNCNAME, argValues, callback);

};


/**
 * Set camera fake orientation. The unit is radians.
 * @private
 * @static
 * @param {number} pitch Pitch value
 * @param {number} azimuth Azimuth value
 * @param {number} roll Roll value
 * @param {Function} _onSuccess Callback function called if set fake camera orientation was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError function called if set camera fake orientation failed.
 * Specify Function(AR.Native.Result). The argument passed when a native application fails is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * var pitch = 0;
 * var azimuth = 1.0;
 * var roll = 0.5;
 * 
 * AR.Geolocation.setFakeOrientation(pitch, azimuth, roll, onSuccess, onError);
 * @version AR Processing Server V1.1
 * @since AR Processing Server V1.1
 */
AR.Geolocation.setFakeOrientation = function (_x, _y, _z, _onSuccess, _onError) {
    if (!AR.Util.checkType(_x, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "X radians data type", "number", "Geolocation#setFakeOrientation.");
    if (!AR.Util.checkType(_y, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "Y radians data type", "number", "Geolocation#setFakeOrientation.");
    if (!AR.Util.checkType(_z, 'number', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "Z radians data type", "number", "Geolocation#setFakeOrientation.");
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnSuccess data type", "function", "Geolocation#setFakeOrientation.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.GEOLOCATION, 0, "OnError data type", "function", "Geolocation#setFakeOrientation.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [_x, _y, _z];

    AR.Native.callARNativeASync(AR.Native.HandleName.Geolocation,
		AR.Native.FunctionName.SETFAKEORIENTATION_FUNCNAME, argValues, callback);
};
/**
 * AR barcode library space.
 * @namespace AR.Barcode
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Barcode = {};

/**
 * Starts the barcode detection. The callback function specified in _onSuccessListener is called if a barcode was detected or was missing.
 * A maximum of 10 barcode detection event listeners can be registered.
 * @static 
 * @param {Function} _onSuccess Callback function called if barcode detection event listener registration was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} Listener ID
 *  </ul>
 * @param {Function} _onError Callback function called if barcode detection event listener registration failed. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an attempt was made to register 11 or more barcode detection event listeners:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @param {Function} _onSuccessListener Callback function called if the barcode detection state was changed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Detection information
 *  </ul> 
 *    The detection information value is the following Object type:
 *  <ul>
 *    <li>barcodeId {string} Barcode ID associated with barcode
 *    <li>status {boolean} true (detected), or false (missing)
 *  </ul> 
 * @param {Function} _onErrorListener Callback function called if barcode detection failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Listener ID : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * onSuccessListener = function(_result){
 *   if(_result.getValue().status == true){
 *     alert("Barcode"+_result.getValue().barcodeId + " was detected.");
 *   } else if(_result.getValue().status == false){
 *     alert("Barcode"+_result.getValue().barcodeId + " was missing.") ;
 *   }
 * };
 * 
 * onErrorListener = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Barcode.addBarcodeListener(onSuccess, onError, onSuccessListener, onErrorListener);
 * 
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Barcode.addBarcodeListener = function(_onSuccess, _onError, _onSuccessListener, _onErrorListener) {
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnSuccess data type", "function", "Barcode#addBarcodeListener.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnError data type", "function", "Barcode#addBarcodeListener.");
	if(!AR.Util.checkType(_onSuccessListener, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnSuccess data type for Barcode listener", "function", "Barcode#addBarcodeListener.");
	if(!AR.Util.checkType(_onErrorListener, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnError data type for Barcode listener", "function", "Barcode#addBarcodeListener.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var callbackListener = new Object();
	callbackListener.success = _onSuccessListener;
	callbackListener.error = _onErrorListener;
	callbackListener.release = false;
	
	var argValues = [];

	return AR.Native.callARNativeASync(AR.Native.HandleName.Barcode, 
		AR.Native.FunctionName.ADDBARCODELISTENER_FUNCNAME, argValues, callback, callbackListener);
};


/**
 * Removes the barcode detection event listener.
 * @static
 * @param {string} _listenerId Event listener ID that you wish to delete. Specify between 0 and 256 characters.
 * @param {Function} _onSuccess Callback function called if a barcode detection event listener was successfully removed. Specify Function(AR.Native.Result). 
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if removal of an AR barcode detection event listener failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an unexpected exception occurs:</b>
 *   <li>status {string} "UNEXPECTED_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Barcode.removeBarcodeListener("camera123", onSuccess, onError);
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Barcode.removeBarcodeListener = function(_listenerId, _onSuccess, _onError) {
	if(!AR.Util.checkType(_listenerId, 'string', false)) 
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "ListenerId data type", "string", "Barcode#removeBarcodeListener.");
	if(!AR.Util.checkType(_onSuccess, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnSuccess data type", "function", "Barcode#removeBarcodeListener.");
	if(!AR.Util.checkType(_onError, 'function', false))
		throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnError data type", "function", "Barcode#removeBarcodeListener.");
	
	var callback = new Object();
	callback.success = _onSuccess;
	callback.error = _onError;
	callback.release = true;
	
	var argValues = [_listenerId];
	
	AR.Native.callARNativeASync(AR.Native.HandleName.Barcode, 
			AR.Native.FunctionName.REMOVEBARCODELISTENER_FUNCNAME, argValues, callback);
};


/**
 * Gets the currently detected barcode ID and an array of rectangular frame-like shape (pixel) coordinates. Only one barcode will be detected at a time.
 * @static
 * @static
 * @param {Function} _onSuccess Callback function called if barcode information acquisition was successful. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Array.&lt;Object&gt;} Detection information
 *  </ul>
 *  A detection information value is an Object type array, with the following properties:
 *  <ul>
 *    <li>value {string} Barcode ID
 *    <li>rect {Object} Rectangular frame-like shape coordinates
 *  </ul>
 *    A rectangular frame-like shape rect is an Object type, with the following properties:
 *  <ul>
 *    <li>tl {Object} Barcode rectangular frame-like shape coordinates - top-left XY coordinate
 *    <li>tr {Object} Barcode rectangular frame-like shape coordinates - top-right XY coordinate
 *    <li>bl {Object} Barcode rectangular frame-like shape coordinates - bottom-left XY coordinate
 *    <li>br {Object} Barcode rectangular frame-like shape coordinates - bottom-right XY coordinate
 *  </ul>
 *    All XY coordinates (tl, tr, bl, and br) are Object types, with the following properties:
 *  <ul>
 *    <li>x {number} pixel coordinate value
 *    <li>y {number} pixel coordinate value
 *  </ul>
 * @param {Function} _onError Callback function called if barcode information acquisition failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var barcodes = _result.getValue();
 *   for(var i=0;i&ltbarcodes.length; i++){
 *     alert("Barcode "+ barcodes[i].value + "\n" +
 *           "{"+barcodes[i].rect.tl.x + "," + barcodes[i].rect.tl.y +"}," +
 *           "{"+barcodes[i].rect.tr.x + "," + barcodes[i].rect.tr.y +"}," +
 *           "{"+barcodes[i].rect.bl.x + "," + barcodes[i].rect.bl.y +"}," +
 *           "{"+barcodes[i].rect.br.x + "," + barcodes[i].rect.br.y +"}");
 *   }
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Barcode.getCurrentBarcodes(onSuccess, onError);
 *
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 */
AR.Barcode.getCurrentBarcodes = function(_onSuccess, _onError) {
    if(!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnSuccess data type", "function", "Barcode#getCurrentBarcodes.");
    if(!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BARCODE, 0, "OnError data type", "function", "Barcode#getCurrentBarcodes.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Barcode,
        AR.Native.FunctionName.GETCURRENTBARCODES_FUNCNAME, argValues, callback);
};/**
 * AR bluetooth library space.
 * @namespace AR.Bluetooth
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth = {};

/**
 * Bluetooth status enumeration. Default value is hexadecimal notation.
 * @static
 * @enum {number}
 * @constructor
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth.BluetoothStatus = {
    /**
     * Beacon scanner is running
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     * @supported Android
     */
    SCANNING: 0x01,

    /**
     * Beacon detect mode is not turned on (AR Client setting)
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     * @supported Android
     */
    DISABLE: 0x02,

    /**
     * Bluetooth is not turned on (OS setting).
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     * @supported Android
     */
    NOT_SUPPORTED: 0x04,

    /**
     * OS or Device does not have Bluetooth LE functionality
     * @type number
     * @version AR Processing Server V1.1.1
     * @since AR Processing Server V1.1.1
     * @supported Android
     */
    BLE_NOT_AVAILABLE: 0x08
}

/**
 * Starts the region detection. The callback function specified in _onSuccessListener is called if a region was detected or was missing.
 * A maximum of 10 region detection event listeners can be registered.
 * @static 
 * @param {Function} _onSuccess Callback function called if region detection event listener registration was successful. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {string} Listener ID
 *  </ul>
 * @param {Function} _onError Callback function called if region detection event listener registration failed. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an attempt was made to register 11 or more region detection event listeners:</b>
 *   <li>status {string} "INVALID_OPERATION_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @param {Function} _onSuccessListener Callback function called if the region detection state was changed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} Detection information
 *  </ul>
 *    The detection information value is the following Object type:
 *  <ul>
 *    <li>status {boolean} true (detected), or false (missing)
 *    <li>uuid {string} UUID(Fomat is the hexadecimal notation in the case of 16-bit and 32 bit format. add the '-' in the case of 128-bit format. For example:123e4567-e89b-12d3-a456-426655440000)
 *  </ul>
 * @param {Function} _onErrorListner Callback function called if region detection failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Listener ID : " + _result.getValue());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * onSuccessListener = function(_result){
 *   alert("Beacon with UUID "+ _result.getValue().uuid);
 * };
 * 
 * onErrorListener = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Bluetooth.addRegionListener(onSuccess, onError, onSuccessListener, onErrorListener);
 * 
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth.addRegionListener = function ( _onSuccess, _onError, _onSuccessListener, _onErrorListener ) {
    if ( !AR.Util.checkType( _onSuccess, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onSuccess", "function", "Bluetooth#addRegionListener." )
    }
    if ( !AR.Util.checkType( _onError, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onError", "function", "Bluetooth#addRegionListener." )
    }
    if ( !AR.Util.checkType( _onSuccessListener, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onSuccess for beacon listener", "function", "Bluetooth#addRegionListener." )
    }
    if ( !AR.Util.checkType( _onErrorListener, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onError for beacon listener", "function", "Bluetooth#addRegionListener." )
    }
    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;
    var callbackListener = new Object();
    callbackListener.success = _onSuccessListener;
    callbackListener.error = _onErrorListener;
    callbackListener.release = false;
    var argValues = [];
    return AR.Native.callARNativeASync( AR.Native.HandleName.Bluetooth, AR.Native.FunctionName.ADDREGIONLISTENER_FUNCNAME, argValues, callback, callbackListener )
};

/**
 * Removes the region detection event listener.
 * @static
 * @param {string} _listenerId Event listener ID that the user wishes delete. Specify between 0 and 256 characters.
 * @param {Function} _onSuccess Callback function called if a region detection event listener was successfully removed. Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Object} null
 *  </ul> 
 * @param {Function} _onError Callback function called if removal of a region detection event listener failed.
 * Specify Function(AR.Native.Result). The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * <ul>
 *   <b>When an unexpected exception occurs:</b>
 *   <li>status {string} "UNEXPECTED_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error} 
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert(_result.getStatus());
 * };
 * 
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 * 
 * AR.Bluetooth.removeRegionListener("bluetooth123", onSuccess, onError);
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth.removeRegionListener = function ( _listenerId, _onSuccess, _onError ) {
    if ( !AR.Util.checkType( _listenerId, "string", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of listenerId", "string", "Bluetooth#removeRegionListener." )
    }
    if ( !AR.Util.checkType( _onSuccess, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onSuccess", "function", "Bluetooth#removeRegionListener." )
    }
    if ( !AR.Util.checkType( _onError, "function", false ) ) {
        throw AR.Error.createInvalidParameterError( null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "The data type of onError", "function", "Bluetooth#removeRegionListener." )
    }
    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;
    var argValues = [_listenerId];
    AR.Native.callARNativeASync( AR.Native.HandleName.Bluetooth, AR.Native.FunctionName.REMOVEREGIONLISTENER_FUNCNAME, argValues, callback )
};

/**
 * Bluetooth get current Bluetooth status{@link AR.Bluetooth.BluetoothStatus}16 byte number
 * @static
 * @param {Function} _onSuccess Callback function called if get bluetooth status was successful.
 * Specify Function(AR.Native.Result).
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {number} {@link AR.Bluetooth.BluetoothStatus}0xFF{number}
 *  </ul>
 * @param {Function} _onError Callback function called if get bluetooth status failed.
 * Function(AR.Native.Result) The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   alert("Status : " + _result.getValue());
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Bluetooth.getBluetoothStatus(onSuccess, onError);
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth.getBluetoothStatus = function (_onSuccess, _onError) {
    if (!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "OnSuccess data type", "function", "Bluetooth#getBluetoothStatus.");
    if (!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "OnError data type", "function", "Bluetooth#getBluetoothStatus.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Bluetooth,
        AR.Native.FunctionName.GETBLUETOOTHSTATUS_FUNCNAME, argValues, callback);
};

/**
 *  Gets the currently detected regions list.
 * @static
 * @param {Function} _onSuccess Callback function called if region information acquisition was successful. Specify Function(AR.Native.Result) as the callback function.
 * The argument passed from a native application upon successful completion is the following {@link AR.Native.Result}:
 *  <ul>
 *    <li>status {string} "OK"
 *    <li>value {Array.&lt;Object&gt;} Detection region information
 *  </ul>
 *  A detection information value is an Object type array, with the following properties:
 *  <ul>
 *    <li>uuid {string} UUID(Fomat is the hexadecimal notation in the case of 16-bit and 32 bit format. add the '-' in the case of 128-bit format. For example:123e4567-e89b-12d3-a456-426655440000)
 *    <li>beacons {Array.&lt;Object&gt;} Beacon information
 *  </ul>
 *    Beacon information is a object with following properties:
 *  <ul>
 *    <li>data {string} Beacon detail data (Advertisement packet)
 *    <li>rssi {number} Beacon received signal strength
 *  </ul>
 * @param {Function} _onError Callback function called if get current detected regions failed.
 * Function(AR.Native.Result) The argument passed from a native application upon failure is the following {@link AR.Native.Result}:
 * <ul>
 *   <b>When a parameter error occurs in a native application:</b>
 *   <li>status {string} "INVALID_PARAMETER_EXCEPTION"
 *   <li>value {string} Error message
 * </ul>
 * @throws {Error}
 *  <ul>
 *    <li>InvalidParameterError: When the argument is not the expected type, or is null/undefined
 *    <li>UnexpectedError: When generation of a request to a native application fails
 *    <li>InvalidStateError: When a native application call fails
 *  </ul>
 * @example
 * onSuccess = function(_result){
 *   var uuids = _result.getValue();
 *   for(var i=0; i&ltuuids.length; i++){
 *     var beaconList = "UUID: "+ uuids[i].uuid + "\n";
 *     var beacons = uuids[i].beacons;
 *     for (var j=0; j&ltbeacons.length; j++) {
 *          beaconList +=   uuids[i].beacons[j].data + " : " + uuids[i].beacons[j].rssi + "\n";
 *     }
 *     alert(beaconList);
 *   }
 * };
 *
 * onError = function(_result){
 *   alert(_result.getStatus() + "\n" + _result.getValue());
 * };
 *
 * AR.Bluetooth.getCurrentRegions(onSuccess, onError);
 *
 * @version AR Processing Server V1.1.1
 * @since AR Processing Server V1.1.1
 * @supported Android
 */
AR.Bluetooth.getCurrentRegions = function(_onSuccess, _onError) {
    if(!AR.Util.checkType(_onSuccess, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "OnSuccess data type", "function", "Bluetooth#getCurrentRegions.");
    if(!AR.Util.checkType(_onError, 'function', false))
        throw AR.Error.createInvalidParameterError(null, AR.Error.SubcomponentCode.BLUETOOTH, 0, "OnError data type", "function", "Bluetooth#getCurrentRegions.");

    var callback = new Object();
    callback.success = _onSuccess;
    callback.error = _onError;
    callback.release = true;

    var argValues = [];

    AR.Native.callARNativeASync(AR.Native.HandleName.Bluetooth,
        AR.Native.FunctionName.GETCURRENTREGIONS_FUNCNAME, argValues, callback);
};
