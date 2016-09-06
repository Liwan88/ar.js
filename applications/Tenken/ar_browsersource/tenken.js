/**
 * @overview JavaScript API (Core & Utilities) for Tenken Application
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * Name Space for Tenken Application
 */
var Tenken = {};

/*********************************************************/
/* Environment parameters
/* Configure following parameters to match the environment
/*********************************************************/

Tenken.config = {};

/* Scenario ID */
/* Scenario ID that is selected at Scenario selection screen */
Tenken.config.ScenarioId = 0;

/* Force reload mode */
/* Value to determine AR.Data.getArServerDataの_isSuperReload */
/*   true : Force reload                                */
/*   false: Do not force reload                                        */
Tenken.config.SuperReload=true;

/* Interval time to check data obtained from server */
/* in Milliseconds                                        */
Tenken.config.getIntervalTime=500;

/* Pararell download count of data from the server */
/* Application might terminate due to system resource error if large number is specified */
Tenken.config.DownloadStep = 20;

/* Log Level */
/* 0:ERROR  1:WARNING  2:INFO  3:DEBUG */
Tenken.config.loglevel = 2;

/* Log message prefix */
Tenken.config.log_prefix = "AR_Tenken:";

/* Log message number */
/* If errno, and log message number is already specified in the message, log will output that number instead of this */
Tenken.config.log_no_trace   = 1000;
Tenken.config.log_no_info    = 2000;
Tenken.config.log_no_warning = 3000;
Tenken.config.log_no_debug   = 4000;
Tenken.config.log_no_error   = 5000;

/* Skip if the last check data is set as STOP */
/*   true: Only use the result that was in START state */
/*   false: Use result that was in STOP state */
Tenken.config.skipStopLastData = true;

/* Send check data to server even if not all check items are not filled */
/*   false: Do not send data if all check items are not set */
/*   true: Can send data although all check items are not set */
Tenken.config.noinputsubmit = false;

/* Display send(submit) button even if not all check items are not filled */
/*   false: Do not show submit button */
/*   true: Show submit button */
Tenken.config.noinputsubmitcheckbox = true;

/* Flag to pre-download AR overlay data from the server */
/*   true = Pre-download data from the server */
/*   false = Do not pre-download from the server */
Tenken.config.preloadFile = true;

/* Flat to pre-download URL assigned to icons on equipments table */
/*   true = Perform pre-download from the server */
/*   false = Do not pre-download from the server */
Tenken.config.preloadAssetFile = true;

/*********************************************************/
/*********************************************************/

/**
 * Trace events to the AR service.
 * @param {String} _user user name
 * @param {Tenken.traceEvent.Type} _type event type
 * @param {Number} _markerid marker.id
 * @param {String} _poiid poi.id
 * @param {Object} _details detail object
 */
Tenken.traceEvent = function(_user, _type, _markerid, _poiid, _details) {
	var obj = (null == _details) ? new Object() : _details;
	if(null != _markerid) obj.markerid = _markerid;
	if(null != _poiid) obj.poiid = _poiid;
	Tenken.Util.TraceToSystem(_user, _type, obj);
};
/**
 * Enum of event types to the AR service
 */
Tenken.traceEvent.Type = {
	SCENARIO_SHOW : "JS_SCENARIO_SHOW",
	SCENARIO_PREDOWNLOAD : "JS_SCENARIO_PREDOWNLOAD",
	SCENARIO_START : "JS_SCENARIO_START",
	TENKEN_SHOW : "JS_TENKEN_SHOW",
	TENKEN_PREDOWNLOAD : "JS_TENKEN_PREDOWNLOAD",
	TENKEN_START : "JS_TENKEN_START",
	TENKEN_CONTINUESTART : "JS_TENKEN_CONTINUESTART",
	MAIN_SHOW : "JS_MAIN_SHOW",
	AR_SHOW : "JS_AR_SHOW",
	AR_MENU_SUBMIT : "JS_AR_MENU_SUBMIT",
	AR_MENU_CHECKLIST : "JS_AR_MENU_CHECKLIST",
	AR_MENU_MESSAGELIST : "JS_AR_MENU_MESSAGELIST",
	AR_MSG_INPUT : "JS_AR_MSG_INPUT",
	AR_MSG_COMPLETE : "JS_AR_MSG_COMPLETE",
	AR_STOPPREVIEW : "JS_AR_STOPPREVIEW",
	AR_TAPARGRAPHIC : "JS_AR_TAPARGRAPHIC",
	SUMMARY_SHOW : "JS_SUMMARY_SHOW",
	SUMMARY_MANUAL : "JS_SUMMARY_MANUAL",
	SUMMARY_MAINTENANCEDOC : "JS_SUMMARY_MAINTENANCEDOC",
	SUMMARY_STOCKLIST : "JS_SUMMARY_STOCKLIST",
	SUMMARY_MAINTENANCEGRAPH : "JS_SUMMARY_MAINTENANCEGRAPH",
	SUMMARY_CHECKLIST : "JS_SUMMARY_CHECKLIST",
	SUMMARY_ADDMESSAGE : "JS_SUMMARY_ADDMESSAGE",
	SUMMARY_ICON : "JS_SUMMARY_ICON",
	SUBMIT_SHOW : "JS_SUBMIT_SHOW",
	SUBMIT_SUBMIT : "JS_SUBMIT_SUBMIT",
	SUBMIT_SUBMIT_SELECT : "JS_SUBMIT_SUBMIT_SELECT",
	SUBMIT_ALL_SELECT : "JS_SUBMIT_ALL_SELECT",
	SUBMIT_ALL_RELEASE : "JS_SUBMIT_ALL_RELEASE",
	CHECKLIST_SHOW : "JS_CHECKLIST_SHOW",
	CHECKLIST_CLEAR_ALL : "JS_CHECKLIST_CLEAR_ALL",
	CHECKLIST_CLEAR : "JS_CHECKLIST_CLEAR",
	MESSAGELIST_SHOW : "JS_MESSAGELIST_SHOW",
	MESSAGELIST_INPUT_MSG : "JS_MESSAGELIST_INPUT_MSG",
	MESSAGELIST_INPUT_REG : "JS_MESSAGELIST_INPUT_REG",
	MESSAGELIST_INPUT_CANCEL : "JS_MESSAGELIST_INPUT_CANCEL",
	ADDMESSAGE_SHOW : "JS_ADDMESSAGE_SHOW"
};
/**
 * Trace click actions using data-ar-eventtype attribute in HTML.
 * @param {String} _user user name
 * @param {Object} _target element that is the target of click event
 */
Tenken.traceEvent.traceButtonEvent = function(_user, _target) {
	var tmpType = Tenken.traceEvent._getEventType(_target);
	if(null == tmpType) return;
	var type = Tenken.traceEvent.Type[tmpType];
	if(null != type) Tenken.traceEvent(_user, type, null, null, null);
};
/**
 * Return attribute value of selected element and it's parent element
 * @param {Object} _target element that is the target of click event
 * @return data-ar-eventtype attriblute value. null in case value is not set
 */
Tenken.traceEvent._getEventType = function(_target) {
	var type = null;
	var elm = _target;
	while(null != elm) {
		type = elm.getAttribute("data-ar-eventtype");
		if(null != type)
			return type;
		else
			elm = elm.parentElement;
	}
	return null;
};


/**
 * Class inheritance
 * @param _cls class
 * @param _scls parent class
 */
Tenken.inherit = function(_cls, _scls){
	_cls.prototype = new _scls();
	_cls.prototype.constructor = _cls;
};


/**
 * Return value with 0 (zero) padding
 * @param _baseZero "00" to padd with 2 digits
 * @param _num number to pad. number must be positive integer
 */
Tenken.paddingZero = function(_baseZero, _num) {
	var tmp = _baseZero + _num;
	return tmp.substring(tmp.length - _baseZero.length);
};


/**
 * Add arrays and return result
 * @param {Array} _arrayTo Target Array to be added. Value will be changed.
 * @param {Array} _arrayFrom Array to add
 * @param {Boolean} _unshift true to add to the head, false to the bottom of the array
 * @return {Array} modified _arrayTo
 */
Tenken.putEach = function(_arrayTo, _arrayFrom, _unshift) {
	if((null == _arrayFrom) || (0 == _arrayFrom.length)) return _arrayTo;
	if(null == _arrayTo) _arrayTo = [];
	for(var i = 0; i < _arrayFrom.length; i++) _arrayTo[_unshift ? "unshift" : "push"](_arrayFrom[i]);
	return _arrayTo;
}


/**
 * Object to hold string values that can be displayed.
 * @param _value Original value
 * @param _stringValue Value to be displayed. If null, original value will be used to display.
 */
Tenken.StringableValue = function(_value, _stringValue) {
	this._value = _value;
	this._stringValue = _stringValue;
};
/**
 * Return value.
 * @return value
 */
Tenken.StringableValue.prototype.getValue = function() { return this._value; };
/**
 * Return string to be displayed
 * @return string to be displayed
 */
Tenken.StringableValue.prototype.toString = function() { return (null == this._stringValue) ? this._value : this._stringValue; };
/**
 * Set value and string to be displayed
 * @param _value value
 * @param _stringValue string to be displayed
 */
Tenken.StringableValue.prototype.setValueAndStringValue = function(_value, _stringValue) { this._value = _value; this._stringValue = _stringValue; };


/**
 * Date and Time Object
 */
Tenken.DatetimeValue = function(_value) {
	Tenken.StringableValue.call(this, _value);
	this._date = (function(){ var d = new Date(); d.setTime(_value); return d; })();
};
Tenken.inherit(Tenken.DatetimeValue, Tenken.StringableValue);
/**
 * Return as "yyyy/mm/dd hh:mm" string to display
 * @extends Tenken.StringableValue.prototype.toString()
 */
Tenken.DatetimeValue.prototype.toString = function() {
	return Tenken.paddingZero("0000", this._date.getFullYear()) + "/" +
		Tenken.paddingZero("00", (this._date.getMonth() + 1)) + "/" +
		Tenken.paddingZero("00", this._date.getDate()) + "(" +
		Tenken.DatetimeValue._DAYLABELS[this._date.getDay()] + ") " +
		Tenken.paddingZero("00", this._date.getHours()) + ":" +
		Tenken.paddingZero("00", this._date.getMinutes());
};
Tenken.DatetimeValue._DAYLABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Return as "yyyy/mm/dd hh:mm:ss" string to display
*/
Tenken.DatetimeValue.prototype.toStringFullTime = function() {
	return Tenken.paddingZero("0000", this._date.getFullYear()) + "/" +
		Tenken.paddingZero("00", (this._date.getMonth() + 1)) + "/" +
		Tenken.paddingZero("00", this._date.getDate()) + " " +
		Tenken.paddingZero("00", this._date.getHours()) + ":" +
		Tenken.paddingZero("00", this._date.getMinutes()) + ":" +
		Tenken.paddingZero("00", this._date.getSeconds());
};

Tenken.DatetimeValue.prototype.parseDatetime = function(_strDatetime)
{
	if ( null == _strDatetime )
	{
		return null;
	}
	return Date.parse(_strDatetime);
}

// Determine if value is number or string representing numbers
// true: number or string representing numbers
// false: not a number or string representining numbers
Tenken.isNumber = function(_value)
{
	if(("number" != typeof(_value)) && ("string" != typeof(_value))) return false;

    return (_value == parseFloat(_value) && isFinite(_value));
}



/* =======================================================================*/
/* Utility                                                         */
/* =======================================================================*/
Tenken.Util = {};

/** Callback method that do nothing */
Tenken.Util.noop = function(_result){};

/** Export information log */
Tenken.Util.loginfo = function(_message, _detail){
	if(_message == null) return;
	if ( null == Tenken.config.loglevel || Tenken.config.loglevel < 2 ) return;
	var message = Tenken.config.log_prefix + _message.toString();
	//log message + detail
	if(_detail) message += ":" + _detail;

	try{
		AR.Log.log(AR.Log.LevelType.INFO, Tenken.config.log_no_info, message, Tenken.Util.noop, Tenken.Util.noop);
	} catch(e){
		alert("Error occured while writing to log"+e);
	}
};

/** Warning */
Tenken.Util.logwarning = function(_message, _detail){
	if(_message == null) return;
	if ( null == Tenken.config.loglevel || Tenken.config.loglevel < 1 ) return;
	var message = Tenken.config.log_prefix + _message.toString();
	//log message + detail
	if(_detail) message += ":" + _detail;

	try{
		AR.Log.log(AR.Log.LevelType.WARNING, Tenken.config.log_no_warning, message, Tenken.Util.noop, Tenken.Util.noop);
	} catch(e){
		alert("Error occured while writing to log"+e);
	}
};

/** Debug */
Tenken.Util.logdebug = function(_message, _detail){
	if(_message == null) return;
	if ( null == Tenken.config.loglevel || Tenken.config.loglevel < 3 ) return;
	var message = Tenken.config.log_prefix + _message.toString();
	//log message + detail
	if(_detail) message += ":" + _detail;

	try{
		AR.Log.log(AR.Log.LevelType.INFO, Tenken.config.log_no_debug, message, Tenken.Util.noop, Tenken.Util.noop);
	} catch(e){
		alert("Error occured while writing to log"+e);
	}
};

/** Error */
Tenken.Util.logerr = function(_message, _detail){
	if(_message == null) return;
	var code = Tenken.config.log_no_error;
	var message;
;

	if(_message instanceof Error){
		if(typeof _message.code == 'number') code = _message.code;
		message = Tenken.config.log_prefix + _message.componentName == null ? _message.toString() : _message.componentName + " : " + _message.toString();
		if(_message.cause != null) message += " Cause : "+_message.cause;
	} else message = Tenken.config.log_prefix + _message.toString(); //それ以外の場合

	//log message + detail
	if(_detail) message += ":" + _detail;
	try{
		AR.Log.log(AR.Log.LevelType.ERROR, code,message,Tenken.Util.noop, Tenken.Util.noop);
	} catch(e){
		alert("Error occured while writing to log"+e);
	}
};

/** Callback method for Trace log's onError */
Tenken.Util.traceError = function(_result){
	alert("Error occured while writing trace information\n" + result.getStatus() + "\n"+ _result.getValue());
};


Tenken.Util.TraceToSystem = function(_user, _type, obj)
{
	var message=Tenken.config.log_prefix;

	if ( _user )
	{
		message += "User =[" + _user + "]";
	}
	if ( _type )
	{
		message += "Type =[" + _type + "]";
	}
	if ( obj )
	{
		message += "Obj =[" + obj + "]";
	}
		AR.Log.log(AR.Log.LevelType.INFO, Tenken.config.log_no_trace,message,Tenken.Util.noop, Tenken.Util.traceError);
};

/**
 * Callback method for onError when starting native camera device
 */
Tenken.Util.startCameraViewError = function(_result){
	var message = "ネイティブカメラの起動に失敗しました。";
	var detail = _result.getStatus() + ":"+ _result.getValue();
	Tenken.Util.logerr(message, detail);
};

/**
 * Callback method for onError when stopping native camera device
 */
Tenken.Util.stopCameraViewError = function(_result){
	var message = "ネイティブカメラの停止に失敗しました。";
	var detail = _result.getStatus() + ":"+ _result.getValue();
	Tenken.Util.logerr(message, detail);
};

Tenken.Util.startCameraView = function()
{
	AR.Camera.startCameraView(Tenken.Util.noop, Tenken.Util.startCameraViewError);
};

Tenken.Util.stopCameraView = function()
{
	AR.Camera.stopCameraView(Tenken.Util.noop, Tenken.Util.stopCameraViewError);
};

/** Listener ID registered for detecting AR markers **/
Tenken.Util.listenerId = "";

/**
 * Callback method for onSuccess when registering AR markers
 */
Tenken.Util.addMarkerListenerSuccess = function(_result){
	// Set Listener ID to Tenken.Util.listenerId. This will be used to delete marker detection event listener.
	Tenken.Util.listenerId = _result.getValue();
};

/**
 * Callback method for onError when registering AR markers
 */
Tenken.Util.addMarkerListenerError = function(_result){
	var message ="Failed to register marker detection event listener";
	var detail = _result.getStatus() + ":"+ _result.getValue();
	Tenken.Util.logerr(message, detail);
};

Tenken.Util.addMarkerListener = function(_onDetectMarker)
{
	// Add event listener to detect markers
	try
	{
		AR.Camera.addMarkerListener( Tenken.Util.addMarkerListenerSuccess, Tenken.Util.addMarkerListenerError, _onDetectMarker, Tenken.Util.noop);
	}
	catch(e){
		Tenken.Util.logerr(e);
	}
};

/**
 * Callback method when removing AR markers event listener was a success
 */
Tenken.Util.removeMarkerListenerSuccess = function(_result){
	Tenken.Util.listenerId = "";
};

/**
 * Callback method for onError when removing AR markers event listener
 */
Tenken.Util.removeMarkerListenerError = function(){
	var message = "マーカー検知のイベントリスナ削除に失敗しました。\n";
	var detail = _result.getStatus() + ":"+ _result.getValue();
	Tenken.Util.logerr(message, detail);
};

Tenken.Util.removeMarkerListener = function()
{
	// Remove event listerner
	try{
		AR.Camera.removeMarkerListener(Tenken.Util.listenerId, Tenken.Util.removeMarkerListenerSuccess , Tenken.Util.removeMarkerListenerError);
	} catch (e){
		Tenken.Util.logerr(e);
	}
}

/** Set operation mode */
Tenken.Util.getOperationModeSuccess = function(_result)
{
	// Set operation mode
	var operationMode = _result.getValue();
	Tenken.Storage.OperationMode.set(operationMode);
};

/**
 * Callback method for onError when obtaining operation mode
 */

Tenken.Util.getOperationModeError = function(_result)
{
	var message = "動作モードの取得に失敗しました。\n";
	var detail = _result.getStatus() + ":"+ _result.getValue();

	Tenken.Util.logerr(message, detail);
};

/** Obtain operation mode */
Tenken.Util.getOperationMode = function(_funcSuccess, _funcError)
{
	try{
		Tenken.Storage.OperationMode.remove();
		// Save if callbacks on success and error is specified.
		// If nothing is specified, set default callback methods 
		if ( null != _funcSuccess )
		{
			var funcSuccess=_funcSuccess;
		}
		else
		{
			var funcSuccess=Tenken.Util.getOperationModeSuccess;
		}
		if ( null != _funcError )
		{
			var funcError=_funcError;
		}
		else
		{
			var funcError=Tenken.Util.getOperationModeError;
		}
		AR.OS.getOperationMode(funcSuccess, funcError);
	} catch (e){
		Tenken.Util.logerr(e);
	}
}

Tenken.Toggle = {};

Tenken.Toggle.AbstractType = function(_array) {
	this.array = _array;
};

Tenken.Toggle.AbstractValueType = function(_array) {
	Tenken.Toggle.AbstractType.call(this, _array);
};
AR.Util.inherit(Tenken.Toggle.AbstractValueType, Tenken.Toggle.AbstractType);
Tenken.Toggle.AbstractValueType.prototype.parse = function(_str) {
	return _str;
};

Tenken.Toggle.EnumType = function(_array, _enums) {
	Tenken.Toggle.AbstractValueType.call(this, _array);
	this.enums = _enums;
};
AR.Util.inherit(Tenken.Toggle.EnumType, Tenken.Toggle.AbstractValueType);

Tenken.Toggle.EnumType.prototype.parse = function(_str) {
	for(var i = 0; i < this.enums.length; i++) if(_str == this.enums[i]) return this.enums[i];
	return null;
};


Tenken.Toggle.WEATHERTYPE = new Tenken.Toggle.EnumType(false, ["Fine", "Cloudy", "Rain", "Snow"]);
Tenken.Toggle.ASSETSTATUSTYPE = new Tenken.Toggle.EnumType(false, ["START", "STOP"]);
Tenken.Toggle.OKNGTYPE = new Tenken.Toggle.EnumType(false, ["OK", "NG"]);
Tenken.Toggle.MARUBATSUTYPE = new Tenken.Toggle.EnumType(false, ["○", "×"]);



