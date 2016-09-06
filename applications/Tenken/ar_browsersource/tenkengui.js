/**
 * @overview JavaScript API (GUI parts) for Tenken Application
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * Library's namespace for GUI.
 */
Tenken.GUI = {};

// Flag to define upload is in progress.
Tenken.GUI.Uploading = false;

Tenken.GUI.UploadingSelectMode = false;
Tenken.GUI.UploadingSelectTenken = false;
Tenken.GUI.UploadingSelectMsg = false;

// Region to display only the check results for selected marker
Tenken.GUI.selectMarker = [];

// Selection table list used when sending results (Checklist)
Tenken.GUI.submitAssetLists = null;

// Flag to define if there is messages when sending results
Tenken.GUI.submitMsgFlag = false;

//Tenken.GUI.Scene_main    = 1; // Main: Show messages
// Define string to show inside scene window (dummy default message)
Tenken.GUI.Scenes=[
  {"sceneid":0, "name":"Change scenes", "dispMSG":false, "dispASSET":false},
  {"sceneid":1, "name":"Main", "dispMSG":false, "dispASSET":false}
  ];

Tenken.GUI.selectScene = 1;  // Selected scene ID. 1 is the default dummy value.

/**
 * Class for checklist values
 * @param _name checklist name (Tenken name)
 * @param _datetime Check DateTime
 * @param _operator Check operator
 */
Tenken.GUI.TenkenValue = function(_name, _datetime, _operator) {
	this.name = _name;
	this.datetime = _datetime;
	this.operator = _operator;
};

// End check process.
// Clear Storage and data to return to initial page.
Tenken.GUI.FinishTenkenGoTop = function()
{
	Tenken.Storage.clear();

	// Clear current check results
	TenkenData.TenkenEvent.clearCurrentTenkenEvent();

	// Clear current messages
	TenkenData.MsgEvent.clearCurrentMsgEvent();

	AR.Data.clearResourceStorage(Tenken.Util.noop, Tenken.Util.noop);

	location.replace(TenkenConst.PageName.top);
}

// Process after upload completed successfully
Tenken.GUI.AfterUpload = function()
{
	try
	{
		Tenken.GUI.Uploading = false;

		// Separate process from bundled send and seleted send.
		if ( true == Tenken.GUI.UploadingSelectMode )
		{
			if (true == Tenken.GUI.UploadingSelectTenken ||
				true == Tenken.GUI.UploadingSelectMsg )
			{
				// Continue as sending is in progress.
				return;
			}

			alert("Data was uploaded.");

			// Do not return to initial screen and continue process only when sending selected Marker ID.

			// Delete check result values (display set value and POI) of target table to send.
			for ( assetid in Tenken.GUI.submitAssetLists )
			{
				var tableid = TenkenData.TenkenTable.getTableIdFromAssetId(assetid);
				if ( tableid )
				{
					// Clear current value of checklist
					Tenken.GUI.ChecklistPage.clearTable(tableid, null, false);

					// Clear current value of check results
					TenkenData.TenkenEvent.resetCurrentTenkenEventTableTableId(tableid);

				}

			}

			// Save check results that have been sent.
			TenkenData.TenkenEvent.saveStorage();

			Tenken.GUI.submitAssetLists=null;

			// If messages are sent, clear the current messages that have been sent.
			if ( true == Tenken.GUI.submitMsgFlag )
			{
				TenkenData.MsgEvent.moveCurrentDataToLastData();
				Tenken.GUI.submitMsgFlag = false;
			}

			// Reload overlay data (remove messages that has been reported as complete)
			Tenken.GUI.setARcontents(Tenken.GUI.selectScene, true);

			Tenken.GUI.Uploading = false;

			Tenken.GUI.Page.changePage(0);
		}
		else
		{
			Tenken.GUI.UploadingSelectMode=false;
			alert("Finished uploading data.\n\nReturning to initial screen.");

			Tenken.GUI.FinishTenkenGoTop();
		}
	}
	catch (e)
	{
		alert("exception : Tenken.GUI.AfterUpload \n" + e);
	}
}

/**
 * Send current check results to server.
 * @return true when sending success. false otherwise.
 */
Tenken.GUI.TenkenValue.prototype.submit = function(_submitall)
{
	if ( true == Tenken.GUI.Uploading )
	{
		alert("Sending results.");
		return;
	}

	Tenken.GUI.Uploading = true;
	Tenken.GUI.submitMsgFlag = false;

	// Send check results
	TenkenData.TenkenEvent.submitTenkenEvent(null, _submitall, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 1);

};

// Called when send succedded (common for check result, messages, and completion report)
Tenken.GUI.onPostSuccess = function(_value)
{
	var finFlag=false;

	switch ( _value )
	{
	case 1:
		// Send messages as sending check result ended.
		// Send messages.
		Tenken.GUI.UploadingSelectTenken = false;
		Tenken.GUI.SubmitPage.submitMsg();
		break;
	case 2:
		// Send completion report as sending messages ended.
		Tenken.GUI.UploadingSelectMsg = false;
		TenkenData.MsgEvent.completeMsg(Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 3);
		break;
	case 3:
		// Delete old completion report.
		TenkenData.MsgEvent.deleteMsgEvent(Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 4);
		break;
	case 4:
		// Finished sending all data.
		finFlag=true;
		break;
	}

	if ( true == finFlag )
	{
		Tenken.GUI.AfterUpload();
	}
}

// Called when send failed (common for check result, messages, and completion report)
Tenken.GUI.onPostError = function(_value)
{
// Do not show here as duplicate error messages will be displayed
//	switch ( _value )
//	{
//	case 1:
//		alert("Failed to upload data (Check results)");
//		break;
//	case 2:
//		alert("Failed to upload data (Messages)");
//		break;
//	case 3:
//	case 4:
//		alert("Failed to upload data (Completion report)");
//		break;
//	}
	Tenken.GUI.Uploading = false;
	Tenken.GUI.UploadingSelectMode=false;
	Tenken.GUI.UploadingSelectTenken = false;
	Tenken.GUI.UploadingSelectMsg = false;
	Tenken.GUI.submitMsgFlag = false;
}

/** Object to hold check values */
Tenken.GUI.TenkenValue.instance = new Tenken.GUI.TenkenValue("Tenken Scenario", new Tenken.DatetimeValue(Tenken.Storage.startDatetime.get()), Tenken.Storage.operator.get());


/**
 * Escape HTML control charactors of the string and return.
 * Encode quotes so that <a href="javascript:..."> can be used.
 * @param {String} _text Target string
 * @return {String} Escaped string
 */
Tenken.GUI.escapeHTML = function(_text) {
	return (null == _text) ? null : _text.replace(
		Tenken.GUI.escapeHTML._REGEXP,
		function($0, $1, $2, $3, $4, $5, $6) {
			if($1)
				return "&amp;";
			else if($2)
				return "&lt;";
			else if($3)
				return "&gt;";
			else if($4)
				return "&nbsp;";
			else if($5)
				return "&#x22;";
			else if($6)
				return "&#x27;";
			else
				return ""; // support IE9 which sets "undefined"
		});
};
/** Regular expression to escape HTML control charactors */
Tenken.GUI.escapeHTML._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(&)|(<)|(>)|( |\t)|(\\\")|(\\\')", "img");
	return re;
})();

/**
 * Escape JavaScript control charactors of the string and return.
 * @param {String} _text Target string
 * @return {String} Escaped string
 */
Tenken.GUI.escapeScript = function(_text) {
	return (null == _text) ? null : _text.replace(
		Tenken.GUI.escapeScript._REGEXP,
		function($0, $1, $2, $3) {
			if($1)
				return "\\\"";
			else if($2)
				return "\\\'";
			else if($3)
				return "\\\\";
			else
				return ""; // support IE9 which sets "undefined"
		});
};
/** Regular expression to escape JavaScript control charactors */
Tenken.GUI.escapeScript._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(\\\")|(\\\')|(\\\\)", "img");
	return re;
})();


/**
 * Return encoded URL string.
 * Encode quotes that are normally not a target for URL encode as it will fail in JavaScript.
 * This method uses encodeURI() and not encodeURIComponent() to encode the entire URI.
 * Note that this method suppose there are no reserved words in query parameters.
 * @param {String} _text Target string
 * @return {String} Encoded string
 */
Tenken.GUI.encodeURL = function(_text) {
	if(null == _text) return null;
	var text = encodeURI(_text);
	return text.replace(
		Tenken.GUI.encodeURL._REGEXP,
		function($0, $1) {
			if($1)
				return "%27"; // encodeURI do not escapge single quote. encode manually here.
			else
				return ""; // support IE9 which sets "undefined"
		});
};
/** Regular expression to escape URL escape charactors */
Tenken.GUI.encodeURL._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(\\\')", "img");
	return re;
})();


/**
 * Scroll body to show seleted element.
 * @param _targetElm Target element to show. If there is no target and want to show the head, specify null.
 */
Tenken.GUI.scrollBodyIntoView = function(_targetElm) {
	document.body.scrollTop = (null == _targetElm) ? 0 : (_targetElm.offsetTop - 70);
};


/**
 * Base class to create GUI parts.
 * @param {String} _id Part ID
 */
Tenken.GUI.AbstractWidgetCreator = function() {};
/**
 * Return HTML of the parts.
 * @param _id Part ID
 * @return HTML string
 */
Tenken.GUI.AbstractWidgetCreator.prototype.getHTML = function(_id) { return ""; }


/**
 * Class to generate number input part.
 */
Tenken.GUI.NumberWidgetCreator = function() {
	Tenken.GUI.AbstractWidgetCreator.call(this);
};
Tenken.inherit(Tenken.GUI.NumberWidgetCreator, Tenken.GUI.AbstractWidgetCreator);
/** @extends Tenken.GUI.AbstractWidget.prototype.getHTML */
Tenken.GUI.NumberWidgetCreator.prototype.getHTML = function(_id) {
return '<input type="text" id="' + _id + '" required pattern="' + Tenken.ChecklistForm.NUMBERTYPE.regexp + '" maxlength="' + Tenken.ChecklistForm.NUMBERTYPE.maxlength + '" onblur="Tenken.GUI.NumberWidgetCreator._validate(this)">'; // oninputにすると、01Dで、キャレットが不審な動きをしたり、移動後のフィールドに値がコピーされたり、選択状態でもないのに、入力値で値が置換されたり、間欠だが、全体的に動きが不審になる
};

Tenken.GUI.NumberWidgetCreator._checkLimit = function(_value, _base, _low, _high) {
	var	invalid=false;

	// Check min and max range.
	var numValue= parseFloat(_value);
	if ( null != _base && "" != _base)
	{
		if ( Tenken.ChecklistForm.checkValue("NUMBER", _base) == true )
		{
			// min/max and base value (number) exists.
			// min and max is difference from the base.
			var numBase=parseFloat(_base);
			var numLow=( null == _low ) ? null : numBase - _low;
			var numHigh=( null == _high ) ? null : numBase + _high;
		}
		else
		{
			// min/max and base value (RowId) exists.
			// Get base from RowId value. min and max is difference from the base.
			var elmBase = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_base));
			if ( elmBase )
			{
				var numBase=parseFloat(elmBase.value);
				var numLow=( null == _low ) ? null : numBase - _low;
				var numHigh=( null == _high ) ? null : numBase + _high;
			}
		}
		if ( (null != numLow && numValue < numLow )  ||
			 (null != numHigh && numValue > numHigh ))
		{
			invalid=true;
		}
	}
	else {
		// min/max only. no base value.
		if ((null != _low && numValue < _low ) ||
		(null != _high && numValue > _high )  )
		{
			invalid=true;
		}
	}

	return invalid;
}

Tenken.GUI.NumberWidgetCreator._validate = function(_elm) {
	var lenPrefix="content_2_row_current_".length;
	var rowId=_elm.id.slice(lenPrefix);
	var row=TenkenData.TenkenTable.getRowFromRowId(rowId);
	if ( null == row || (null == row.LimitLow && null == row.LimitHigh && null == row.listLimit) )
	{
		// Do nothing as there is no min and max value set
		return;
	}

	var invalid = false;
	if ( false == _elm.validity.valueMissing &&
		 true == _elm.validity.valid )
	{
		// Check min and max value range.
		invalid = Tenken.GUI.NumberWidgetCreator._checkLimit(_elm.value, row.LimitBase, row.LimitLow, row.LimitHigh);

		// Check the next min and max values.
		// (Do not check if the first value already exceeds the range)
		if ( true != invalid && null != row.listLimit && 0 < row.listLimit.length )
		{
			for ( var i=0 ; true != invalid && i < row.listLimit.length ; i++ )
			{
				var limitInfo=row.listLimit[i];
				if ( limitInfo )
				{
					invalid = Tenken.GUI.NumberWidgetCreator._checkLimit(_elm.value, limitInfo[2], limitInfo[0], limitInfo[1]);
				}
			}
		}
	}
	_elm.style.backgroundColor = invalid ? "red" : "";
	_elm.style.color = invalid ? "white" : "";

};

/**
 * Class to generate string input part.
 */
Tenken.GUI.StringWidgetCreator = function() {
	Tenken.GUI.AbstractWidgetCreator.call(this);
};
Tenken.inherit(Tenken.GUI.StringWidgetCreator, Tenken.GUI.AbstractWidgetCreator);
/** @extends Tenken.GUI.AbstractWidget.prototype.getHTML */
Tenken.GUI.StringWidgetCreator.prototype.getHTML = function(_id) {

return '<input type="text" id="' + _id + '" required pattern="' + Tenken.ChecklistForm.STRINGTYPE.regexp + '" maxlength="' + Tenken.ChecklistForm.STRINGTYPE.maxlength + '" onblur="Tenken.GUI.StringWidgetCreator._validate(this)">';

};

Tenken.GUI.StringWidgetCreator._validate = function(_elm) {
	var invalid = _elm.validity.valueMissing ? false // not invalid if value is not set.
		: ((_elm.validity.valid && ( "" != _elm.value)) ? false : true);
	_elm.style.backgroundColor = invalid ? "red" : "";
	_elm.style.color = invalid ? "white" : "";
};


/**
 * Class to generate toggle button.
 * Change value per buton is pushed.
 * @param _enums Array to hold toggle value. Head value is the default.
 * @param _instanceName Instance name of this class.
 * @param _function function to call when clicked. function(this, _elm, _currentEnum, _nextEnum){ return ( whether to toggle or not. default is true.); }
 */
Tenken.GUI.ToggleButtonWidgetCreator = function(_enums, _instanceName, _function) {
	Tenken.GUI.AbstractWidgetCreator.call(this);
	this.enums = _enums;
	this._instanceName = _instanceName;
	this._function = _function;
};
Tenken.inherit(Tenken.GUI.ToggleButtonWidgetCreator, Tenken.GUI.AbstractWidgetCreator);
/** @extends Tenken.GUI.AbstractWidget.prototype.getHTML */
Tenken.GUI.ToggleButtonWidgetCreator.prototype.getHTML = function(_id) {
	var id = (null == _id) ? '' : (' id="' + _id + '"');
	return '<input type="button"' + id + ' class="togglebutton" value="' + this.enums[0] + '"onclick="javascript:' + this._instanceName + '.toggle(this)">';
};
/**
 * Toggle button selection.
 * @param _elm part element
 * @param _nextEnum Enum value to show next. Show next enum if null is specified.
 */
Tenken.GUI.ToggleButtonWidgetCreator.prototype.toggle = function(_elm, _nextEnum) {
	var currentIndex = -1;
	for(var i = 0; i < this.enums.length; i++) {
		if(_elm.value == this.enums[i]) {
			currentIndex = i;
			break;
		}
	}
	if(-1 == currentIndex) return;
	var nextIndex = -1;
	if(null == _nextEnum)
		nextIndex = ((this.enums.length - 1) == currentIndex) ? 0 : (currentIndex + 1);
	else {
		for(var i = 0; i < this.enums.length; i++) {
			if(_nextEnum == this.enums[i]) {
				nextIndex = i;
				break;
			}
		}
	}
	if(-1 == nextIndex) return;
	if((null != this._function) && !this._function(this, _elm, this.enums[currentIndex], this.enums[nextIndex])) return;
	_elm.value = this.enums[nextIndex];
};


/** Instance to generate check skip toggle button */
Tenken.GUI.skipornotButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(
	["Running. Inspection is required.", "Stopping. Inspection is not required."],
	"Tenken.GUI.skipornotButtonWidgetCreator",
	function(_this, _elm, _current, _next) {
		_elm.parentElement.nextSibling.setAttribute("data-ar-skip", (_this.enums[1] == _next) ? "skip" : null); // style.display="none"で消すと、再度トグル表示した際に、tableのボーダーが太くなった感じの見た目になってしまった(Windows7 Chrome21.0.1180.89)。CSSの属性セレクタでコントロールする
		return true;
	}
);
/** Instance of Widget for weather input toggle button */
Tenken.GUI.weatherButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.WEATHERTYPE.enum.enums, false), "Tenken.GUI.weatherButtonWidgetCreator");
/** Instance of Widget for OK/NG input toggle button */
Tenken.GUI.okngButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.OKNGTYPE.enum.enums, false), "Tenken.GUI.okngButtonWidgetCreator");
/** Instance of Widget for ○× input toggle button */
Tenken.GUI.marubatsuButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.MARUBATSUTYPE.enum.enums, false), "Tenken.GUI.marubatsuButtonWidgetCreator");
/** Instance of Widget for number input toggle button */
Tenken.GUI.numberWidgetCreator = new Tenken.GUI.NumberWidgetCreator();
/** Instance of Widget for string input toggle button */
Tenken.GUI.stringWidgetCreator = new Tenken.GUI.StringWidgetCreator();

/**
 * Class to process pages.
 * Use as following:
 * (1) Append HTML under #header_menu, #content of main.html
 * (2) Append CSS under body[data-ar-content="*"] of tenkengui.css, and #content
 * (3) Create page class instance derived from this class and add to Tenken.GUI.Page.pages array. context_X of (1) and array index must match. index 0 must be the main page (where user returns when pushes the close button)
 *
 * @param _arEnabled true to enable AR overlay and operations. false otherwise
 */
Tenken.GUI.Page = function(_arEnabled) {
	this._arEnabled = _arEnabled;
};
/**
 * Process before showing the page.
 */
Tenken.GUI.Page.prototype.handleBeforeShow = function() {};
/**
 * Process before hiding the page.
 */
Tenken.GUI.Page.prototype.handleBeforeHide = function() {};
/** page array */
Tenken.GUI.Page.pages = [];
/**
 * Switch pages.
 * @param _pageIndex Index of Tenken.GUI.Page.pages array.
 */
Tenken.GUI.Page.changePage = function(_pageIndex) {
try
{
	var currentActivePageIndex = Tenken.GUI.Page._getShowingPageIndex();
	var currentActivePage = (0 > currentActivePageIndex) ? null : Tenken.GUI.Page.pages[currentActivePageIndex];


	var newActivePage = Tenken.GUI.Page.pages[_pageIndex];
	if(null != currentActivePage) { // current do not exist for the first time.
		currentActivePage.handleBeforeHide();
		Tenken.GUI.stopCamera(); // Stop camera.
	}

	newActivePage.handleBeforeShow();

	Tenken.GUI.Page._show(_pageIndex);
}
catch (e)
{
  Tenken.Util.logerr("Failed to show the page", e);
  alert("Failed to show the page" +  e);
}
};
/**
 * Return current showing page index.
 * @return array index of current page. -1 if none of the page is shown.
 */
Tenken.GUI.Page._getShowingPageIndex = function() {
	var index = document.body.getAttribute("data-ar-content");
	return isNaN(index) ? -1 : parseInt(index);
};
/**
 * Show specified page.
 * @param _pageIndex page index to show.
 */
Tenken.GUI.Page._show = function(_pageIndex) {
	document.body.setAttribute("data-ar-content", _pageIndex);
	document.body.className = "tmp";
	Tenken.GUI.scrollBodyIntoView(null);
};

/** Register Windows load event listener */
window.addEventListener("load", function() {
try {
	// Load each data
	TenkenData.AllGet.loadStorage();

	// Marker detected event.
	Tenken.Util.addMarkerListener(onDetectMarker);
Tenken.Util.loginfo("addMarkerListener");

	if (window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i))
	{
		// Register touch event (iOS)
		document.body.addEventListener("touchstart", function(event) {
			Tenken.traceEvent.traceButtonEvent(Tenken.GUI.TenkenValue.instance.operator, event.target);
			if(document.body != event.target) return;
			var pageIndex = Tenken.GUI.Page._getShowingPageIndex();
			var page = (0 > pageIndex) ? null : Tenken.GUI.Page.pages[pageIndex];
			if((null != page) && page._arEnabled)
			{
				AR.OS.onBodyClick(event, Tenken.Util.noop, Tenken.GUI.Page.onBodyClickError);
			}
		});
	}
	else
	{
		// Register click event (Android/Win)
		document.body.addEventListener("click", function(event) {
			Tenken.traceEvent.traceButtonEvent(Tenken.GUI.TenkenValue.instance.operator, event.target);
			if(document.body != event.target) return;
			var pageIndex = Tenken.GUI.Page._getShowingPageIndex();
			var page = (0 > pageIndex) ? null : Tenken.GUI.Page.pages[pageIndex];
			if((null != page) && page._arEnabled)
			{
				AR.OS.onBodyClick(event, Tenken.Util.noop, Tenken.GUI.Page.onBodyClickError);
			}
		});
	}

	// Create POI of all the checklist
	Tenken.GUI.LoadPOI();

	// Register overlay data
	Tenken.GUI.setARcontents(Tenken.GUI.selectScene, false);

	// Change senario name shown in the title to downloaded scenario name.
	var ScenarioName=TenkenData.Scenario.getScenarioName();
	if ( null != ScenarioName )
	{
		var elm = document.getElementById("header_title_1");
		if ( elm ) elm.innerHTML=ScenarioName;
	}

	// For automatically calculating differencials.
	// Register change event of the input element.
	document.body.addEventListener("change", Tenken.GUI.onChange);

	// Show the initial page (main page)
	Tenken.GUI.Page.changePage(0);

	// Start camera on native device.
	Tenken.GUI.startCamera(); // Start camera

	// Display by incrementing toggle (Display scene name next to the main page)
	var elmToggle = document.getElementById("changescene");
	if ( elmToggle ) Tenken.GUI.changeSceneButtonWidgetCreator.toggle(elmToggle, null);

}
catch (e)
{
  alert("Exception:window.addEventListener load:" + e);
}

}
);

/** Register event listener before window unload */
window.addEventListener("beforeunload", function() {
	if ( true == TenkenData.AllGet.getPhase() )
	{
		return("Download in progress.\nApplication might not start collectly if application is quited during download.");
	}
	if ( true == Tenken.GUI.Uploading )
	{
		return("Upload in progress.\nApplication might not start collectly if application is quited during upload.");
	}

	// Return to the main page and save input data, as data will be cleared when user returns 
	// by clicking OS's "back" button.
	Tenken.GUI.Page.changePage(0); // Switch page
});


/** Register window unload event lister */
window.addEventListener("unload", function() {
	// Remove event lister to detect markers
    Tenken.Util.removeMarkerListener();
});

// Save all inputable HTML tag elements from the specified parent
// into specified array and return.
Tenken.GUI.getInputTag = function(_parent, _listInputs )
{
	try
	{
		// Get INPUT tag elements under the parent element
		if ( null == _parent ) return;
		var lenchildCount=_parent.childElementCount;
		for ( var i=0 ; i < lenchildCount ; i++ )
		{
			if ( _parent.children )
			{
				var child=_parent.children[i];
				// INPUT tag.
				if ( child && "INPUT" == child.nodeName.toUpperCase() )
				{
					// Limit the type. Remove anything other than the target type.
					//	Remove: BUTTON RADIO CHECKBOX FILE HIDDEN SUBMIT
					//        RESET IMAGE
					var type=child.type.toUpperCase()
					switch ( type )
					{
					case "TEXT":
					case "NUMBER":
					case "PASSWORD":
					case "SEACH":
					case "TEL":
					case "EMAIL":
					case "DATETIME":
					case "DATE":
					case "TIME":
					case "URL":
						_listInputs.push(child);
						break;
					}

				}
				if ( child.childElementCount && 0 < child.childElementCount )
				{
					Tenken.GUI.getInputTag(child, _listInputs);
				}
			}
		}
	}
	catch (e)
	{
		alert("exception: Tenken.GUI.getInputTag\n" + e);
	}
}

// Search TABLE tag of parent elements of the specified element.
// Then, create array of INPUT tag list from this TABLE tag. 
// The matching parent should have attribute of "input-ar-group".
// Array containing INPUT elements after this parent is returned.
Tenken.GUI.findInputTagOfTables = function(_current)
{
	try
	{
		var parentElm = _current;

		// Search TABLE tag parsing parents
		for ( ; null != parentElm ; )
		{
			parentElm = parentElm.parentElement;
			if ( parentElm && parentElm.nodeName )
			{
				var attr = parentElm.getAttribute("input-ar-group");
				if ( null != attr )
				{
					break;
				}
			}
		}
		if ( null == parentElm ) return;

		var listInputs = [];
		Tenken.GUI.getInputTag(parentElm, listInputs);

		return listInputs;
	}
	catch (e)
	{
		alert("exception: Tenken.GUI.findInputTagOfTables\n" + e);
	}

}


/** Register Keydown event listener */
window.addEventListener("keydown", function(event) {

try {
	if ( !event ) return;

	// When Enter is pressed.
	if ( event.keyCode == 13 )
	{

		var inputs=Tenken.GUI.findInputTagOfTables(event.target);

		// Move the focus if there are more than 2 INPUT tags　
		if ( inputs && 1 < inputs.length )
		{
			var lenInput=inputs.length;
			var focusIndex=0;
			for ( var i=0 ; i < lenInput ; i++ )
			{
				// Check current focus.
				if ( document.activeElement == inputs[i] )
				{
					// Get next Input tag array. If at the bottom, return head (0)
					focusIndex = (i+1) % lenInput;

					// Move focus to the next Input element
					inputs[focusIndex].focus();
					break;
				}
			}
		}
	}
}
catch (e)
{
	alert("exception : tenkenGUI : keydown event\n" + e);
}
});

/**
 * AR main page class.
 */
Tenken.GUI.ARPage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.ARPage, Tenken.GUI.Page);
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
Tenken.GUI.ARPage.prototype.handleBeforeShow = function() {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.AR_SHOW, null, null, null);
};
/** Register page class instance */
Tenken.GUI.Page.pages.push(new Tenken.GUI.ARPage());
/**
 * Method called when marker detection status changed.
 * @param {Number} _markerId marker ID
 * @param {Boolean} _status true if this is first time to detect this marker ID. False if ID disappeared.
 */
function onDetectMarker(_result){
	// Marker informaion is included in the parameter
	var markval = _result.getValue();

		if(markval.status == true){ // When detected
			// Change display of marker detection notification area.
Tenken.Util.loginfo("onDetectMarker:" + markval.markerId);

			// Show selected marker's information into summary window.
			Tenken.GUI.Page.Summary.showByMarkerId(markval.markerId);

		} else if(markval.status == false){ // When diappeared.

Tenken.Util.loginfo("onDetectMarker:" + 0);

			// Clear information in the summary window.
			Tenken.GUI.Page.Summary.showByMarkerId(0);
		}
};

/**
 * Library namespace to process summary window.
 */
Tenken.GUI.Page.Summary = {};
/**
 * Display information attached to marker ID.
 * @param _markerId marker ID
 */
Tenken.GUI.Page.Summary.showByMarkerId = function(_markerId) {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.SUMMARY_SHOW, _markerId, null, null);
	var elm = document.getElementById("summary");
	var str = "";
	if(0 < _markerId) {
		var assetLists = TenkenData.Asset.getDataListfromMarkerId(_markerId);
		if ( assetLists && 0 < assetLists.length )
		{
			for(var i = 0; i < assetLists.length; i++)
			{
				var asset = assetLists[i];
				str += Tenken.GUI.Page.Summary._getAssetPOIHTML(asset);

				var msgevPois = TenkenData.MsgEvent.getMsgEventListFromAssetId(asset.assetid);
				for(var j = 0; j < msgevPois.length; j++)
				{
					var msgevPoi = msgevPois[j];
					str += Tenken.GUI.Page.Summary._getMessageEventPOIHTML(msgevPoi, false);
				}
			}
		}
		else
		{
			str += "<dl class='assetinfo'><dt>";
			str += "Asset data for marker ID [" + _markerId + "] not found.";
			str += "</dt></dl>";
		}

	}
Tenken.Util.loginfo("Tenken.GUI.Page.Summary.showByMarkerId");
	elm.innerHTML = str;
};
/**
 * Show information attached to message EVENT POI ID.
 * @param _poiId Message's EVENT POI ID
 * @param _occurrenceTime Occured time. Specify this value as unregistered POI do not have id. TODO Think what to do when there could be POI for the same time.
 */
Tenken.GUI.Page.Summary.showByMessageEventPOIId = function(_poiId, _occurrenceTime) {
try {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.AR_TAPARGRAPHIC, null, _poiId, null);
	var elm = document.getElementById("summary");
	var str = "";

	var msgevPoi = TenkenData.MsgEvent.getMsgEventFromMsgIdTime(_poiId, _occurrenceTime);
	if(null != msgevPoi) {
		str += Tenken.GUI.Page.Summary._getMessageEventPOIHTML(msgevPoi, true);
		str += "<hr>";
	}

	var assetLists = TenkenData.Asset.getDataListfromMarkerId(msgevPoi.markerid);
	for(var i = 0; i < assetLists.length; i++) {
		var asset = assetLists[i];
		str += Tenken.GUI.Page.Summary._getAssetPOIHTML(asset);

		var msgevPois = TenkenData.MsgEvent.getMsgEventListFromAssetId(asset.assetid);
		for(var j = 0; j < msgevPois.length; j++) {
			var msgevPoi = msgevPois[j];
			str += Tenken.GUI.Page.Summary._getMessageEventPOIHTML(msgevPoi, false);
		}
	}

Tenken.Util.loginfo("Tenken.GUI.Page.Summary.showByMessageEventPOIId");
	elm.innerHTML = str;
}
catch (e)
{
	alert("exception : Tenken.GUI.Page.Summary.showByMessageEventPOIId\n" + e);
}
};

// Error callback handler upon AR.OS.openUrl
Tenken.GUI.Page.Summary.openUrlError = function(_result)
{
	// Failed to open URL
	var message = "AR.OS.openUrl:error:";
	var detail = _result.getStatus() + "\n"+ _result.getValue();

	Tenken.Util.logerr(message, detail);
}

// File open process when additional icon (Check input, other than message add) is tapped in the summary window.
Tenken.GUI.Page.Summary.openUrl = function(_url)
{
	if ( null != _url )
	{
		AR.OS.openUrl(_url,Tenken.Util.noop, Tenken.GUI.Page.Summary.openUrlError);
	}
}

// Register marker detection event listener again when iframe to show thumbnail graph inside summary windows has completed the load.
// Windows only - This is because lister will dissappear when iframe is used since the page will transition.
Tenken.GUI.Page.Summary.onLoadIframe = function() {
	// Marker detection event
try {
Tenken.Util.loginfo("onLoadIframe");
	Tenken.Util.addMarkerListener(onDetectMarker);
Tenken.Util.loginfo("addMarkerListener");
}
catch (e)
{
	alert("Exception: Tenken.GUI.Page.Summary.onLoadIframe\n" + e);
}
}

/**
 * Return HTML of ASSET POI.
 * @param _poi ASSET POI
 * @return HTML string
 */
Tenken.GUI.Page.Summary._getAssetPOIHTML = function(_asset) {
	var elm = document.getElementById("summary");
	var graphWidth = elm.offsetWidth - 40;
	var graphHeight = Math.min(100, Math.floor(elm.offsetHeight / 2));
	var poiidHS = Tenken.GUI.escapeHTML(Tenken.GUI.escapeScript(_asset.assetid));
	var poinameH = Tenken.GUI.escapeHTML(_asset.assetname);
	var pointid = _asset.markerid; // no need to escape

	var str = "";
	str += "<dl class='assetinfo'>";
	str += "<dt>" + poinameH + "</dt>";

	str += "<dd class='toolbar'>" +
		"<section class='group'>";

	if ( null != _asset.listICON )
	{
		var lenListIcon=_asset.listICON.length;
		var iconNAME="";
		var iconIMG="";
		var iconURL="";
		for ( var i = 0 ; i < lenListIcon ; i++ )
		{
			if ( null == _asset.listICON[i] ) continue;

			var iconInfo=_asset.listICON[i];
			if ( null == iconInfo[0] ) continue;

			iconNAME=iconInfo[0];
			iconIMG= ( null == iconInfo[1] ) ? "image/icon-dark/xdpi/close.png" : iconInfo[1];
			iconURL= ( null == iconInfo[2] ) ? "" : iconInfo[2];

			str += ((null == iconURL) ? "" : "<a href='javascript:Tenken.GUI.Page.Summary.openUrl(\"" + iconURL + "\")' data-ar-eventtype='SUMMARY_ICON'><img src='" + iconIMG + "'><br>" + iconNAME + "</a>");
		}
	}

	// Check graph icon.
	// If not specified show default.
	var strGraph="";
	if ( null != _asset.graphURL )
	{
		var iconInfo=_asset.graphURL[0];
		var nameTenken=( null == iconInfo[0] ) ? "Check graph" : iconInfo[0];
		var graphURL=( null == iconInfo[1] ) ? "" : iconInfo[1];
		if ( "none" != nameTenken.toLowerCase() )
		{
			strGraph += ((null == graphURL) ? "" : "<a href='javascript:Tenken.GUI.Page.Summary.openUrl(\"" + graphURL + "\")' data-ar-eventtype='SUMMARY_MAINTENANCEGRAPH'><img src='image/icon-dark/xdpi/graph-reference.png'><br>" + nameTenken + "</a>");
		}
	}

	// Check input icon.
	// If not specified, show default.
	var strTenken="";
	if ( null != _asset.tenkenICON )
	{
		var iconInfo=_asset.tenkenICON[0];
		var nameTenken=( null == iconInfo[0] ) ? "Input" : iconInfo[0];
		var iconTenken=( null == iconInfo[1] ) ? "image/icon-dark/xdpi/edit-check-list.png" : iconInfo[1];
		if ( "none" != nameTenken.toLowerCase() )
		{
			strTenken="<a href='javascript:Tenken.GUI.ChecklistPage.showPageAndTargetContent(\"" + poiidHS + "\")' data-ar-eventtype='SUMMARY_CHECKLIST'><img src='" + iconTenken + "'><br>" + nameTenken + "</a>";
		}
	}
	else
	{
		strTenken="<a href='javascript:Tenken.GUI.ChecklistPage.showPageAndTargetContent(\"" + poiidHS + "\")' data-ar-eventtype='SUMMARY_CHECKLIST'><img src='image/icon-dark/xdpi/edit-check-list.png'><br>Input</a>";
	}

	// Message icon
	// If not specified, show default.
	var strMsg="";
	if ( null != _asset.msgICON )
	{
		var iconInfo=_asset.msgICON[0];
		if ( iconInfo )
		var nameMsg=( null == iconInfo[0] ) ? "Add msg" : iconInfo[0];
		var iconMsg=( null == iconInfo[1] ) ? "image/icon-dark/xdpi/add-message.png" : iconInfo[1];
		if ( "none" != nameMsg.toLowerCase())
		{
			strMsg="<a href='javascript:Tenken.GUI.AddingMessagePage.InputMsgByMarkerId(\"" + pointid + "\")' data-ar-eventtype='SUMMARY_ADDMESSAGE'><img src='" + iconMsg + "'><br>" + nameMsg + "</a>";
		}
	}
	else
	{
		strMsg="<a href='javascript:Tenken.GUI.AddingMessagePage.InputMsgByMarkerId(\"" + pointid + "\")' data-ar-eventtype='SUMMARY_ADDMESSAGE'><img src='image/icon-dark/xdpi/add-message.png'><br>Add msg</a>";
	}

	str+= "</section>" + "<section class='group'>" + strGraph + strTenken + strMsg + "</section>" + "</dd>";

	// Show image (graph)
	if ( null != _asset.imageURL && "none" != _asset.imageURL.toLowerCase() )
	{
		var imageUrlU = Tenken.GUI.encodeURL(_asset.imageURL);

		// Windows only - Marker detection lister will dissappear when iframe is used since the page will transition.
		// Call method to re-register listener after iframe load is complete.
		var strOnloadIfarame='';
		if ( AR.Native.isWindows() == true )
		{
			strOnloadIfarame=" onload='Tenken.GUI.Page.Summary.onLoadIframe()' ";
		}

		str += ((null == imageUrlU) ? "" : "<dd class='assetgraphinfo'>" +
			"<iframe src=" +imageUrlU+ " STYLE='zoom:100%' width='100%' height='300' class='zoomThumbnail'  frameborder='0' marginwidth='0' marginheight='0' scrolling='no' align='middle'" + strOnloadIfarame + "></iframe>"
			  +"</dd>");
	}

	str += "</dl>";

	return str;
};


/**
 * Return HTML of Message EVENT POI.
 * @param _poi Message EVENT POI
 * @param _highlight true to highlight, false otherwise.
 * @return HTML string
 */
Tenken.GUI.Page.Summary._getMessageEventPOIHTML = function(_poi, _highlight) {

	var poioccurrencetimeSTR = new Tenken.DatetimeValue(_poi.occurrencetime).toString();
	var poioperatorH = Tenken.GUI.escapeHTML(_poi.operator);
	var level = _poi.level;
	var className = ((9 > level) ? "messageeventinfo" : "cautioneventinfo") + (_highlight ? " highlightinfo" : "");
	var udtitleH = Tenken.GUI.escapeHTML(_poi.title);
	var udvalueH = Tenken.GUI.escapeHTML(_poi.value);

	// If message was downloaded from the server, show completion report button.
	var strCompBtn = ( null == _poi.qentityId ) ? "" : '<input type="button" + value="Completion report" class="completeMsgSummary" onClick="Tenken.GUI.completeMessagePage.completeMsg(' +  _poi.msgid  + ')" >';

	var str = "";
	str += "<dl class='" + className + "'>";
	str += "<dt>" + poioccurrencetimeSTR + "</dt>";
	str += "<dd>" + poioperatorH + "</dd>";
	str += "<dd>" + udtitleH + "</dd>";
	str += "<dd>" + udvalueH + "</dd>";
	str += "<dd>" + strCompBtn + "</dd>";
	str += "</dl>";
	return str;
};

/**
 * Submit page class.
 */
Tenken.GUI.SubmitPage = function() {
	Tenken.GUI.Page.call(this, false);
};
Tenken.inherit(Tenken.GUI.SubmitPage, Tenken.GUI.Page);

// Send only the results selected.
// Send only the items where checkbox of send target is checked.
Tenken.GUI.SubmitPage.submitTable = function()
{
	try
	{
		if ( true == Tenken.GUI.Uploading )
		{
			alert("Sending data.");
			return;
		}

		Tenken.GUI.UploadingSelectMode=false;
		Tenken.GUI.submitMsgFlag = false;

		var elmCheck=null;

		var arrayTables = new Array();
		var arrayAssetId = new Array();

		Tenken.GUI.submitAssetLists = new Object();

		// Get table ID of assets being checked.
		var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
		{
			if ( null ==_table ) return;

			elmCheck =document.getElementById(Tenken.GUI.SubmitPage._createSubmitTableId(_table.TableId));
			if (  null != elmCheck && true == elmCheck.checked )
			{
				if ( arrayTables.indexOf(_table.TableId) < 0 )
				{
					// If not registered yet
					arrayTables.push(_table.TableId);
				}
				if ( arrayAssetId.indexOf(_row.AssetId) < 0 )
				{
					// If not registered yet
					arrayAssetId.push(_row.AssetId);
				}
				Tenken.GUI.submitAssetLists[_row.AssetId]=_row.AssetId;
			}
		}
		TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);


		for ( var i=0 ; i < arrayTables.length ; i++ )
		{
			if ( 0 < Tenken.GUI.SubmitPage.checkTableValue(arrayTables[i] , Tenken.config.noinputsubmit) )
			{
				alert("The selected inspection results contain uninput or format error items. \nPlease input it correctly.");
				return;
			}
		}

		if( confirm("Sending.\n\nPlease don't quit application until the completion message is displayed.") == false)
		{
			return;
		}

		var listMarkerIds=[];
		for ( assetid in Tenken.GUI.submitAssetLists )
		{
			if ( null == assetid )
			{
				// Base information might not have marker ID.
				// Set ID=0 when null.
				listMarkerIds.push(0);
			}
			else
			{
				var markerid=TenkenData.Asset.getMarkerIdfromAssetId(assetid);
				if ( 0 <= markerid )
				{
					listMarkerIds.push(markerid);
				}
			}
		}

		if ( 0 < listMarkerIds.length )
		{
			Tenken.GUI.Uploading = true;
			Tenken.GUI.UploadingSelectMode=true;
			Tenken.GUI.UploadingSelectTenken = true;

			// Send check resutls (Only send for marker ID items included in the specified asset)
			TenkenData.TenkenEvent.submitTenkenEvent(listMarkerIds, true, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 1);
		}
		else
		{
			// Send messages here because data will not be send after sending checklist when
			// checklist is not selected to send AND messages is selected to send.
			// Get message's table ID.
			elmCheck =document.getElementById("content_1_submit_msg");
			if (  null != elmCheck && true == elmCheck.checked )
			{
				// If specified, send messages.
				Tenken.GUI.UploadingSelectMode=true;
				Tenken.GUI.submitMsgFlag = true;
				Tenken.GUI.SubmitPage.submitMsg();
			}
			else
			{
				alert("No data is selected to send.");
			}
		}
	}
	catch (e)
	{
		alert("exception : Tenken.GUI.SubmitPage.submitTable\n" + e);
	}

}

// Send message
Tenken.GUI.SubmitPage.submitMsg = function()
{
	Tenken.GUI.Uploading = true;
	Tenken.GUI.submitMsgFlag = true;
	Tenken.GUI.UploadingSelectMsg = true;

	// Send message
	TenkenData.MsgEvent.submitMsgEvent(null, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 2);

}

// Check whether all items are set/no error of input value into selected table ID
//   _tableid   : Set ID of asset table.
//   _noinputok : Set handling mode for unset items.
//                true: Assume unset items as finished and do not count.
//                otherwize: Count unset items and return the value.
// Return
//   -1    : Asset stopped.
//    0    : No unset item, or error found.
//   1 or more : Count of unset item and errors founc.
//
Tenken.GUI.SubmitPage.checkTableValue = function(_tableid, _noinputok)
{
	var objListTables = new Object();
	var ret=0;

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		if ( _tableid == _table.TableId )
		{
			if ( null != _assetstatus && "STOP" == _assetstatus )
			{
				ret=-1;
				return;
			}
			else
			{
				// 未入力項目を完了とするモードが指定されている場合には
				// カウントしません。
				// Do not count when mode is set that unset items will be defined as finished.
				if ( true == _noinputok &&
					( null == _value || "" == _value || "No input" == _value ) )
				{
					return;
				}
				else
				{
					if( !(Tenken.ChecklistForm.checkValue(_row.ValueType, _value)))
					{
						ret++;
					}
				}
			}
		}
	}
	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

	return(ret);
}

// Click event of checkbox to approve sending checklist item without values set.
Tenken.GUI.SubmitPage.onClickNoInputCheckBox = function()
{
	var elmCheck=document.getElementById("content_1_noinput_check");
	var reloadPage=false;
	if ( true == elmCheck.checked )
	{
		if ( true != Tenken.config.noinputsubmit ) reloadPage=true;
		Tenken.config.noinputsubmit=true;
	}
	else
	{
		if ( false != Tenken.config.noinputsubmit ) reloadPage=true;
		Tenken.config.noinputsubmit=false;
	}
	// Redraw send screen.
	if ( true == reloadPage ) Tenken.GUI.Page.changePage(1);
}

/**
 * Return page contents HTML.
 * @return contents HTML string
 */

Tenken.GUI.SubmitPage.getContentHTML = function() {
try {
	var str = '';

	// Load here since data will be cleared upon drawing main.html.
	Tenken.GUI.initMainGUI();

	str += '<table>';

	str += '<tr>';
	str += '<td colspan="2">Start date</td>';
	str += '<td id="content_1_datetime"></td>';
	str += '<td></td>';
	str += '</tr>';

	str += '<tr>';
	str += '<td colspan="2">Operator</td>';
	str += '<td id="content_1_operator"></td>';
	str += '<td></td>';
	str += '</tr>';

	str += '<tr>';
	str += '<td colspan="2"></td>';
	str += '<td></td>';
	str += '<td><b>Target for sending</b><br><button class="buttoncheckboxctl" onclick="Tenken.GUI.submitCheckAll(true)" data-ar-eventtype="SUBMIT_ALL_SELECT">All check</button><br><button  class="buttoncheckboxctl" onclick="Tenken.GUI.submitCheckAll(false)"  data-ar-eventtype="SUBMIT_ALL_RELEASE">All clear</button></td>';
	str += '</tr>';

	var lenTable = TenkenData.TenkenTable.ListTables.length;
	var firstTable = true;

	var rowTable = function(_start, _table)
	{
			if(!_start) return;
			str += '<tr>';
			if(firstTable) str += '<td rowspan="' + lenTable + '">Inspection result</td>';
			str += '<td>' + _table.TableName + '</td>';
			str += '<td id="' + Tenken.GUI.SubmitPage._createTableWidgetId(_table.TableId) + '"></td>';
			str += '<td><input type="checkbox" id="' + Tenken.GUI.SubmitPage._createSubmitTableId(_table.TableId) + '" class="checkboxsubmix"></td>';
			str += '</tr>';
			firstTable = false;
	};

	TenkenData.TenkenTable.foreachTables(null, rowTable, null, null);

	str += '<tr>';
	str += '<td colspan="2">Message</td>';
	str += '<td id="content_1_message"></td>';
	str += '<td><input type="checkbox" id="content_1_submit_msg" class="checkboxsubmix"></td>';
	str += '</tr>';

	str += '</table>';

	// Show or hide checkbox that will send checklists even if the values are not all set.
	var strCheckBox = "";
	if ( true == Tenken.config.noinputsubmitcheckbox )
	{
		strCheckBox = 'onclick="Tenken.GUI.SubmitPage.onClickNoInputCheckBox()"';
		if ( true == Tenken.config.noinputsubmit )
		{
			strCheckBox += ' checked="checked"';
		}
		str += '<br><div id="noinputmsg""><input type="checkbox" id="content_1_noinput_check" class="checkboxnoinput" ' + strCheckBox + '><label for="content_1_noinput_check">Allow to send even if there are uninput items</label></div>';
	}

	str += '<hr>';

	str += '<button id="content_1_submit_fintenken" onclick="Tenken.GUI.checkFinishTenken();">Finish inspection</button>';
	str += '<button id="content_1_submit_select" data-ar-eventtype="SUBMIT_SUBMIT_SELECT" onclick="Tenken.GUI.SubmitPage.submitTable();">Send (selected only)</button>';
	str += '<br><br><hr>';
	str += '<button id="content_1_submit" data-ar-eventtype="SUBMIT_SUBMIT" onclick="Tenken.GUI.SubmitPage._submit();">Send all results (includes unselection)</button><br><br>'; // brは、float:rightで下空間がなくなるのを回避するため

}
catch (e)
{
	alert("Exception : Tenken.GUI.SubmitPage.getContentHTML\n" + e);
}
	return str;
};
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
Tenken.GUI.SubmitPage.prototype.handleBeforeShow = function() {
try
{
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.SUBMIT_SHOW, null, null, null);
	var results = [];

	TenkenData.TenkenTable.foreachTables(
		TenkenData.TenkenEvent.Current,
		function(_start, _table) {
			if(_start) results.push({table:_table, status:null, assetid:null, valid:0, invalid:0, noinput:0});
		},
		null,
		function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus) {
			var result = results[results.length - 1];
			result.status = (null == _assetstatus) ? null : _assetstatus;
			result.assetid = (null == _row) ? 0 : _row.AssetId;

			// Set to finished if the mode is set that sending unset value is possible.
			// Do not make it invalid for unset items.
			if ( true == Tenken.config.noinputsubmit &&
				( null == _value || "" == _value || "No input" == _value ) )
			{
				result.noinput++;
				result.valid++;
			}
			else
			{
				if( Tenken.ChecklistForm.checkValue(_row.ValueType, _value))
				{
					result.valid++;
				}
				else
				{
					result.invalid++;
				}
			}
		}
	);

	var submitButton = document.getElementById("content_1_submit");
	submitButton["data-ar-uninputcount"] = 0;
	submitButton["data-ar-inputcount"] = 0;
	var strResult="";
	for(var i = 0; i < results.length; i++) {
		var result = results[i];
		var elm = document.getElementById(Tenken.GUI.SubmitPage._createTableWidgetId(result.table.TableId));
		// We can send unset items if the mode is set to send empty values.
		if ( true == Tenken.config.noinputsubmit )
		{
			if ("STOP" == result.status)
			{
				strResult = "STOP";
			}
			else
			{
				strResult = (0 == result.invalid) ? "Finish" : "Not finish";
				strResult += " (";
				strResult += "All items=" + Tenken.paddingZero("00", result.valid + result.invalid);
				strResult += ", Uninput item=" + Tenken.paddingZero("00", result.noinput);
				if ( 0 < result.invalid )
				{
					strResult += ", Format error=" + Tenken.paddingZero("00", result.invalid);
				}
				strResult += ")";
			}
		}
		else
		{
			strResult = ("STOP" == result.status)
				? "STOP"
				: (((0 == result.invalid) ? "Finish" : "Not finish") + " (All items=" + Tenken.paddingZero("00", result.valid + result.invalid) + ", Not finish items=" + Tenken.paddingZero("00", result.invalid) + ")");
		}
		if ( 0 < result.invalid )
		{
			var markerid=TenkenData.Asset.getMarkerIdfromAssetId(result.assetid);
			elm.innerHTML='<a href="javascript:Tenken.GUI.ChecklistPage.showPageAndTargetContentMarkerId(' + markerid + ')" class="submitinvalid">' +  strResult + '</a>';
		}
		else
		{
			elm.innerHTML=strResult;
		}

		elm.className = (("STOP" == result.status) || (0 == result.invalid)) ? "" : "incomplete";
		if("STOP" != result.status)
		{
			submitButton["data-ar-uninputcount"] += result.invalid;
			submitButton["data-ar-inputcount"] += result.valid;
		}
	}
	var datetime = document.getElementById("content_1_datetime");
	var operator = document.getElementById("content_1_operator");
	var message = document.getElementById("content_1_message");

	datetime.innerHTML = Tenken.GUI.escapeHTML(Tenken.GUI.TenkenValue.instance.datetime.toString());
	operator.innerHTML = Tenken.GUI.escapeHTML(Tenken.Storage.operator.get());


	// Show Messages
	var str = "";
	var messageStr = "";

	var msgevent = null;

	// Message (Register new)
	for ( var i = 0 ; i < TenkenData.MsgEvent.Current.length ; i++ )
	{
		var msgevent=TenkenData.MsgEvent.Current[i];

		var datetimeSTR = new Tenken.DatetimeValue(msgevent.occurrencetime).toString();
		var operatorH = Tenken.GUI.escapeHTML(msgevent.operator);
		var level = msgevent.level;
		var titleH = Tenken.GUI.escapeHTML(msgevent.title);
		var valueH = Tenken.GUI.escapeHTML(msgevent.value);
		messageStr += '<dt>' + datetimeSTR + " " + operatorH;
		messageStr += '<dd>[Title] ' + titleH + ' [Priority] ' + ((9 == level) ? "high" : "low");
		messageStr += '<dd>[Content] ' + (((null == valueH) || ('' == valueH)) ? '(nothing)' : valueH)
	}

	// Messages (Completion report)
	for ( var i = 0 ; i < TenkenData.MsgEvent.Last.length ; i++ )
	{
		var msgevent=TenkenData.MsgEvent.Last[i];

		if ( "true" != msgevent.Enable )
		{
			var datetimeSTR = new Tenken.DatetimeValue(msgevent.occurrencetime).toString();
			var operatorH = Tenken.GUI.escapeHTML(msgevent.operator);
			var level = msgevent.level;
			var titleH = Tenken.GUI.escapeHTML(msgevent.title);
			var valueH = Tenken.GUI.escapeHTML(msgevent.value);
			var completeStr = ("true" != msgevent.Enable) ? "[Completion report]" : "";
			messageStr += '<dt>' + completeStr + datetimeSTR + " " + operatorH;
			messageStr += '<dd>[Title] ' + titleH + ' [Priority] ' + ((9 == level) ? "high" : "low");
			messageStr += '<dd>[Content] ' + (((null == valueH) || ('' == valueH)) ? '(nothing)' : valueH)
			if ( msgevent.Answer ) messageStr += '<dd>[Completion report] ' + msgevent.Answer+ '</dd>';
		}
	}

	if("" != messageStr) messageStr = ('<dl>') + messageStr + '</dl>';
	str += messageStr;
	message.innerHTML = str;
}
catch (e)
{
	alert("Exception : Tenken.GUI.SubmitPage.prototype.handleBeforeShow\n" + e);
}

};
/**
 * Create part ID of Tenken.ChecklistForm.Table and return.
 * @param _table Tenken.ChecklistForm.Table object.
 * @return Part ID
 */
Tenken.GUI.SubmitPage._createTableWidgetId = function(_tableid) {
	return "content_1_" + _tableid;
};
Tenken.GUI.SubmitPage._createSubmitTableId = function(_tableid) {
	return "content_1_submit_" + _tableid;
};
/**
 * Send results.
 * @param _submitall
 *           true   :Send checkresults for all assets. (Send including stopped asset)
 *           false  :Do not send for stopped asset.
 */
Tenken.GUI.SubmitPage._submit = function(_submitall) {
	var submitButton = document.getElementById("content_1_submit");
	if(0 != submitButton["data-ar-uninputcount"])
		alert("The selected inspection results contain uninput or format error items. \nPlease input it correctly. ");
	else {
		if(confirm("Sending.\n\nPlease do not quit application until the completion message is displayed."))
		{
			Tenken.GUI.TenkenValue.instance.submit(_submitall);
		}
	}
};
/** Register page class instance. */
Tenken.GUI.Page.pages.push(new Tenken.GUI.SubmitPage());


/**
 * Checklist page class.
 */
Tenken.GUI.ChecklistPage = function() {
	Tenken.GUI.Page.call(this, false);
};
Tenken.inherit(Tenken.GUI.ChecklistPage, Tenken.GUI.Page);

// Construct string of max and min value for range check window.
Tenken.GUI.ChecklistPage.setLimitString = function(_limitLow, _limitHigh, _limitBase)
{
	var str="";
	// Append max and min value into range check window.
	if ( null != _limitLow || null != _limitHigh )
	{
		str += " ";
		if ( null == _limitBase || "" == _limitBase)
		{
			// No base value, min/max exists.
			if ( null != _limitLow && null != _limitHigh ) str += "[" + _limitLow  + " - " + _limitHigh + "]";
			else if ( null != _limitLow ) str += "[more than " + _limitLow  + "]";
			else str += "[less than " + _limitHigh  + "]";
		}
		else if ( Tenken.ChecklistForm.checkValue("NUMBER", _limitBase) == true )
		{
			var fBase = parseFloat(_limitBase );

			// Base value (number) exists, min/max exists.
			if ( _limitLow == _limitHigh ) str += "[" + fBase  + "±" + _limitLow + "]";
			else if ( _limitLow && _limitHigh ) str += "[" + (fBase - _limitLow)  + " - " + (fBase + _limitHigh) + "]";
			else if ( null != _limitLow ) str += "[more than" + (fBase  - _limitLow)  + "]";
			else str += "[less than" + (fBase + _limitHigh)  + "]";
		}
	}
	return(str);
}

/**
 * Return page contents HTML.
 * @return Contents HTML string
 */
Tenken.GUI.ChecklistPage.getContentHTML = function() {
try {
	var str = "";
	var groupTd = "";
	var rowTdStart = "";
	var firstRow = false;

	str += '<table><thead><tbody>';
	str += '<input type="button" class="content_2_clear_all_btn" id="content_2_clear_button_allclear" value="Clear all items" onclick="Tenken.GUI.ChecklistPage.clearTable(null, null, true)" data-ar-eventtype="CHECKLIST_CLEAR_ALL" > <br>'
	str += '<input type="button" id="btn1"  value="Change display" onclick="Tenken.GUI.ChecklistPage.changeMode()">';
	str += '<input type="button" id="startcamera2" value="LIVE" onclick="Tenken.GUI.startCamera()">';
	str += '<input type="button" id="stopcamera2"  value="PAUSE" onclick="Tenken.GUI.stopCamera()">';

	str += '</tbody></thead></table>';
	str += '<hr>';

	// Show table (assets)
	for ( var i=0 ; i < TenkenData.TenkenTable.ListTables.length ; i++ )
	{
		var table=TenkenData.TenkenTable.ListTables[i];

		var skipBtn="";
		if ( null == table.AssetStatusStoppable || "true" == table.AssetStatusStoppable.toLowerCase() )
		{
			skipBtn = ' ' + Tenken.GUI.skipornotButtonWidgetCreator.getHTML(Tenken.GUI.ChecklistPage._createTableSkipWidgetId(table.TableId));
		}
		var clearBtn = '<input type="button" class="content_2_clear_btn" id="' + Tenken.GUI.ChecklistPage._createClearButtonId(table.TableId) + '" value="Clear" onclick="Tenken.GUI.ChecklistPage.clearTable(\'' + table.TableId + '\',null,true)"  data-ar-eventtype="CHECKLIST_CLEAR">';

		str += '<header id="' + Tenken.GUI.ChecklistPage._createHeaderId(table.TableId) + '">'+ table.TableName;
		str += skipBtn + "  " + clearBtn;
		str +=  '</header>';
		str += '<table id="' + Tenken.GUI.ChecklistPage._createTableId(table.TableId) + '" input-ar-group="CHECKLIST">';
		str += '<thead>';
		str += '<tr>';
		str += '<th colspan="2" vAlign="top">Item</th>';
		str += '<th vAlign="top">Current value</th>';
		str += '<th vAlign="top">Last value<br><font  class="lastDataDate" id="' + Tenken.GUI.ChecklistPage._createLastData(table.TableId) + '">test</font></th>';
		str += '<th vAlign="top">Criterion etc.</th>';
		str += '</tr>';
		str += '</thead>';

		str += '<tbody>';

		if ( null != table.listRowGroups &&  0 < table.listRowGroups.length )
		{
			// Group setting exists.
			for ( var j=0 ; j < table.listRowGroups.length ; j++ )
			{
				var group=table.listRowGroups[j];

				groupTd = '<td rowspan="' + group.listRows.length + '">' + group.RowGroupName + '</td>';
				firstRow = true;

				// Show checklist (Row)
				for ( var k=0 ; k < group.listRows.length ; k++ )
				{
					row=group.listRows[k];
					str += '<tr>';
					if(firstRow) str += groupTd;
					str += '<td>' + row.RowName + '</td>';
					str += '<td>' + Tenken.GUI.ChecklistPage._createCurrentRowWidgetHTML(row) +  '</td>';
					str += '<td id="' + Tenken.GUI.ChecklistPage._createLastRowWidgetId(row.RowId) + '"></td>';
					var strDesc=((null == row.Description) ? "" : row.Description);
					// Append max and min value to range check window.
					strDesc += Tenken.GUI.ChecklistPage.setLimitString(row.LimitLow, row.LimitHigh, row.LimitBase);
					// Append following max and min values.
					if ( null != row.listLimit && 0 < row.listLimit.length )
					{
						for ( var l=0 ; l < row.listLimit.length ; l++ )
						{
							var limitInfo=row.listLimit[l];
							if ( limitInfo )
							{
								strDesc += Tenken.GUI.ChecklistPage.setLimitString(limitInfo[0], limitInfo[1], limitInfo[2]);
							}
						}
					}
					str += '<td>' + strDesc + '</td>';
					str += '</tr>';
					firstRow=false;
				}

			}
		}
		if ( null != table.listRowsTable &&  0 < table.listRowsTable.length )
		{
			// No group settings.
			// Display checklist (Row).
			for ( var k=0 ; k < table.listRowsTable.length ; k++ )
			{
				row=table.listRowsTable[k];
				str += '<tr>';
				str += '<td colspan="2">' + row.RowName + '</td>';
				str += '<td>' + Tenken.GUI.ChecklistPage._createCurrentRowWidgetHTML(row) + '</td>';
				str += '<td id="' + Tenken.GUI.ChecklistPage._createLastRowWidgetId(row.RowId) + '"></td>';
				var strDesc=((null == row.Description) ? "" : row.Description);
				// Append max and min value to range check window.
				strDesc += Tenken.GUI.ChecklistPage.setLimitString(row.LimitLow, row.LimitHigh, row.LimitBase);
				// Append following max and min values.
				if ( null != row.listLimit && 0 < row.listLimit.length )
				{
					for ( var l=0 ; l < row.listLimit.length ; l++ )
					{
						var limitInfo=row.listLimit[l];
						if ( limitInfo )
						{
							strDesc += Tenken.GUI.ChecklistPage.setLimitString(limitInfo[0], limitInfo[1], limitInfo[2]);
						}
					}
				}

				str += '<td>' + strDesc + '</td>';
				str += '</tr>';
			}
		}

		str += '</tbody>';
		str += '</table>';
		str += '<hr id="hr_' + Tenken.GUI.ChecklistPage._createTableId(table.TableId) + '"></hr>';

	}

	return(str);
}
catch (e)
{
	alert("Exception : Tenken.GUI.ChecklistPage.getContentHTML\n" + e);
}
};

/**
 * Create and return skip processing part ID of Tenken.ChecklistForm.Table
 */
Tenken.GUI.ChecklistPage._createTableSkipWidgetId = function(_tableid) {
	return "content_2_table_skip_" + _tableid;
};
/**
 * Create and return part ID of current Tenken.ChecklistForm.Row
 */
Tenken.GUI.ChecklistPage._createCurrentRowWidgetId = function(_rowid) {
	return "content_2_row_current_" + _rowid;
};
/**
 * Create and return part ID of previous Tenken.ChecklistForm.Row
 */
Tenken.GUI.ChecklistPage._createLastRowWidgetId = function(_rowid) {
	return "content_2_row_last_" + _rowid;
};

Tenken.GUI.ChecklistPage._createTableId = function(_tableid) {
	return "content_2_table_name_" + _tableid;
};
Tenken.GUI.ChecklistPage._createHeaderId = function(_tableid) {
	return "content_2_header_name_" + _tableid;
};
Tenken.GUI.ChecklistPage._createClearButtonId = function(_tableid) {
	return "content_2_clear_button_" + _tableid;
};
Tenken.GUI.ChecklistPage._createTableIdFromClearButtonElm = function(_elm) {
	var lenPrefix="content_2_clear_button_".length;
	var tableid=_elm.id.slice(lenPrefix);
	return(tableid);
};
Tenken.GUI.ChecklistPage._createLastData = function(_tableid) {
	return "content_2_header_lastdata_" + _tableid;
};

/**
 * return HTML string for input Widgets.
 * @return HTML string for input Widgets
 */
Tenken.GUI.ChecklistPage._createCurrentRowWidgetHTML = function(_row) {
	var widget = null;
	switch(_row.ValueType) {
		case "NUMBER":
			widget = Tenken.GUI.numberWidgetCreator;
			break;
		case "WEATHER":
			widget = Tenken.GUI.weatherButtonWidgetCreator;
			break;
		case "OKNG":
			widget = Tenken.GUI.okngButtonWidgetCreator;
			break;
		case "STRING":
			widget = Tenken.GUI.stringWidgetCreator;
			break;
		case "MARUBATSU":
			widget = Tenken.GUI.marubatsuButtonWidgetCreator;
			break;
		default:
			alert("Invalid ValutType exists\nRowId=" + _row.RowId + "\nRowName=" + _row.RowName + "\nValueType=" + _row.ValueType);
			break;
	}

	return (null == widget) ? "" : widget.getHTML(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId));
};

// Clear current value of assets for those that clear button has pressed.
// Clear entire checklist values if _tableid is null.
Tenken.GUI.ChecklistPage.clearTable = function(_tableid, _assetid, _confirm)
{
	if ( true == _confirm && confirm("Do you clear?") != true )
	{
		return;
	}

	// Clear current value of checklist items
	var tableid=null;
	var elm=null;
	if ( null != _tableid )
	{
		var elmid = Tenken.GUI.ChecklistPage._createClearButtonId(_tableid)
		elm = document.getElementById(elmid);
		if ( elm )
		{
			// Get TableId from clear button ID.
			tableid=Tenken.GUI.ChecklistPage._createTableIdFromClearButtonElm(elm);
		}
	}

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		// Clear and initialize check value (rowid) of specified tableid or assetid.
		if ( null == _table && null == _row ) return;

		if ( ( null == _tableid && null == _assetid ) ||
			 ( null != tableid && tableid == _table.TableId ) ||
             ( null != _assetid && _assetid == _row.AssetId ))
		{
			var elmValue = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId));

			if ( elmValue )
			{
				var widget = null;
				var validate = null;
				switch(_row.ValueType)
				{
					case "NUMBER":
						widget = Tenken.GUI.numberWidgetCreator;
						validate = Tenken.GUI.NumberWidgetCreator._validate;
						break;
					case "WEATHER":
						widget = Tenken.GUI.weatherButtonWidgetCreator;
						break;
					case "OKNG":
						widget = Tenken.GUI.okngButtonWidgetCreator;
						break;
					case "STRING":
						widget = Tenken.GUI.stringWidgetCreator;
						break;
					case "MARUBATSU":
						widget = Tenken.GUI.marubatsuButtonWidgetCreator;
						break;
				}
				if ( widget )
				{
					if ( "togglebutton" == elmValue.className)
					{
						// Set to the first (default) object in the array for the toggle.
						widget.toggle(elmValue, widget.enums[0]);
					}
					else
					{
						// null clear for all fields except for toggle.
						elmValue.value=null;
					}
					// Check value for all fields that needs to be checked.
					// We need to re-check this as there might be check item that is referencing other check item that is set to clear.
					if ( validate )
					{
						validate(elmValue);
					}
				}
				else
				{
					// null clear all ValueType field that can not get widget.
					elmValue.value=null;
				}
			}
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

}


/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
Tenken.GUI.ChecklistPage.prototype.handleBeforeShow = function() {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.CHECKLIST_SHOW, null, null, null);

	// Show only the corresponding table if marker id to show is specified.
	// Create table array here.
	var selectTableId = [];
	if ( 0 < Tenken.GUI.selectMarker.length )
	{
		var rowFuncMarkerId = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
		{
			if ( null != _poi2 && null != _poi2.markerid )
			{
				for ( var i=0 ; i < Tenken.GUI.selectMarker.length ; i++ )
				{
					if ( _poi2.markerid == Tenken.GUI.selectMarker[i] )
					{
						var foundindex=-1;
						for ( var j=0 ; j < selectTableId.length ; j++ )
						{
							if ( _table.TableId == selectTableId[j] )
							{
								foundindex=j;
								break;
							}
						}
						if ( -1 == foundindex )
						{
							selectTableId.push(_table.TableId);
						}
					}
				}
			}
		}

		TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFuncMarkerId);

		Tenken.GUI.selectMarker=[];
	}

	// Do not show "Clear entire check item values" if only one marker is shown, or there is no asset.
	if ( 1 == selectTableId.length || 0 == TenkenData.TenkenEvent.Current.length )
	{
		var elmClearAll = document.getElementById("content_2_clear_button_allclear");
		// Use style.visibility as some engine do now validate hidden=true.
		// Note that area will be allocated even if the button is not shown.
		if ( null != elmClearAll )
		{
				elmClearAll.style.display="none";
		}
	}

	var current;
	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		if ( null == _poi2 )
		{
			return;
		}
		if(current)
		{
			// Set current value
			if(null != _value) document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId)).value = _value;
			if(null != _assetstatus)
			{
				var skipWidget = document.getElementById(Tenken.GUI.ChecklistPage._createTableSkipWidgetId(_table.TableId));
				if ( skipWidget )
				{
					Tenken.GUI.skipornotButtonWidgetCreator.toggle(skipWidget, ("STOP" == _assetstatus) ? Tenken.GUI.skipornotButtonWidgetCreator.enums[1] : Tenken.GUI.skipornotButtonWidgetCreator.enums[0]);
				}

				// Check min and max value.
				// Only check if it's a number.
				if ( "NUMBER" == _row.ValueType )
				{
					// Get element and current value's <td> id of check item.
					var idRow=Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId);
					if ( idRow )
					{
						var elm=document.getElementById(idRow);
						if ( elm )
						{
							// Validate min and max value of check item.
							Tenken.GUI.NumberWidgetCreator._validate(elm);
						}
					}
				}
			}

			// Hide all item except for selected marker if marker ID is specified.
			// Do not show weather, temperature also.
			var idHeader=Tenken.GUI.ChecklistPage._createHeaderId(_table.TableId);
			var idTable=Tenken.GUI.ChecklistPage._createTableId(_table.TableId);
			var hdname="hr_" + Tenken.GUI.ChecklistPage._createTableId(_table.TableId);
			var skipHeader = document.getElementById(idHeader);
			var tableWidget = document.getElementById(idTable);
			var hrWidget = document.getElementById(hdname);

			// Use style.display as hidden might not work.
			var hiddenDisp="";

			if ( 0 < selectTableId.length )
			{
				hiddenDisp="none";
				for ( var i=0 ; i < selectTableId.length ; i++)
				{
					if ( _table.TableId == selectTableId[i] )
					{
						hiddenDisp="";
						break;
					}
				}
			}
			// Hide table, skip toggle, horizontal lines.
			if ( tableWidget ) tableWidget.style.display=hiddenDisp;
			if ( skipHeader ) skipHeader.style.display=hiddenDisp;
			if ( hrWidget )	hrWidget.style.display=hiddenDisp;
		}
		else
		{
			// Set previous values
			var statused = (null == _assetstatus) ? _value : (("START" == _assetstatus) ? _value : _assetstatus);
			document.getElementById(Tenken.GUI.ChecklistPage._createLastRowWidgetId(_row.RowId)).innerHTML = (null == statused) ? "" : statused;

			// Set DateTime of previous value input.
			var idLast=Tenken.GUI.ChecklistPage._createLastData(_table.TableId);
			var elmLast=document.getElementById(idLast);
			if ( elmLast )
			{
				elmLast.innerHTML=(null == _poi2.occDatetimeStr ? "" : _poi2.occDatetimeStr) + '</font>';
			}
		}
	}

	// Set current values
	current = true;
	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

	// Set previous values
	current = false;
	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Last, null, null, rowFunc);

};

/** @extends Tenken.GUI.Page.prototype.handleBeforeHide */
Tenken.GUI.ChecklistPage.prototype.handleBeforeHide = function() {
try {

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		if ( null == _poi2 )
		{
			return;
		}
		var fieldValue = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId)).value;

		// Set POI2 to current values
		_poi2[_valueEntryName] = ("" == fieldValue) ? null : fieldValue;

		// Set asset status (running/stopped)
		var skipWidget = document.getElementById(Tenken.GUI.ChecklistPage._createTableSkipWidgetId(_table.TableId));
		if ( skipWidget )
		{
			_poi2.assetstatus = (Tenken.GUI.skipornotButtonWidgetCreator.enums[1] == skipWidget.value) ? "STOP" : "START";
		}
		else
		{
			// Set "START" for non stoppable asset
			_poi2.assetstatus = "START";
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

	// Save check results set to POI2 from display to local storage.
	TenkenData.TenkenEvent.saveStorage();

	// Change input screen to fixed.
	Tenken.GUI.ChecklistPage.changeMode(false);

}
catch (e)
{
	alert("Exception : Tenken.GUI.ChecklistPage.prototype.handleBeforeHide\n" + e);
}
};
/** Register page class instance */
Tenken.GUI.Page.pages.push(new Tenken.GUI.ChecklistPage());
/**
 * Scroll page to show selected poi.
 * @param {String} _poiId poi.id
 */
Tenken.GUI.ChecklistPage.showPageAndTargetContent = function(_targetassetid) {
	Tenken.GUI.selectMarker=[TenkenData.Asset.getMarkerIdfromAssetId(_targetassetid)];
	Tenken.GUI.Page.changePage(2);
};

// Change to checklist input screen for check items that is not complete (not set or has error)
Tenken.GUI.ChecklistPage.showPageAndTargetContentMarkerId = function(_markerid) {
	Tenken.GUI.selectMarker=[_markerid];
	Tenken.GUI.Page.changePage(2);
};

/**
 * Page class for Messagelist
 */
Tenken.GUI.MessagelistPage = function() {
	Tenken.GUI.Page.call(this, false);
};
Tenken.inherit(Tenken.GUI.MessagelistPage, Tenken.GUI.Page);
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
Tenken.GUI.MessagelistPage.prototype.handleBeforeShow = function() {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.MESSAGELIST_SHOW, null, null, null);
	var str = '';

	var msgs = TenkenData.MsgEvent.getMsgEventListFromMarkerId(-1);

	for(var i = 0; i < msgs.length; i++)
	{
		msg = msgs[i];
		if ( null == msg ) continue;

		var idH = Tenken.GUI.escapeHTML(Tenken.GUI.MessagelistPage._createRecordWidgetId(msg.msgid));
		var occurrencetimeSTR = new Tenken.DatetimeValue(msg.occurrencetime).toString();
		var assetidH = TenkenData.Asset.getAssetNamefromMarkerId(msg.markerid);
		var operatorH = Tenken.GUI.escapeHTML(msg.operator);
		var titleH = Tenken.GUI.escapeHTML(msg.title);
		var level = msg.level; // unncessary to escape
		var valueH = Tenken.GUI.escapeHTML(msg.value);

		// Show completion report button for messages downloaded from the server.
		var strCompBtn = ( null == msg.qentityId ) ? "" : '<input type="button" + value="Completion report" class="completeMsg" onClick="Tenken.GUI.completeMessagePage.completeMsg(' +  msg.msgid  + ')" >';
		var strComplete = (null == msg.Answer) ? "" : "[Completion report]" + msg.Answer;
		// Show cancel send button for new messages 
		var strMsgInputBtn ="";
		var msgnew=TenkenData.MsgEvent.getMsgEventFromMsgIdCurrent(msg.msgid);
		if ( msgnew )
		{
			strMsgInputBtn ='<input type="button" + value="Cancel submitting" class="rejectMsg" onClick="Tenken.GUI.MessagelistPage.rejectMsg(' +  msg.msgid  + ')" >';
		}

		str += '<dl id="' + idH + '"' + ((9 == level) ? ' class="important"' : '') + '>';
		str += '<dt>' + occurrencetimeSTR + "&nbsp;&nbsp;&nbsp;" + assetidH + "&nbsp;&nbsp;&nbsp;" + operatorH  + '</dt>';
		str += '<dd>[Title] ' + titleH + '&nbsp;&nbsp;&nbsp;[Prioirty] ' + ((9 == level) ? "High" : "Low")  + '</dd>';
		str += '<dd>[Content] ' + (((null == valueH) || ('' == valueH)) ? '(nothing)' : valueH) + '</dd>';
		str += ( "" != strComplete ) ? '<dd>' + strComplete + '</dd>' : "";
		str += ("" == strCompBtn ) ? "" : '<dd>' + strCompBtn + '</dd>';
		str += ("" == strMsgInputBtn ) ? "" : '<dd>' + strMsgInputBtn + '</dd>';
		str += '</dl>';
	}

	// Show button to display message input dialog
	str += '<hr>';
	str += '<button id="content_3_inputmsg" onclick="Tenken.GUI.AddingMessagePage.InputMsgByMarkerId(-1);" data-ar-eventtype="MESSAGELIST_INPUT_MSG">Input message</button><br><br>';

	document.getElementById("content_3").innerHTML = str;
};
/**
 * Create and return part ID of message
 * @param _poiId poiのid
 * @return 部品ID
 */
Tenken.GUI.MessagelistPage._createRecordWidgetId = function(_poiId) {
	return "content_3_" + _poiId;
};
/** Register page class instance */
Tenken.GUI.Page.pages.push(new Tenken.GUI.MessagelistPage());
/**
 * Scroll to show selected poi.
 * @param {String} _poiId poi.id
 */
Tenken.GUI.MessagelistPage.showPageAndTargetContent = function(_poiId) {
	Tenken.GUI.Page.changePage(3);
	var elm = document.getElementById(Tenken.GUI.MessagelistPage._createRecordWidgetId(_poiId));
	if(null != elm) Tenken.GUI.scrollBodyIntoView(elm);
};


/**
 * Register and show AR overlay data.
 */
Tenken.GUI.setARcontents = function(_sceneid, _reset)
{
	// Display AR overlay data per scene ID.
	if ( null == _sceneid || _sceneid < 0 )
	{
		return;
	}
	// Get scene information from scene ID.
	var scene=Tenken.GUI.getSceneFromSceneId(_sceneid);
	if ( null == scene )
	{
		return;
	}

	// Clear AR overlay view
	AR.Renderer.clear(Tenken.Util.noop,Tenken.Util.noop);

	// Reload AR overlay data from the storage to reset messages that might have been edited or items that have been deleted.
	if ( true == _reset )
	{
		TenkenData.MsgEvent.loadStorage();
		TenkenData.SuperimposedGraphic.loadStorage();
	}

	var SceneName=null;

	// Store selected sceneId.
	Tenken.GUI.selectScene=_sceneid;

	// Display even if there is no scene definition.
	// Display only the scene that display is enabled for messages and asset names.
	// Display both if no scene is defined.
	var lenScene=TenkenData.Scene.ListAll.length;

	var listAsset=null;
	var funcAssetStr=null;
	var listMsg=null;
	var funcMsgStr=null;

	if ( true == scene.dispASSET || lenScene <= 0 )
	{
		listAsset=TenkenData.Asset.ListAll;
		funcAssetStr="Tenken.GUI.ChecklistPage.showPageAndTargetContentMarkerId";
	}
	if ( true == scene.dispMSG  || lenScene <= 0 )
	{
		var arrayMSG=[	TenkenData.MsgEvent.Current,
						TenkenData.MsgEvent.Last];
		listMsg=arrayMSG;
		funcMsgStr="Tenken.GUI.Page.Summary.showByMessageEventPOIId";
	}

	Tenken.ARRendering.createSuperimposedGraphicsAssetAndMsg(
							TenkenData.SuperimposedGraphic.objSuperimposedGraphics,
							_sceneid,
							null,
							listAsset,
							listMsg,
							funcAssetStr,
							funcMsgStr);

	// Get scene name to show.
	SceneName=TenkenData.Scene.getSceneName(_sceneid);

	// Change scene name.
	if ( null != SceneName )
	{
		var elm = document.getElementById("header_title_2");
		if ( elm ) elm.innerHTML=SceneName;
	}
}

// Cancel selected message (register new)
Tenken.GUI.MessagelistPage.rejectMsg = function(_msgid)
{
	if ( _msgid )
	{
		var msg=TenkenData.MsgEvent.getMsgEventFromMsgIdCurrent(_msgid);
		if ( msg )
		{
			var strConf="Do you delete the message?\n\nTitle: " + msg.title + "\nContent:" + msg.value;
			if ( true == confirm(strConf) )
			{
				TenkenData.MsgEvent.deleteMsgEventCurrent(_msgid);

				// Re-store messages into storage.
				TenkenData.MsgEvent.saveStorage();

				// Reload overlay data
				Tenken.GUI.setARcontents(Tenken.GUI.selectScene, true);

				// page reload.
				Tenken.GUI.Page.changePage(3);
			}
		}
	}
}

/**
 * AddingMessage page class.
 */
Tenken.GUI.AddingMessagePage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.AddingMessagePage, Tenken.GUI.Page);

/** Register page class instance */
Tenken.GUI.Page.pages.push(new Tenken.GUI.AddingMessagePage());

// Initialize message input dialog
Tenken.GUI.AddingMessagePage.getContentHTML = function() {
	var str = '';
	return str;
};
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
// Pre process before message input dialog is shown.
Tenken.GUI.AddingMessagePage.prototype.handleBeforeShow = function() {
	// Initialize screen and show.
	var message = document.getElementById("content_4");
	message.innerHTML = "";
};

/**
 * Start message input dialog.
 */
Tenken.GUI.AddingMessagePage.InputMsgByMarkerId = function(_markerid)
{

try {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.ADDMESSAGE_SHOW, _markerid, null, null);

	var message = document.getElementById("content_4");
	var str = "";

	str += '<div align="right">';
	str += '<input type="button" + id="inputmsgok" value="Register" class="btninputmsgreg" onclick="Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog(' + _markerid + ');">';
	str += '<input type="button" + id="inputmsgcancel" value="Cancel" class="btninputmsgcancel"  onclick="Tenken.GUI.AddingMessagePage.ShowMessageInputDialogCancel();">';
	str += '</div>';

	str += '<TABLE cellspacing="2" cellpadding="2" border="0" width="10" bgcolor="#c0c0c0" style="margin-top:3px;" input-ar-group="INPUTMSG">' ;

	// Only show and process those marker ID that is specified.
	if ( -1 != _markerid )
	{
		// Get asset name of specified marker ID.
		var assetname = TenkenData.Asset.getAssetNamefromMarkerId(_markerid);
	}
	else
	{
		// Show every asset names
		if ( AR.Native.isWindows() == true )
		{
			var assetname = '<section><select id="assetselect" size="3">';
		}
		else
		{
			var assetname = '<section><select id="assetselect">';
		}

		assetname += '<option value="">Select</option>';
		for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
		{
			assetname += '<option value="' + TenkenData.Asset.ListAll[i].markerid + '">' + TenkenData.Asset.ListAll[i].assetname + '</option>';
		}
		assetname += '</select></section>';
	}

	str += '<TR>';
	str += '<TD>Target asset</TD>' ;
	str += '<TD>'
	str += assetname;
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Title [not more than 20 characters]</TD>' ;
	str += '<TD>' ;
	str += '<input type="text" id="inputmsg_title" maxlength="20" style="width:20em" value="">';
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Content [not more than 30 characters]</TD>' ;
	str += '<TD>' ;
    str  += '<input type="text" id="inputmsg_value" maxlength="30" size="10" style="width:20em" value="">';
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Priority: high</TD>' ;
	str += '<TD>' ;
	str += '<input type="checkbox" id="inputmsg_level" class="checkboxinputmsg">';
	str += '</TD>' ;
	str += '</TR>';

	str += '</TABLE>' ;

	message.innerHTML = str;

	Tenken.GUI.Page._show(4);

}
catch (e)
{
	alert("Exception : Tenken.GUI.AddingMessagePage.InputMsgByMarkerId\n" + e);
}

}

/**
 * Process upon message registration when register button is pressed in the message input dialog.
 */

Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog = function(_markerid)
{
try {

	var elmTitle=document.getElementById("inputmsg_title");
	if ( null == elmTitle || elmTitle.value == "" )
	{
		alert("The title has not been inputted.");
		return;
	}
	var title=elmTitle.value;

	var elmValue=document.getElementById("inputmsg_value");
	if ( null == elmValue || elmValue.value == "" )
	{
		alert("The content has not been inputted.");
		return;
	}
	var value=elmValue.value;

	var level=1;
	var elmLevel=document.getElementById("inputmsg_level");
	if ( true == elmLevel.checked )
	{
		var level=9;
	}

	// Set selected marker ID if specified.
	var markerid=_markerid;
	if ( -1 == _markerid )
	{
		// Get selected asset's value (=marker ID)
		var elm = document.getElementById("assetselect");
		if ( null != elm && "" != elm.value )
		{
			markerid=parseInt(elm.value);
		}
		else
		{
			alert("Invalid asset selected.");
			return;
		}
	}

	var nowDateTime = new Date().getTime();
	var assetdata = TenkenData.Asset.getDatafromMarkerId(markerid);
	var markername = ( null != assetdata ) ? assetdata.markername : "";
	var targetassetid = ( null != assetdata ) ? assetdata.assetid : "";

	// Please use unique sequence ID for msgid.
	// We're temporary using DateTime here.
	var msg=new Object();
	msg.version = null;
	msg.qentityId = null;
	msg.msgid = nowDateTime;
	msg.msgname = "Message";
	msg.description = "Message";
	msg.registrationtime = nowDateTime;
	msg.regDatetimeStr =  new Tenken.DatetimeValue(nowDateTime).toStringFullTime();
	msg.registrant = Tenken.Storage.operator.get();
	msg.markerid = markerid;
	msg.markername = markername;
	msg.x = 0.0;
	msg.y = 0.0;
	msg.z = 0.0;
	msg.targetassetid = targetassetid;
	msg.title = title;
	msg.level = level;
	msg.value = value;
	msg.occurrencetime = Tenken.Storage.startDatetime.get();
	if ( null != msg.occurrencetime ) msg.occDatetimeStr =  new Tenken.DatetimeValue(msg.occurrencetime).toStringFullTime();
	msg.operator = Tenken.Storage.operator.get();
	msg.ScenarioId = Tenken.config.ScenarioId;
	msg.Enable = "true";
	msg.Answer =  null;

	TenkenData.MsgEvent.addCurrentMsgEvent(msg);

	// Reload overlay data (show newly registered message)
	Tenken.GUI.setARcontents(Tenken.GUI.selectScene, false);

	// Re-store message data into storage.
	TenkenData.MsgEvent.saveStorage();

	Tenken.GUI.Page.changePage(0); // Switch page.
}
catch (e)
{
	alert("Exception : Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog\n" + e);
}

}

/**
 * Process to move to main page when cancel button was pressed
 * in the message input dialog.
 */
Tenken.GUI.AddingMessagePage.ShowMessageInputDialogCancel = function()
{
	Tenken.GUI.Page.changePage(0); // Switch page
}



/**
 * completeMessagePage page class
 */
Tenken.GUI.completeMessagePage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.completeMessagePage, Tenken.GUI.Page);

/** Register page class instance */
Tenken.GUI.Page.pages.push(new Tenken.GUI.completeMessagePage());



// Initialize message completion report dialog
Tenken.GUI.completeMessagePage.getContentHTML = function() {
	var str = '';
	return str;
};

// Pre process before showing message completion report dialog
Tenken.GUI.completeMessagePage.prototype.handleBeforeShow = function() {

	// Initialize screen and show
	var message = document.getElementById("content_5");
	message.innerHTML = "";
};

/**
 * Start message completion report dialog.
 */
Tenken.GUI.completeMessagePage.completeMsg = function(_id)
{
	if ( null == _id ) return;

	// Get messages from the list.
	var msg = TenkenData.MsgEvent.getMsgEventFromMsgIdLast(_id)
	if ( null == msg ) return;

	var message = document.getElementById("content_5");
	var str = "";

	str += '<div align="right">';
	str += '<input type="button" + id="completemsgok" value="Register" class="btncompletemsgreg" onclick="Tenken.GUI.completeMessagePage.performAfterShowMessageInputDialog(' + _id + ');">';
	str += '<input type="button" + id="completemsgcancel" value="Cancel" class="btncompletemsgcancel"  onclick="Tenken.GUI.completeMessagePage.ShowMessageInputDialogCancel();">';
	if ( "true" != msg.Enable && null != msg.Answer )
	{
		str += '<input type="button" + id="completemsgreject" value="Cancel reporting" class="btncompletereject" onclick="Tenken.GUI.completeMessagePage.ShowMessageInputDialogReject(' + _id + ');">';
	}
	str += '</div>';

	str += '<TABLE cellspacing="2" cellpadding="2" border="0" width="10" bgcolor="#c0c0c0" style="margin-top:3px;" input-ar-group="INPUTCOMPLETEMSG">' ;

	// Get asset name.
	var assetname = TenkenData.Asset.getAssetNamefromMarkerId(msg.markerid);

	// If completion report has already been set, set that value.
	var completeMsg = "";
	if ( null != msg.Answer ) completeMsg = msg.Answer;

	str += '<TR>';
	str += '<TD>Target asset</TD>' ;
	str += '<TD>'
	str += assetname
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Title</TD>' ;
	str += '<TD>' ;
	str += msg.title;
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Content</TD>' ;
	str += '<TD>' ;
	str += msg.value;
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Priority</TD>' ;
	str += '<TD>' ;
	str += ( 9 == msg.level ) ? 'high' : 'low';
	str += '</TD>' ;
	str += '</TR>';

	str += '<TR>';
	str += '<TD>Completion report  [not more than 30 characters]</TD>' ;
	str += '<TD>' ;
    str  += '<input type="text" id="completemsg_value" maxlength="30" size="10" style="width:20em" value="' + completeMsg + '">';
	str += '</TD>' ;
	str += '</TR>';


	str += '</TABLE>' ;

	message.innerHTML = str;

	Tenken.GUI.Page._show(5);

}

/**
 * Process completion report registeration when register button is pressed
 * in the completion report dialog.
 */

Tenken.GUI.completeMessagePage.performAfterShowMessageInputDialog = function(_id)
{
try {

	var elmValue=document.getElementById("completemsg_value");
	if ( null == elmValue || elmValue.value == "" )
	{
		alert("Completion report is empty.");
		return;
	}

	// get message data from msgid.
	var msg = TenkenData.MsgEvent.getMsgEventFromMsgIdLast(_id);

	// Store completion report and change complete flag to "TRUE"
	msg.Enable="false";
	msg.Answer=elmValue.value;

	// Re-store message data into storage.
	TenkenData.MsgEvent.saveStorage();

	Tenken.GUI.Page.changePage(0); // Switch page
}
catch (e)
{
	alert("Exception : Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog\n" + e);
}

}

/**
 * Switch to main page when cancel button is pressed
 * in the completion report dialog.
 */
Tenken.GUI.completeMessagePage.ShowMessageInputDialogCancel = function()
{
	Tenken.GUI.Page.changePage(0); // Switch page
}

/**
 * Clear completion report and switch to main page when
 * cancel button is pressed in the completion report dialog.
 */
Tenken.GUI.completeMessagePage.ShowMessageInputDialogReject = function(_id)
{
	// get message data from the list.
	var msg = TenkenData.MsgEvent.getMsgEventFromMsgIdLast(_id)
	if ( null != msg )
	{
		msg.Enable = "true";
		msg.Answer = null;

		// Re-store message data into the storage.
		TenkenData.MsgEvent.saveStorage();
	}

	Tenken.GUI.Page.changePage(0); // Switch page.
}



/** Callback method for onError upon tap event */
Tenken.GUI.Page.onBodyClickError = function(_result){
	var message = "Failed to trigger tap event.\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	alert(message + ":" + detail);
};

// Create POI for entire checklist.
Tenken.GUI.LoadPOI = function()
{
	try
	{
		// Checklist that POI2 do not exist (Create previous and current POI2)
		if ( !Tenken.Storage.currentTenkenEventData.isExist() )
		{
			var current;
			var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
			{
				// No need to register if POI2 is already registered.
				if ( null != _poi2 ) return;
				if ( true == current )
				{
					var targetList=TenkenData.TenkenEvent.Current;
				}
				else
				{
					var targetList=TenkenData.TenkenEvent.Last;
				}
				var asset=TenkenData.Asset.getDatafromAssetId(_row.AssetId);
				if ( null == asset )
				{
					var strMsg=("設備情報テーブル(" + TenkenConst.TableName.asset + ")に登録されていない設備ID(AssetId)=" + _row.AssetId + "で、点検項目テーブル(" + TenkenConst.TableName.tenkentable + ")の点検項目を登録しようとしました。\n値が正しいか確認してください。\n");
					TenkenData.AllGet.abortInvalidData(null, null, null, strMsg, null);
					return;
				}

				// Register POI2
				var value =new Object();
				value.version=0;
				value.qentityId=null;
				value.tenkenid=null;
				value.tenkenname=null;
				value.Description=_row.Description;
				value.type=_row.TenkenType;
				value.registrationtime=null;
				value.registrant=null;
				value.markerid=asset.markerid;
				value.markername=asset.markername;
				value.targetassetid=_row.AssetId;
				value.assetstatus=_assetstatus;
				value.occurrencetime=null;
				value.operator=null;

				var POI2=TenkenData.TenkenEvent.createData(
					targetList, true, value);
				if ( null != POI2 && null != _valueEntryName && null != _value && null == POI2[_valueEntryName] ) POI2[_valueEntryName] = _value;
			}

			// Create POI for previous values
			current = false;
			TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Last, null, null, rowFunc);

			// Create POI for current values
			current = true;
			TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

			// Set checklist current value to previous value. (only to items that SetLastData of row is set to true)
			TenkenData.TenkenEvent.copyCurrentDataFromLastData();
		}

	}
	catch (e)
	{
		alert("Exception :Tenken.GUI.DataMapping \n" + e);
	}

	return;
}

// Create toggle to switch scene name to show.
Tenken.GUI.createSceneToggle = function()
{
	// Create scene name list
	var listSceneName=[];
	var lenScene=TenkenData.Scene.ListAll.length;

	if ( 0 < lenScene )
	{
		Tenken.GUI.Scenes.length=lenScene;
		for ( var i=0 ; i < lenScene ; i++ )
		{
			listSceneName.push(TenkenData.Scene.ListAll[i].name);

			// Overwrite scene name and ID with downloaded scene information.
			var scene=new Object();
			scene.name=TenkenData.Scene.ListAll[i].name;
			scene.sceneid=TenkenData.Scene.ListAll[i].sceneid;
			scene.dispMSG=TenkenData.Scene.ListAll[i].dispMSG;
			scene.dispASSET=TenkenData.Scene.ListAll[i].dispASSET;
			Tenken.GUI.Scenes[i]=scene;
		}
		// Set the first scene ID
		Tenken.GUI.selectScene=TenkenData.Scene.ListAll[0].sceneid;
	}
	else
	{
		// No scene to show. Set dummy data.
		listSceneName.push("(No Scenes)");
	}

	// Create toggle button to switch scenes.
	Tenken.GUI.changeSceneButtonWidgetCreator=new Tenken.GUI.ToggleButtonWidgetCreator(
	listSceneName,
	"Tenken.GUI.changeSceneButtonWidgetCreator",
	function(_this, _elm, _currentEnum, _nextEnum) {
		if ( _currentEnum != _nextEnum )
		{
			Tenken.GUI.changeScene(_currentEnum);
		}

		return true;
	}
	);
}

// Change scene to show.
Tenken.GUI.changeScene = function(_sceneName)
{
	var selectScene=Tenken.GUI.selectScene;
	for ( var i=0 ; i < Tenken.GUI.Scenes.length ; i++ )
	{
		if ( _sceneName == Tenken.GUI.Scenes[i].name )
		{
			selectScene=Tenken.GUI.Scenes[i].sceneid;
			break;
		}
	}

	// If scene is different from the current shown one, re-register AR overlay data and re-render.
	if ( selectScene != Tenken.GUI.selectScene )
	{
		// Set AR overlay data to native device's AR rendering layer.
		Tenken.GUI.setARcontents(selectScene, false);
	}
}

// Get scene information to show.
Tenken.GUI.getSceneFromSceneId = function(_sceneid)
{
	var scene=null;
	for ( var i=0 ; i < Tenken.GUI.Scenes.length ; i++ )
	{
		if ( _sceneid == Tenken.GUI.Scenes[i].sceneid )
		{

			scene=Tenken.GUI.Scenes[i];
			break;
		}
	}
	return scene;
}

// Calculate difference and show check results.
Tenken.GUI.ResultOperatorNumber = function(_value1, _value2, _operator)
{
	var value=null;
	switch(_operator)
	{
	case "-":
		value=(Math.round(_value1 * 1000) - Math.round(_value2 * 1000)) / 1000;
		break;
	case "+":
		value=(Math.round(_value1 * 1000) + Math.round(_value2 * 1000)) / 1000;
		break;
	case "/":
		// round to the nearest 1/1000
		value=(Math.round(_value1 / _value2 * 1000)) / 1000;
		break;
	case "*":
		value=(Math.round(_value1 * _value2 * 1000)) / 1000;
		break;
	}
	return(value);
}

// Check max and min value of checklist item
Tenken.GUI.changeDiffValue = function(_id)
{
	var lenPrefix="content_2_row_current_".length;
	var rowId=_id.slice(lenPrefix);

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		// Do not calculate differences other than numbers.
		if ( null == _row  || "NUMBER" != _row.ValueType) return;

		var foundRow=false;

		// Show calculated result of min and max. (If LimitBais is the Row of RowId)
		if ( rowId == _row.LimitBase ) foundRow=true;

		// Check if next condition is also set on the following RowId
		if ( true != foundRow && null != _row.listLimit && 0 < _row.listLimit.length )
		{
			for ( var i=0 ; true != foundRow && i < _row.listLimit.length ; i++ )
			{
				var limitInfo=_row.listLimit[i];
				if ( limitInfo )
				{
					if ( null != limitInfo[2] && rowId == limitInfo[2] ) foundRow=true;
				}
			}
		}

		if ( true == foundRow )
		{
			var elmValue  = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId));
			if( elmValue )
			{
				// 計算結果値の設定と値のチェック
				// Set calculated value and check value
				Tenken.GUI.NumberWidgetCreator._validate(elmValue);
			}
		}

		// Calculate differences
		if ( rowId == _row.Value1RowId || rowId == _row.Value2RowId  )
		{
			var elmValue  = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId));
			var elmValue1 = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.Value1RowId));
			var elmValue2 = document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.Value2RowId));
			if (elmValue && elmValue1 && elmValue2 &&
				false == elmValue1.validity.valueMissing &&
				true == elmValue1.validity.valid &&
				false == elmValue2.validity.valueMissing &&
				true == elmValue2.validity.valid )
			{
				var value1=parseFloat(elmValue1.value) ;
				var value2=parseFloat(elmValue2.value) ;
				var value = Tenken.GUI.ResultOperatorNumber(value1, value2, _row.ValueOperator);
				// 計算結果値の設定と値のチェック
				// Set calculated value and check.
				if ( null != value )
				{
					elmValue.value=value;
					Tenken.GUI.NumberWidgetCreator._validate(elmValue);
				}
			}
			else
			{
				// Set as automated calculated result to none if value 1 or 2 can not be shown.
				elmValue.value=null;
			}
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

}

// Event handler called when input element is changed.
// The method will not be called if value did not change.
Tenken.GUI.onChange = function(event)
{
	// Calculate difference of check results and show
	if ( event && event.target )
	{
		Tenken.GUI.changeDiffValue(event.target.id);
	}
}

// Set or unset all checkboxes of target items in the result send screen.
// _check : true -> check all, false -> unset all
Tenken.GUI.submitCheckAll = function(_check)
{
	var elmCheck=null;

	// Set check of assets to ON (true) or OFF (false)
	var rowTable = function(_start, _table)
	{
		if ( null ==_table ) return;

		elmCheck =document.getElementById(Tenken.GUI.SubmitPage._createSubmitTableId(_table.TableId));
		if ( null != elmCheck )
		{
			elmCheck.checked = _check;
		}
	}

	TenkenData.TenkenTable.foreachTables(null, rowTable, null, null);

	// Set check of messages to ON (true) or OFF (false)
	elmCheck =document.getElementById("content_1_submit_msg");
	if ( null != elmCheck )
	{
		elmCheck.checked = _check;
	}

}

// Start camera
Tenken.GUI.startCamera = function()
{
	Tenken.Util.startCameraView();
}
// Stop camera
Tenken.GUI.stopCamera = function()
{
	Tenken.Util.stopCameraView();
}

Tenken.GUI.ChecklistPage.dispMove=0;

// Change mode to fixed or variable of checklist screen. 
Tenken.GUI.ChecklistPage.changeMode = function(_mode)
{
	var elm = document.getElementById("content_2");
	if ( elm )
	{
		var setAttr=0;
		if ( true == _mode || ( null == _mode && Tenken.GUI.ChecklistPage.dispMove == 0 ))
		{
			// Change to variable window
			setAttr=1;
		}
		else
		{
			// Change to fixed window
			setAttr=0;
		}

		document.body.setAttribute("data-ar-floating", setAttr);
		elm.setAttribute("data-ar-floating", setAttr);

		// Camera button
		var elmCam1 = document.getElementById("startcamera2");
		if ( elmCam1 ) elmCam1.setAttribute("data-ar-floating", setAttr);

		var elmCam2 = document.getElementById("stopcamera2");
		if ( elmCam2 ) elmCam2.setAttribute("data-ar-floating", setAttr);

		Tenken.GUI.ChecklistPage.dispMove=setAttr;
	}
}

// Complete check (Tenken)
// Validate if there is not unsend data, clear data and storage, then return to initial screen.
Tenken.GUI.checkFinishTenken = function()
{
	// Show warning that checkbox is unselected if sending unset items is permitted.
	var elmCheck=document.getElementById("content_1_noinput_check");
	if ( true == elmCheck.checked )
	{
		alert("Please retry by unchecking [Allow to send even if there are uninput items]");
		return;
	}

	// Validate if there are no check result left (All items for the assets been completed)
	var submitButton = document.getElementById("content_1_submit");
	if(0 < submitButton["data-ar-inputcount"])
	{
		alert("Can not complete due to unsend check result.\n(This includes items that are partialy not set)\n\nPlease send results, or clear entire checklist items and do again.");
		return;
	}

	// Validate if messages (register new) are not left
	if ( 0 < TenkenData.MsgEvent.Current.length )
	{
		alert("There are messages not sent.\n\nPlease send messages");
		return;
	}

	// Validate if completion reports are not left.
	var foundComp=0;
	for ( var i = 0 ; i < TenkenData.MsgEvent.Last.length ; i++ )
	{
		var msgevent=TenkenData.MsgEvent.Last[i];

		if ( "true" != msgevent.Enable && null != msgevent.Answer)
		{
			// Abort if any complete report is left.
			foundComp=1;
			break;
		}
	}

	if ( 0 < foundComp )
	{
		alert("There are completion reports not sent.\n\nPlease send completion reports or cancel completion reports.");
		return;
	}

	if( confirm("Finish inspection\n\nReturn initial screen?") == false)
	{
		return;
	}

	Tenken.GUI.FinishTenkenGoTop();

}

// Initialize Tenken.GUI
Tenken.GUI.initMainGUI = function()
{
	try {
	// Get data from local storage.
	TenkenData.AllGet.loadStorage();

	// Set selected scenario ID and scene name
	Tenken.config.ScenarioId=Tenken.Storage.ScenarioId.get();

	if ( null != Tenken.config.ScenarioId )
	{
		TenkenData.Scenario.setScenarioName(TenkenData.Scenario.getScenarioNameFromId(Tenken.config.ScenarioId));
	}

	// Create toggle to switch scene name.
	Tenken.GUI.createSceneToggle();

	}
	catch (e)
	{
		alert("Exception : Tenken.GUI.initMainGUI\n" + e);
	}
}
