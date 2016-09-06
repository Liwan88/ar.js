/**
 * @overview JavaScript API (Data request & response module) for Tenken Application
 * @copyright Copyright 2014 FUJITSU LIMITED
 *
 * Function:
 *    The library uses FUJITSU Software Interstage AR Processing Server(AR from 
 *    here after)'s REST API to send, rescieve, and delete data.
 *    This file provides limited fuctionality for Tenken application's data
 *    processing as following.
 *      ・Data Recieve (quad parameter for AR.Data.getArServerData)
 *      ・Data Send (quad parameter for AR.Data.postArServerData)
 *      ・Data Delete (qentities parameter for AR.Data.deleteArServerData)
 */

// Macro function for exception handling
var TenkenARdebugException = function(_function, _e)
{
	alert("Exception : " + _function + "\n" + _e);
}

// AR Data Management
var TenkenARvalue = {};

// Quad object used for communication with AR server
// Used to send/receive data from the server
TenkenARvalue.Quad = function(_qtypename)
{
	this.qtypeName=_qtypename;
	this.id;
	this.version;
	this.qvalues;
	return this;
};

// QValue object used for communication with AR server
// Used to send/receive data from the server
TenkenARvalue.QValue = function(_qtypeName, _qattributeName, _stringValue, _longValue, _floatValue )
{
	this.qtypeName = _qtypeName;
	this.qattributeName = _qattributeName;
	this.stringValue = _stringValue;
	this.longValue = _longValue;
	this.floatValue = _floatValue;
	this.version;
};

// Class used to delete data from AR Server
TenkenARvalue.QDelete = function(_qentityid, _version )
{
	this.qentityid = _qentityid;
	this.version = parseInt(_version);
};

// Object used for Quad query from AR Server
TenkenARvalue.QuadQuery = function()
{
	this.type;
	this.limitRange;
	this.qattributeOrderIndexRange;
	this.qtypeNameRages;
	this.whereExpressions;
	this.sortOrderExpressions;
	return this;
};

// Object to describe range of Quad query from AR Server.
// If _end value is not specified in constructor method, _end will have the same
// value as _start
TenkenARvalue.Range = function(_start, _end)
{
	this.start = _start;
	if(typeof _end == "undefined") this.end = _start;
	else this.end = _end;
	return this;
};

// Object to describe Expression of Quad query parameter
TenkenARvalue.QuadQueryExpression = function(_nameRange, _valueRange, _type, _desc)
{
	this.qattributeNameRanges = _nameRange;
	this.qvalueRanges = _valueRange;
	this.qvalueType = _type;
	this.desc = _desc;
	return this;
};

// Obtain quad query string from QuadQuery class
TenkenARvalue.makeQuadQuery = function(_qQuery)
{
	try
	{
	var query="quads?";
	if(_qQuery == null) return query;
	if(_qQuery.type != null) query += "type=" + _qQuery.type;
	if(_qQuery.limitRange != null) query += "&limitRange=" + JSON.stringify(_qQuery.limitRange);
	if(_qQuery.qattributeOrderIndexRange != null) query += "&qattributeOrderIndexRange=" + JSON.stringify(_qQuery.qattributeOrderIndexRange);
	if(_qQuery.qtypeNameRanges != null) query += "&qtypeNameRanges=" + JSON.stringify(_qQuery.qtypeNameRanges);
	if(_qQuery.whereExpressions != null) query += "&whereExpressions=" + JSON.stringify(_qQuery.whereExpressions);
	if(_qQuery.sortOrderExpressions != null) query += "&sortOrderExpressions=" + JSON.stringify(_qQuery.sortOrderExpressions);
	return query;
	}
	catch (e)
	{
		TenkenARdebugException("TenkenARvalue.makeQuadQuery" , e);
	}
};

//============================================================================
// Shared objects and functions
//============================================================================
// Class that communicate with AR Server
var TenkenARdata = function (_tablename)
{
	if ( null == _tablename )
	{
		throw ( "IllegalArgument:undefined _tablename" );
	}

	if (!(this instanceof TenkenARdata))
	{
		return new TenkenARdata(_tablename);
	}

	// Property
	this.tablename = _tablename;  // Table name for Data communication
	this.maxLimitRange=100; // Max retrieve value (default is 100):limitRange upon retrieve
	this.getMaxCount=0;   // Max retrieve count of data (used when retrieving top N number of data after the query). 0 specifies no max count.
	this.reload=true; // Force load
	this.useOfflineStorage=true; // Sets to use off-line storage or not (true: use, false: do not use)

	// Counters for data communication

	// Result data
	this.where=null;      // query param
	this.sort=null;       // sort param
	this.sortdesc=false;  // sort order (false:asc , true:desc)

	this.result=null;
	this.status=null;
	this.detail=null;

	// Callbacks (callback methods from callee)
	this.callBackGetCountSuccess=null;
	this.callBackGetCountError=null;
	this.callBackGetDataSuccess=null;
	this.callBackGetDataError=null;
	this.callBackPostDataSuccess=null;
	this.callBackPostDataError=null;
	this.callBackDeleteDataSuccess=null;
	this.callBackDeleteDataError=null;

	// Internal use
	this.dataGetValue=[];   // Temporary variable to save received (get) data
	this.dataPostValue=[];  // Temporary variable to save send (post) data
	this.dataDelete=[];     // Temporary valriable to save delete (delete) data
	this.dataCount=0;       // Data count of communicated data.
							// Total number of data received (or send) will be set when communication is finished.
	this.dataNextCount=0;   // Next index number to process
	this.dataMaxCount=0;    // Max data count to send, receive, or delete
	this.dataSendOKCount=0; // Success count of post(Quad)/delete(Qentity)
	this.dataSendNGCount=0; // Error count of post(Quad)/delete(Qentity)

	this.busy=false; 	  		// Flag to determine if it's still communicating (true=in middle of communication false=not in communication)
	this.complete=false; 	  	// Flag to determine if the data is still processing (true=in middle of communication false=all data transferred)

	// Interval Timer (in milli seconds): 0 specifies not to use Interval Timer
	this.IntervalTime = 500;

	// Interval Timer Id
	this.IntervalId=null;

	// Get Table name
	this.getTableName = function()
	{
		return this.tablename;
	}

	// Set Table name
	this.setTableName = function(_tablename)
	{
		this.tablename = _tablename;
	}
	// Set Interval Timer value
	this.setIntervalTime = function(_intervalTime)
	{
		this.IntervalTime = _intervalTime;
	}
	// Get Interval Timer value
	this.getIntervalTime = function()
	{
		return this.IntervalTime;
	}

	// Set maximum count to receive at single call
	this.setMaxLimitRange = function(_maxLimitRange)
	{
		if ( null != _maxLimitRange && 0 < _maxLimitRange && _maxLimitRange <= 100 )
		{
			this.maxLimitRange = _maxLimitRange;
		}
		else
		{
			throw("setMaxLimitRange: Error parameter");
		}
	}
	// Get maximum count to receive at single call
	this.getMaxLimitRange = function()
	{
		return this.maxLimitRange;
	}

	// Set maximum count to receive
	this.setGetMaxCount = function(_count)
	{
		if ( null != _count && 0 <= _count )
		{
			this.getMaxCount = _count;
		}
		else
		{
			throw("setGetMaxCount: Error parameter");
		}
	}
	// Get maximum count to receive
	this.getGetMaxCount = function()
	{
		return this.getMaxCount;
	}

	// Set force reload value
	this.setReload = function(_reload)
	{
		this.reload = _reload;
	}
	// get force reload value
	this.getReload = function()
	{
		return this.reload;
	}

	// Set to use off-line storage
	this.setUseOfflineStorage = function(_useOfflineStorage)
	{
		this.useOfflineStorage = _useOfflineStorage;
	}
	// Get off-line storage value
	this.getuseOfflineStorage = function()
	{
		return this.useOfflineStorage;
	}

	// Add query parameters
	// Add paramenter for whereExpressions in AR.Data.getArServerData
	// @param {String} _nameStart  Specify QAttribute name of the query target.
	//                             If multiple value is specified, start of nameRanges will be used
	// @param {String} _nameEnd    Specify QAttribute name of the query target.
	//                             If multiple value is specified, end of nameRanges will be used
	// @param {String/Number} _valueStart Specify value to query from QAttribute name defined in _nameStart or _nameEnd
	//                                    The value will be number or string.
	// @param {String/Number} _valueEnd   Specify value to query from QAttribute name defined in _nameStart or _nameEnd
	//                                    The value will be number or string.
	// @param {String} _type Specify type (STRING/LONG/FLOAT) of query target.
	// @return true:addition success  false:addition failed
	//
	// If this method is used to add multiple queries, all queries will be added as AND query.
	// If _valueStart and _valueEnd is specified as an array, each values inside an array is appended as OR query.
	// The method will not check against maximum/minimum value nor the maximum count.
	//
	// Example:
	//   1) Single query param
	//     To otain the value of "abc" where QAttribute="Target1"
	//      addWhere( "Target1", null, "abc", null, "STRING");
	//
	//   2) Multiple query param (AND query)
	//     To obtain the value of "abc" where QAttribute="Target1", AND value of 150 where QAtribute="Target2"
	//      addWhere( "Target1", null, "abc", null, "STRING");
	//      addWhere( "Target2", null, 150, null, "LONG");
	//
	//   3) Multiple query param (OR query)
	//     To obtain the value of 0 OR 40 where QAttribute="Target3"
	//      addWhere( "Target3", null, [0, 40], null, "LONG");
	//
	this.addWhere = function(_nameStart, _nameEnd, _valueStart, _valueEnd, _type)
	{
		if ( (null == _nameStart && null == _nameEnd) ||
   			 (null == _valueStart && null == _valueEnd) ||
			 null == _type ) return false;

		// qvalueType
		if ( _type != "LONG" && _type != "STRING" && _type != "FLOAT" )
		{
			throw("addWhere : invalid qvalueType");
			return false;
		}

		if (  null != _nameEnd )
		{
			var nameRanges=new TenkenARvalue.Range(_nameStart,_nameEnd);
		}
		else
		{
			var nameRanges=new TenkenARvalue.Range(_nameStart);
		}

		// whereExpressions
		if ( _valueStart instanceof Array )
		{
			// multiple value query 
			if ( null != _valueEnd && !(_valueEnd instanceof Array)) 
			{
				// if array is specified, both START and END needs to be arrays
				throw("addWhere : invalid _valueEnd");
			}
			else if ( null == _valueEnd || _valueEnd instanceof Array) 
			{
				var where = new Array();
				len=_valueStart.length;
				for ( var i=0 ; i < len ; i++ )
				{
					var valueRange=null
					if ( null != _valueEnd && null != _valueEnd[i] )
					{
						valueRange=new TenkenARvalue.Range(_valueStart[i], _valueEnd[i]);				}
					else
					{
						valueRange=new TenkenARvalue.Range(_valueStart[i]);
					}
					where.push(valueRange);
				}
			}
		}
		else
		{
			// Single value query
			if (   null != _valueEnd && _valueEnd instanceof Array )
			{
				// if array is specified, both START and END needs to be arrays
				throw("addWhere : invalid _valueEnd");
			}
			else if ( null != _valueEnd )
			{
				var where=new TenkenARvalue.Range(_valueStart,_valueEnd);
			}
			else
			{
				var where=new TenkenARvalue.Range(_valueStart);
			}
		}

		// qattributeNameRanges
		if ( null == this.where ) this.where = new Array();

		// Append to query paramenter array
		this.where.push(new TenkenARvalue.QuadQueryExpression(nameRanges, where, _type, this.sortdesc));
		return true;
	}

	// Clear query parameter
	this.clearWhere = function()
	{
		this.where=null;
	}

	// Add sort parameter
	this.addSort = function(_nameStart, _nameEnd, _valueStart, _valueEnd, _type)
	{
		if ( null == _nameStart && null == _nameEnd )
		{
			throw ( "IllegalArgument:addSort: undefined nameStart &&  nameEnd" );
		}

		// qvalueType
		if ( _type != "LONG" && _type != "STRING" && _type != "FLOAT" )
		{
			throw("addSort : invalid qvalueType");
			return false;
		}

		// qattributeNameRanges
		if (  null != _nameEnd )
		{
			var nameRanges=new TenkenARvalue.Range(_nameStart,_nameEnd);
		}
		else if (  null != _nameStart )
		{
			var nameRanges=new TenkenARvalue.Range(_nameStart);
		}

		// Specify sort parameter
		if ( _valueStart instanceof Array )
		{
			if ( null != _valueEnd && !(_valueEnd instanceof Array))
			{
				// if array is specified, both START and END needs to be arrays
				throw("addSort : invalid _valueEnd");
			}
			else if ( null == _valueEnd || _valueEnd instanceof Array)
			{	
				// multiple value query
				var sort = new Array();
				len=_valueStart.length;
				for ( var i=0 ; i < len ; i++ )
				{
					var valueRange=null
					if ( null != _valueEnd && null != _valueEnd[i] )
					{
						valueRange=new TenkenARvalue.Range(_valueStart[i], _valueEnd[i]);				}
					else
					{
						valueRange=new TenkenARvalue.Range(_valueStart[i]);
					}
					sort.push(valueRange);
				}
			}
		}
		else
		{
			// single value query (not an array)
			if (   null != _valueEnd && _valueEnd instanceof Array )
			{
				// if array is specified, both START and END needs to be arrays
				throw("addSort : invalid _valueEnd");
			}
			else if (  null != _valueEnd )
			{
				var sort=new TenkenARvalue.Range(_valueStart,_valueEnd);
			}
			else if ( null != _valueStart )
			{
				var sort=new TenkenARvalue.Range(_valueStart);
			}
			else
			{
				var sort=null;
			}
		}

		// qattributeNameRanges
		if ( null == this.sort ) this.sort = new Array();

		// Append to sort parameter array
		this.sort.push(new TenkenARvalue.QuadQueryExpression(nameRanges, sort, _type,  this.sortdesc));
		return true;
	}
	// Clear sort parameter
	this.clearSort = function()
	{
		this.sort=null;
	}
	// Set sort order (false=asc.(default), true=desc.)
	this.setSortDesc = function(_desc)
	{
		if ( _desc ) this.sortdesc=_desc;
	}
	// Get sort order
	this.getSortDesc = function()
	{
		return this.sortdesc;
	}

	// Get busy flag
	this.getBusyStatus = function()
	{
		return this.busy;
	}

	// Get if communication has completed
	this.getCompleteStatus = function()
	{
		return this.complete;
	}

	// Get data count
	this.getDataCount = function()
	{
		return this.dataCount;
	}

	// Get received data (in Object array)
	this.getDataValue = function()
	{
		return this.dataGetValue;
	}

	// Get result
	this.getResult = function()
	{
		return this.result;
	}

	// Get status
	this.getStatus = function()
	{
		return this.status;
	}

	// Get details
	this.getDetail = function()
	{
		return this.detail;
	}

	// Callback method for successful data count
	this.getArDataCountSuccess = function(_result)
	{
		try
		{
			if ( null != _result.getValue() )
			{
				var result=_result.getValue();
			}
			// Save data counts
			this.dataCount=result.unlimitedRecordCount;

			if ( this.callBackGetCountSuccess ) this.callBackGetCountSuccess(_result);
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCountSuccess" , e);
		}
	}

	// Callback method for error upon data count
	this.getArDataCountError = function(_result)
	{
		try
		{
			this.result=_result;

			var message = "Error occurred while obtaining data count. Please confirm operation mode and network connectivity and retry. (" + this.tablename + ")\n";
			this.detail="";
			if(_result.getStatus() == "AR_HTTP_EXCEPTION")
			{
				this.detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
			} else
			{
				this.detail += _result.getStatus() + "\n"+ _result.getValue();
			}

			this.completeGetData();

			if ( this.callBackGetCountError ) this.callBackGetCountError(_result);
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCountError" , e);
		}
	}

	this.getArDataCount = function(_onSuccess, _onError)
	{
		try
		{
			this.callBackGetCountSuccess=_onSuccess;
			this.callBackGetCountError=_onError;

			// Create Query object
			var query = new TenkenARvalue.QuadQuery();
			query.type = "COUNT";

			// Specify qtype where operator data is defined
			query.qtypeNameRanges = new Array(new TenkenARvalue.Range(this.tablename));

			// Put query param
			if ( null != this.where )
			{
				query.whereExpressions=this.where;
			}

			// Set sort parameter (since we're just getting count, no need to define sort)

			// Transform to string value
			var getQuery = TenkenARvalue.makeQuadQuery(query);


			// Obtain Checklist table data from AR server.
			// The method uses bind() to use TenkenARdata's "this" inside the callback.
			// Note: bind() might not work for old HTML rendering engine.

			AR.Data.getArServerData(
				getQuery,
				this.reload,
				this.getArDataCountSuccess.bind(this),
				this.getArDataCountError.bind(this)
				);
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCount" , e);
		}
	}

	// Extract operator data from JSON object
	this.extractData = function(_result)
	{
		try
		{
			var data=_result.getValue();
			if ( null == data ) return;

			// Received record count
			var recordCount = data.records.length;

			this.dataCount += recordCount;
			for(var recordIndex = 0; recordIndex < recordCount; recordIndex++)
			{
				// Parse record one by one
				var record = data.records[recordIndex];
				var valueLength = record.qvalues.length;
				var value = new Object();

				value.version = record.version;
				value.qentityId = record.id;

				// Obtain only the count specified by qvalue. Define by attribute Name
				for(var valueIndex = 0; valueIndex < valueLength; valueIndex++)
				{

					var qvalue = record.qvalues[valueIndex];
					if ( null != qvalue.stringValue )
					{
						value[qvalue.qattributeName] = qvalue.stringValue;
					}
					else if ( null != qvalue.floatValue )
					{
						value[qvalue.qattributeName] = qvalue.floatValue;
					}
					else if ( null != qvalue.longValue )
					{
						value[qvalue.qattributeName] = qvalue.longValue;
					}
				}

				// Save data
				if ( null == this.dataGetValue ) this.dataGetValue = new Array();
				this.dataGetValue.push(value);
			}
			// Call the callback method when entire data is received
			if ( this.dataCount >= this.dataMaxCount )
			{
				// End process when data receive is completed.
				this.completeGetData();

				if ( this.callBackGetDataSuccess ) this.callBackGetDataSuccess(_result);
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.extractData" , e);
		}
	};

	// Receive data using internal timer
	this.startIntervalAction = function(_action)
	{
		this.dataNextCount=0;
		if ( "get" == _action )
		{
			this.setIntervalFunc(this.getArDataInterval.bind(this));
		}
		else if ( "post" == _action )
		{
			this.setIntervalFunc(this.postArDataInterval.bind(this));
		}
		else if ( "delete" == _action )
		{
			this.setIntervalFunc(this.deleteArDataInterval.bind(this));
		}
	}

	// Success callbback method for data count
	this.getArDataCountSuccess2 = function(_result)
	{
		try
		{
			if ( _result && null != _result.getValue() )
			{
				var result=_result.getValue();

				// Save data count to receive
				if ( 0 < this.getMaxCount && this.getMaxCount < result.unlimitedRecordCount )
				{
					// If max data count is specified, limit to that max count
					this.dataMaxCount=this.getMaxCount;
				}
				else
				{
					// If max data count is not specified, or the query result is less than the max, set the result count
					this.dataMaxCount=result.unlimitedRecordCount;
				}


				this.dataCount=0;

				if ( 0 < this.dataMaxCount  )
				{
					if ( null != this.IntervalTime && 0 < this.IntervalTime )
					{
						// Use interval timer to limit data receive count
						this.startIntervalAction("get");
					}
					else
					{
						// Receive data without using interval timer.
						// This will receive everything
						this.getArDataValue(1, result.unlimitedRecordCount);
					}
				}
				else
				{
					// End data receival since the target record is zero

					// End process when data receive is completed.
					this.completeGetData();

					if ( this.callBackGetDataSuccess ) this.callBackGetDataSuccess(_result);
				}
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCountSuccess2" , e);
		}
	}

	// Error callback method for data count
	this.getArDataCountError2 = function(_result)
	{
		try
		{
			this.result=_result;

			var message = "Error occurred while obtaining data. Please confirm operation mode and network connectivity and retry.(" + this.tablename + ")\n";
			this.detail="";
			if(_result.getStatus() == "AR_HTTP_EXCEPTION")
			{
				this.detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
			} else
			{
				this.detail += _result.getStatus() + "\n"+ _result.getValue();
			}


			this.completeGetData();

			if ( this.callBackGetDataError ) this.callBackGetDataError(_result);
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCountError2" , e);
		}
	}


	// Callback when data receive is success
	this.getArDataSuccess = function(_result)
	{
		if ( null != _result.getValue() )
		{
			// Save data from the result
			this.extractData(_result);
		}
	}

	// Callback when data receive is error
	this.getArDataError = function(_result)
	{
		try
		{
			this.result=_result;

			var message = "Error occurred while obtaining data. Please confirm operation mode and network connectivity and retry.(" + this.tablename + ")\n";
			this.detail="";
			if(_result.getStatus() == "AR_HTTP_EXCEPTION")
			{
				this.detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
			} else
			{
				this.detail += _result.getStatus() + "\n"+ _result.getValue();
			}
			this.completeGetData();


			if ( this.callBackGetDataError ) this.callBackGetDataError(_result);
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataError" , e);
		}
	}


	// Data receive

	// Data receiving is done by looping count from 1 to the maxLimitRange value.
	// _start : Receive start count: Single AR.dat4a.getArServerData will receive data from this value to the value specified in this.maxLimitRange
	// _count : Maxinum number to receive data
	//          AR.data.getArServerData will be called following times.
	//          round up)
	//            (_count - _start) / this.maxLimitRange

	// _start : Counter to start receive:
	this.getArDataValue = function(_start, _count)
	{
		try
		{
			// If the method is called from interval timer, for loop will not be used as the _start and _count will be determined previously with the number to receive in single call.
			// If interval timer is not used, use loop until this.maxLimitRange to process multiple times.
			for ( var i=_start ; i <= _count ; i += this.maxLimitRange )
			{
				// Create Query object
				var query = new TenkenARvalue.QuadQuery();
				query.type = "RECORDSANDCOUNT";
				// Set to receive single data by not setting END value if 1 is specified.
				if ( 1 == this.maxLimitRange )
				{
					query.limitRange = new TenkenARvalue.Range(1);
				}
				else
				{
					query.limitRange = new TenkenARvalue.Range(i,_count);
				}
				query.qattributeOrderIndexRange = new TenkenARvalue.Range(1,100);

				// Set qtype where operator data is registered
				query.qtypeNameRanges = new Array(new TenkenARvalue.Range(this.tablename));

				// Set query parameter
				if ( null != this.where )
				{
					query.whereExpressions=this.where;
				}

				// Set sort parameter
				if ( null != this.sort )
				{
					query.sortOrderExpressions=this.sort;
				}

				// Transform to string
				var getQuery = TenkenARvalue.makeQuadQuery(query);

				// Retrieve checklist data from AR server
				AR.Data.getArServerData(
					getQuery,
					this.reload,
					this.getArDataSuccess.bind(this),
					this.getArDataError.bind(this)
					);
			}
		}
		catch(e)
		{
			TenkenARdebugException("TenkenARdata.getARDataValue" , e);
		}
	};

	this.getArDataInterval = function()
	{
		try
		{
			if ( this.dataCount >= this.dataMaxCount )
			{
				// End as we've processed until the end.
				this.stopIntervalAction();

				return;
			}

			if ( this.dataNextCount <= this.dataCount )
			{
				var startCnt = this.dataNextCount;
				if ( ( this.dataMaxCount - this.dataNextCount ) < this.maxLimitRange )
				{
					this.dataNextCount = this.dataMaxCount;
				}
				else
				{
					this.dataNextCount += this.maxLimitRange;
				}

				this.getArDataValue((startCnt + 1), this.dataNextCount);
			}

		}
		catch (e)
		{
			TenkenARdebugException("getArDataInterval" , e);
		}

		return;
	}

	// Data receive will occur in loops of max data count
	this.getArData = function(_onSuccess, _onError)
	{
		try
		{
			// Do not process if it's already communicating
			if ( true == this.busy )
			{
				return;
			}
			// Set busy flag
			this.busy=true;
			// Set communication complete flat to false (processing state)
			this.complete=false

			this.dataGetValue=null;
			this.dataCount=0;
			this.dataMaxCount=0;
			this.result=null;
			this.status=null;
			this.detail=null;


			this.callBackGetDataSuccess=_onSuccess;
			this.callBackGetDataError=_onError;

			this.getArDataCount(this.getArDataCountSuccess2.bind(this), this.getArDataCountError2.bind(this));
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.getARDataCount" , e);
		}
	}

	// Start the interval timer
	this.setIntervalFunc = function(_funcname)
	{
		try
		{
		// Don't register if it's already set
		if ( null == this.IntervalId && null != _funcname )
		{
			this.IntervalId = setInterval(_funcname, this.IntervalTimer);
		}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.setIntervalFunc" , e);
		}
	}

	// Stop the interval timer
	this.stopIntervalAction = function()
	{
		try
		{
		if ( null != this.IntervalId )
		{
			clearInterval(this.IntervalId);
			this.IntervalId = null;
		}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.stopIntervalAction" , e);
		}
	};

	// Common process after data retreival
	this.completeGetData = function()
	{
		// Set communication status to off
		this.busy=false;
		// Set communication completion flag to true (finished)
		this.complete=true;
	}
	// Common process after finishing data send
	this.completePostData = function()
	{
		// Set communication status to off
		this.busy=false;
		// Set communication completion flag to true (finished)
		this.complete=true;
	}

	// Add send data.
	// Define by each Quad.
	this.addPostData = function(_postData)
	{
		if ( null != _postData )
		{
			this.dataPostValue.push(_postData);
		}
	}

	// Clear send data
	this.clearPostData = function()
	{
		this.dataPostValue.length=0;
	}

	// Send data of specified range
	this.postArDataValue = function(_start, _count)
	{
		try
		{

		// For loop will not occur if interval timer is used, since _start and _count is pre-defined.
		// If interval timer is not used, we will loop until this.maxLimitRange is met.
		for ( var i = _start ; i < _count ; i++ )
		{
			if ( null != this.dataPostValue[i] )
			{
				AR.Data.postArServerData(
								"quads",
								this.dataPostValue[i],
								this.postArDataSuccess.bind(this),
								this.postArDataError.bind(this)
				);
			}
		}
		}
		catch (e)
		{
			this.dataSendNGCount++;
			TenkenARdebugException("TenkenARdata.postArDataValue" , e);
		}
	}

	// Interval timer for sending data
	this.postArDataInterval = function()
	{
		try
		{
			if ( 0 < this.dataSendNGCount )
			{
				// Stop sending data as there is error on some data
				this.stopIntervalAction();

				// Commpon process upon completion of data send
				this.completePostData();

				if ( this.callBackPostDataError ) this.callBackPostDataError(this.result);
				return;
			}

			if ( this.dataSendOKCount >= this.dataMaxCount )
			{
				// End as entire data has been sent
				this.stopIntervalAction();
				this.dataPostValue.length = 0;

				// Common process upon completion of data send
				this.completePostData();

				if ( this.callBackPostDataSuccess ) this.callBackPostDataSuccess(this.result);

				return;
			}

			if ( this.dataNextCount <= this.dataSendOKCount )
			{
				var startCnt = this.dataNextCount;
				if ( ( this.dataMaxCount - this.dataNextCount ) < this.maxLimitRange )
				{
					this.dataNextCount = this.dataMaxCount;
				}
				else
				{
					this.dataNextCount += this.maxLimitRange;
				}

				this.postArDataValue(startCnt, this.dataNextCount);
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.postArDataInterval" , e);
			this.stopIntervalAction();
		}

		return;
	}


	// Data send
	this.postArData = function(_onSuccess, _onError)
	{
		try
		{
			// Don't process if it's already communicating
			if ( true == this.busy )
			{
				return;
			}
			if ( this.dataPostValue.length <= 0 )
			{
				// Don't process as there is no data to send.
				// As result is not present, success callback method will not be called.
				return;
			}

			// Set busy flag ON
			this.busy=true;
			// Set communication completion flag to false (still in progress)
			this.complete=false

			this.callBackPostDataSuccess=_onSuccess;
			this.callBackPostDataError=_onError;

			this.dataSendOKCount = 0;
			this.dataSendNGCount = 0;
			this.dataNextCount = 0;

			this.dataMaxCount = this.dataPostValue.length;


			if ( null != this.IntervalTime && 0 < this.IntervalTime )
			{
				// Set the timer and send the result in the timer's method
				this.startIntervalAction("post");
			}
			else
			{
				// Send data without using interval timer.
				// This will send all data from the 1st to maxCount
				var countNext=0;
				var countAll=this.dataMaxCount
				for ( var i=0 ; i < countAll ; i += this.maxLimitRange )
				{
					if ( ( countAll - i ) < this.maxLimitRange )
					{
						countNext += ( countAll - i );
					}
					else
					{
						countNext += this.maxLimitRange;
					}

					this.postArDataValue(i, countNext);
				}
			}

		}
		catch(e) {
			alert("Error occurred while uploading data\n" + e);
			return false;
		}
	}


	// Success callback method upon data send
	this.postArDataSuccess = function(_result)
	{
		try
		{

			this.dataSendOKCount++;

			if ( this.dataMaxCount <= (this.dataSendOKCount +  this.dataSendNGCount))
			{
				// Process completion method when interval timer is not used.
				// If interval timer is used, completion will be processed inside the timer.
				if ( null != this.IntervalTime && this.IntervalTime <= 0 )
				{
					// Common process after the data send complete
					this.completePostData();

					if (  0 < this.dataSendNGCount )
					{
						if ( this.callBackPostDataError ) this.callBackPostDataError(this.result);
					}

					else
					{
						if ( this.callBackPostDataSuccess ) this.callBackPostDataSuccess(_result);
					}
				}
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.postArDataSuccess" , e);
		}
	};

	// Error callback upon data send
	this.postArDataError = function(_result)
	{
		try
		{

			// Clear the timer.
			this.stopIntervalAction();

			var message = "Error occurred while uploading data. Please confirm operation mode and network connectivity and retry.";
			var detail="";
			var strCount = ":count=" + this.dataMaxCount + "," + this.dataNextCount + "," + this.dataSendOKCount + "," + this.dataSendNGCount;

			if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
				detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText + strCount;
			} else {
				detail += _result.getStatus() + "\n"+ _result.getValue() + strCount;
			}

			this.dataSendNGCount++;
			if ( this.dataNextCount <= (this.dataSendOKCount +  this.dataSendNGCount))
			{
				// Common process after data sending is complete
				this.completePostData();

				if ( this.callBackPostDataError ) this.callBackPostDataError(_result);
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.postArDataError" , e);
		}
	};

	// Add data to delete.
	// Deletion data is by QEntity. (NOTE: Not by QAttribute of QValue)
	//   _deleteData : Set TenkenARvalue.QDelete
	this.addDeleteData = function(_deleteData)
	{
		if ( null != _deleteData )
		{
			this.dataDelete.push(_deleteData);
		}
	}

	// Clear delete data
	this.clearDeleteData = function()
	{
		this.dataDelete.length=0;
	}

	// Request to delete the range specified
	this.deleteArDataValue = function(_start, _count)
	{
		try
		{

		for ( var i = _start ; i < _count ; i++ )
		{
			if ( null != this.dataDelete[i] )
			{
				var deleteMsg=this.dataDelete[i];
				var strQuery="qentities/" +  this.tablename + "/" + deleteMsg.qentityid;

				AR.Data.deleteArServerData(
								strQuery,
								deleteMsg.version,
								this.deleteArDataSuccess.bind(this),
								this.deleteArDataError.bind(this)
				);
			}
		}
		}
		catch (e)
		{
			this.dataSendNGCount++;
			TenkenARdebugException("TenkenARdata.deleteArDataValue" , e);
		}
	}

	// Interval timer used for deleting
	this.deleteArDataInterval = function()
	{
		try
		{
			if ( 0 < this.dataSendNGCount )
			{
				// Stop delete process as some data has an error
				this.stopIntervalAction();

				// Common process upon completion of data delete
				this.completeDeleteData();

				if ( this.callBackDeleteDataError ) this.callBackDeleteDataError(this.result);
				return;
			}

			if ( this.dataSendOKCount >= this.dataMaxCount )
			{
				// End as we've deleted the entire data
				this.stopIntervalAction();
				this.dataDelete.length = 0;

				// Common process upon completion of data delete
				this.completeDeleteData();

				if ( this.callBackDeleteDataSuccess ) this.callBackDeleteDataSuccess(this.result);

				return;
			}

			if ( this.dataNextCount <= this.dataSendOKCount )
			{
				var startCnt = this.dataNextCount;
				if ( ( this.dataMaxCount - this.dataNextCount ) < this.maxLimitRange )
				{
					this.dataNextCount = this.dataMaxCount;
				}
				else
				{
					this.dataNextCount += this.maxLimitRange;
				}

				this.deleteArDataValue(startCnt, this.dataNextCount);
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.deleteArDataInterval" , e);
			this.stopIntervalAction();
		}

		return;
	}

	// Delete Data
	this.deleteArData = function(_onSuccess, _onError)
	{
		try
		{
			// Don't process if it's already communicating
			if ( true == this.busy )
			{
				return;
			}
			if ( this.dataDelete.length <= 0 )
			{
				// Don't process as there is no data to delete
				return;
			}

			// Set communication flag ON
			this.busy=true;
			// Set complition flag to false (in progress)
			this.complete=false

			this.callBackDeleteDataSuccess=_onSuccess;
			this.callBackDeleteDataError=_onError;

			this.dataSendOKCount = 0;
			this.dataSendNGCount = 0;
			this.dataNextCount = 0;

			this.dataMaxCount = this.dataDelete.length;

			if ( null != this.IntervalTime && 0 < this.IntervalTime )
			{
				// Set the timer, and delete within that method
				this.startIntervalAction("delete");
			}
			else
			{
				// Delete data without using interval timer.
				// Delete per maxCount from the 1st object
				var countNext=0;
				var countAll=this.dataMaxCount
				for ( var i=0 ; i < countAll ; i += this.maxLimitRange )
				{
					if ( ( countAll - i ) < this.maxLimitRange )
					{
						countNext += ( countAll - i );
					}
					else
					{
						countNext += this.maxLimitRange;
					}

					this.deleteArDataValue(i, countNext);
				}
			}

		}
		catch(e) {
			alert("Error occurred during data upload\n" + e);
			return false;
		}
	}


	// Succss callback upon data deletion
	this.deleteArDataSuccess = function(_result)
	{
		try
		{

			this.dataSendOKCount++;

			if ( this.dataMaxCount <= (this.dataSendOKCount +  this.dataSendNGCount))
			{
				// Process completion methods when iterval timer is not defined.
				// If interval timer is defined, completion methods will be handled inside timer object
				if ( null != this.IntervalTime && this.IntervalTime <= 0 )
				{
					// Common process after data deletion
					this.completeDeleteData();

					if (  0 < this.dataSendNGCount )
					{
						if ( this.callBackDeleteDataError ) this.callBackDeleteDataError(this.result);
					}
					else
					{
						if ( this.callBackDeleteDataSuccess ) this.callBackDeleteDataSuccess(_result);
					}
				}
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.deleteArDataSuccess" , e);
		}
	};

	// Error callback method on data deletion
	this.deleteArDataError = function(_result)
	{
		try
		{

			// Clear the timer
			this.stopIntervalAction();

			var message = "Error occurred while uploading data. Please confirm operation mode and network connectivity and retry.";
			var detail="";
			var ErrorStatus=0;

			var strCount = ":count=" + this.dataMaxCount + "," + this.dataNextCount + "," + this.dataSendOKCount + "," + this.dataSendNGCount;

			if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
				detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText + strCount;
				ErrorStatus=_result.getValue().status;
			} else {
				detail += _result.getStatus() + "\n"+ _result.getValue() + strCount;
			}

			// It sometimes return with 404 Not Found upon delete.
			// When 404 is returned, process the same as success.
			if ( 404 == ErrorStatus )
			{
				this.dataSendOKCount++;

				if ( this.dataMaxCount <= (this.dataSendOKCount +  this.dataSendNGCount))
				{
					// Common process after data deletion
					this.completeDeleteData();

					if (  0 < this.dataSendNGCount )
					{
						if ( this.callBackDeleteDataError ) this.callBackDeleteDataError(_result);
					}
					else
					{
						if ( this.callBackDeleteDataSuccess ) this.callBackDeleteDataSuccess(_result);
					}
				}
			}
			else
			{
				this.dataSendNGCount++;
				if ( this.dataNextCount <= (this.dataSendOKCount +  this.dataSendNGCount))
				{
					// Common process after data deletion
					this.completeDeleteData();

					if ( this.callBackDeleteDataError ) this.callBackDeleteDataError(_result);
				}
			}
		}
		catch (e)
		{
			TenkenARdebugException("TenkenARdata.deleteArDataError" , e);
		}
	};

	// Common process after data deletion
	this.completeDeleteData = function()
	{
		// Set busy flat to OFF
		this.busy=false;
		// Set communication complete flag to true (completed)
		this.complete=true;
	}

}
