/**
 * @overview JavaScript API (Data management) for Tenken Application
 * @copyright Copyright 2014 FUJITSU LIMITED
 */

var TenkenData = {};

//============================================================================
// Common methods and valiables
//============================================================================

// Set force reload mode
TenkenData.setSuperReloadMode = function(_mode)
{
	// Force reload mode
	Tenken.config.SuperReload=_mode;
}
// Get force reload mode
TenkenData.getSuperReloadMode = function()
{
	return(Tenken.config.SuperReload);
}

//============================================================================
// Scenario data management
//============================================================================

// Data management class (Scenario)
TenkenData.Scenario = {};

// Create TenkenARdata to receive data from AR server
TenkenData.Scenario.arScenario=new TenkenARdata(TenkenConst.TableName.scenario);
// Memory region to manage data (Scenario)
TenkenData.Scenario.ListAll = [];

// Current seleted scenario name
TenkenData.Scenario.ScenarioName = null;

// Process TenkenData obtained from the server and copy it. 
TenkenData.Scenario.createDataList = function()
{
	try
	{
		if ( null == TenkenData.Scenario.arScenario ) return;

		var datas = TenkenData.Scenario.arScenario.getDataValue();
		if ( null == datas ) return;
		if ( null == TenkenData.Scenario.ListAll ) return;

		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var dataValue = datas[i];
			if ( null != dataValue )
			{
				var newObj=new Object();
				// Check if it's target scenario
				if ( dataValue.ar_description )
				{
					if ( -1 == dataValue.ar_description.indexOf("#tenken#")  )
					{
						// Skip to next scenario since it's not the target
						continue;
					}
				}
				else
				{
					// Skip to next scenario as scenario without the description is not the target.
					continue;
				}

				// Cope all data (per QAttribute)
				for ( var name in dataValue )
				{
					switch ( name )
					{
					case "ar_name":
						newObj.name=dataValue[name];
						break
					case "ar_description":
						newObj.description=dataValue[name];
						break
					case "ar_id":
						newObj.scenarioId=dataValue[name];
						break
					default:
						newObj[name]=dataValue[name];
						break;
					}
				}

				TenkenData.Scenario.ListAll.push(newObj);
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.Scenario.createDataList\n" + e);
	}
}

// Success callback method upon data retrieval (Scenario)
TenkenData.Scenario.cbDataSuccessScenario = function(_result)
{
	try
	{
		// Copy obtained data
		TenkenData.Scenario.ListAll.length = 0;
		TenkenData.Scenario.createDataList();

		if ( TenkenData.Scenario.ListAll.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(null, null, null, "Scenario is not registered, or the scenario does not exist.\nPlease register scenario for Tenken.", null);
			return;
		}

		TenkenData.AllGet.saveStorageScenario();

		// Call download completion callback method (if registered), and operator list of operator selection dialog when scenario data download is complete.
		var elm = document.getElementById("selectScenarioId");

		if ( null != TenkenData.AllGet.downloadScenarioSuccessFunc )
		{
			TenkenData.AllGet.downloadScenarioSuccessFunc();
		}

	}
	catch (e)
	{
		alert("Exception : cbDataSuccessScenario\n" + e);
	}
}

// Error callback method upon data retrieval (Scenario)
TenkenData.Scenario.cbDataErrorScenario = function(_result)
{
	var message = "Failed to obtain data (scenario) from AR server. Please check operation mode and network connectivity to try again.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}
	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:Scenario:" + message , detail);

	if ( null != TenkenData.AllGet.downloadScenarioErrorFunc )
	{
		// Clear callback so that it only calls once
		var func=TenkenData.AllGet.downloadScenarioErrorFunc;
		TenkenData.AllGet.downloadScenarioErrorFunc=null;
		func(detail);
	}
}

// Retrieve data from AR Server. (Scenario)
TenkenData.Scenario.getScenario = function()
{
	try
	{
		if ( null == TenkenData.Scenario.arScenario )
		{
			TenkenData.Scenario.arScenario=new TenkenARdata(TenkenConst.TableName.scenario);
		}
		if ( TenkenData.Scenario.arScenario.getBusyStatus() == true )
		{
			alert("Communication in process.\nPlease retry again at later time.");
			return;
		}

		// Set force reload mode.
		TenkenData.Scenario.arScenario.setReload(TenkenData.getSuperReloadMode());

		// Query param: none
		// Initialize query parameter
		TenkenData.Scenario.arScenario.clearWhere();

		// Sort param: scenario ID
		// Initialize sort parameter
		TenkenData.Scenario.arScenario.clearSort();
		// Set sort order
		TenkenData.Scenario.arScenario.setSortDesc(false);
		// Sort query: Scene ID
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.Scenario.arScenario.addSort("ar_id", null, "0", "9223372036854775000", "LONG");


		// Retrieve data
		TenkenData.Scenario.arScenario.getArData(TenkenData.Scenario.cbDataSuccessScenario, TenkenData.Scenario.cbDataErrorScenario);
	}
	catch (e)
	{
		alert("Exception: getScenario\n" + e);
	}
}

// Save data to local storage (Scenario)
TenkenData.Scenario.saveStorage = function()
{
	Tenken.Storage.ScenarioList.set(JSON.stringify(TenkenData.Scenario.ListAll));
	if ( null != TenkenData.Scenario.ScenarioName )
	{
		Tenken.Storage.ScenarioName.set(JSON.stringify(TenkenData.Scenario.ScenarioName));
	}
};

// Load data from loacl storage (Scenario)
TenkenData.Scenario.loadStorage = function()
{
	var data=Tenken.Storage.ScenarioList.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.Scenario.ListAll=tmplist;
		}
		else
		{
			TenkenData.Scenario.ListAll.length=0;
		}
		tmplist = JSON.parse(Tenken.Storage.ScenarioName.get());
		if ( null != tmplist )
		{
			TenkenData.Scenario.ScenarioName = tmplist;
		}
		else
		{
			TenkenData.Scenario.ScenarioName = null;
		}
	}
	else
	{
		TenkenData.Scenario.ListAll.length=0;
		TenkenData.Scenario.ScenarioName = null;
	}
};


// Set current working scenario name
TenkenData.Scenario.setScenarioName = function(_nameScenario)
{
	TenkenData.Scenario.ScenarioName=_nameScenario;
};

// Get current working scenario name
TenkenData.Scenario.getScenarioName = function()
{
	return(TenkenData.Scenario.ScenarioName);
};

// Get Scenario name from Scenario ID
TenkenData.Scenario.getScenarioNameFromId = function(_id)
{
	var nameScenario = null;

	if ( !_id || _id <=0 )
	{
		// Return null since it's invalid scenario ID or everything is the target (=0)
		return(null);
	}

	if ( null == TenkenData.Scenario.ListAll || 0 == TenkenData.Scenario.ListAll.length )
	{
		// If Scenario data is not present, load from local storage
		TenkenData.Scenario.loadStorage();
	}
	if ( null == TenkenData.Scenario.ListAll || 0 == TenkenData.Scenario.ListAll.length )
	{
		// return null as there is no scenario data
		return(null);
	}

	// Search from scenario list
	var lenScenaio=TenkenData.Scenario.ListAll.length;
	for ( var i=0 ; i < lenScenaio; i++ )
	{
		if ( _id == TenkenData.Scenario.ListAll[i].scenarioId )
		{
			nameScenario=TenkenData.Scenario.ListAll[i].name;
			break;
		}
	}

	return(nameScenario);
};

// Append downloaded scenario data as selection of the specified select tag element.
TenkenData.Scenario.selectScenarioNameHTML = function(_select)
{

	if ( _select )
	{
		TenkenData.Scenario.loadStorage();

		var lenScenario = TenkenData.Scenario.ListAll.length;

		if ( 0 < lenScenario )
		{
			_select.length=(lenScenario + 1);
			_select.options[0].text="Select";
			for ( var i = 0 ; i < lenScenario ; i++ )
			{
				_select.options[i+1].text=TenkenData.Scenario.ListAll[i].name;
				_select.options[i+1].value=TenkenData.Scenario.ListAll[i].scenarioId;
			}

		}
		else
		{
			_select.length=2;
			_select.options[0].text="Select";
			_select.options[1].text="(Download)";
			_select.options[0].value="";
			_select.options[1].value="";
	}
	}
};

//============================================================================
// Data management of Scenes
//============================================================================

// Data management class (Scene)
TenkenData.Scene = {};

// Create TenkenARdata to send and receive data from AR Server
TenkenData.Scene.arScene=new TenkenARdata(TenkenConst.TableName.scene);

// Data management region (Scene)
TenkenData.Scene.ListAll = [];

// To store downloaded scene name list
TenkenData.Scene.SceneNames = null;

// Process and copy retrieved TenkenData 
TenkenData.Scene.createDataList = function()
{
	try
	{
		if ( null == TenkenData.Scene.arScene ) return;

		var datas = TenkenData.Scene.arScene.getDataValue();
		if ( null == datas ) return;
		if ( null == TenkenData.Scene.ListAll ) return;

		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var dataValue = datas[i];
			if ( null != dataValue )
			{
				var newObj=new Object();
				// Copy entire data (per Qttribute)
				for ( var name in dataValue )
				{
					switch ( name )
					{
					case "ar_name":
						newObj.name=dataValue[name];
						break
					case "ar_description":
						newObj.description=dataValue[name];
						break
					case "ar_id":
						newObj.sceneid=dataValue[name];
						break
					default:
						newObj[name]=dataValue[name];
						break;
					}
				}

				if ( null == TenkenData.Scene.SceneNames )
				{
					TenkenData.Scene.SceneNames = new Object();
				}

				// Save scene name
				TenkenData.Scene.SceneNames[newObj.sceneid]=newObj.name;

				// Determine to display messages and asset names.
				// If following string is specified in the message (ar_description)
				// we need to display them. (case-sensitive)
				//
				//   #MSG#   : messages
				//   #TENKEN# : display asset names
				//

				if ( newObj.description )
				{
					if ( 0 <= newObj.description.indexOf("#MSG#") )
					{
						newObj.dispMSG=true;
					}
					if ( 0 <= newObj.description.indexOf("#TENKEN#") )
					{
						newObj.dispASSET=true;
					}
				}

				TenkenData.Scene.ListAll.push(newObj);
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.Scene.createDataList \n" + e);
	}
}

// Success callback method upon data retrieval
TenkenData.Scene.cbDataSuccessScene = function(_result)
{
	try
	{
		// copy data retrieved
		TenkenData.Scene.ListAll.length=0;
		TenkenData.Scene.createDataList();

		if ( TenkenData.AllGet.getPhase() == false )
		{
			TenkenData.AllGet.afterDownload();
		}

	}
	catch (e)
	{
		alert("Exception : TenkenData.Scene.cbDataSuccessScene\n" + e);
	}
}

// Error callback handler upon data retrieval. (Scene)
TenkenData.Scene.cbDataErrorScene = function(_result)
{
	var message = "Failed to download data (Scene) from AR server. Please check operation mode and network connectivity.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:Scene:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Get data from AR server (Scene)
TenkenData.Scene.getScene = function()
{
	try
	{
		if ( null == TenkenData.Scene.arScene )
		{
			TenkenData.Scene.arScene=new TenkenARdata(TenkenConst.TableName.scene);
		}
		if ( TenkenData.Scene.arScene.getBusyStatus() == true )
		{
			alert("Communication in progress.\nPlease retry at later time.");
			return;
		}

		// Set force reload
		TenkenData.Scene.arScene.setReload(TenkenData.getSuperReloadMode());

		// Query param:
		// Initialize query param
		TenkenData.Scene.arScene.clearWhere();
		// Query 1: Set selected scenario ID
		TenkenData.Scene.arScene.addWhere("arscn_scenarioid", null, Tenken.config.ScenarioId, null, "LONG");

		// Sort param:
		TenkenData.Scene.arScene.clearSort();
		// Set sort order
		TenkenData.Scene.arScene.setSortDesc(false);
		// Sort query: Scene ID
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.Scene.arScene.addSort("ar_id", null, "0", "9223372036854775000", "LONG");
		// Retrieve data
		TenkenData.Scene.arScene.getArData(TenkenData.Scene.cbDataSuccessScene, TenkenData.Scene.cbDataErrorScene);
	}
	catch (e)
	{
		alert("Exception: TenkenData.Scene.getScene\n" + e);
	}
}

// Store data to local storage (scene)
TenkenData.Scene.saveStorage = function()
{
	Tenken.Storage.SceneList.set(JSON.stringify(TenkenData.Scene.ListAll));
	if ( null !=TenkenData.Scene.SceneNames )
	{
		Tenken.Storage.SceneNames.set(JSON.stringify(TenkenData.Scene.SceneNames));
	}
};

// Load data from local storage (scene)
TenkenData.Scene.loadStorage = function()
{
	var data=Tenken.Storage.SceneList.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.Scene.ListAll = tmplist;
		}
		else
		{
			TenkenData.Scene.ListAll.length = 0;
		}

		tmplist = JSON.parse(Tenken.Storage.SceneNames.get());
		if ( null != tmplist )
		{
			TenkenData.Scene.SceneNames = tmplist;
		}
		else
		{
			TenkenData.Scene.SceneNames = null;
		}
	}
	else
	{
			TenkenData.Scene.ListAll.length = 0;
			TenkenData.Scene.SceneNames = null;
	}
};

// Get scene name
TenkenData.Scene.getSceneName = function(_sceneid)
{
	if ( null != TenkenData.Scene.SceneNames && null != TenkenData.Scene.SceneNames[_sceneid] )
	{
		return(TenkenData.Scene.SceneNames[_sceneid]);
	}
	return null;
};


//============================================================================
// Manage AR overlay data
//============================================================================

// Class to manage data (AR overlay data)
TenkenData.SuperimposedGraphic = {};

// Create TenkenARdata to send/receive data from AR server
TenkenData.SuperimposedGraphic.arSuperimposedGraphic=new TenkenARdata(TenkenConst.TableName.SuperimposedGraphic);
;
// Data management region for AR overlay data. Use with object type.
TenkenData.SuperimposedGraphic.objSuperimposedGraphics=null;

// To store selected scenario ID, scene ID, and marker ID
TenkenData.SuperimposedGraphic.setSecenarioId = -1;
TenkenData.SuperimposedGraphic.setSceneId = -1;
TenkenData.SuperimposedGraphic.setMarkerId = -1;

// Process and copy downloaded TenkenData
TenkenData.SuperimposedGraphic.createDataList = function()
{
	try {
	if ( null == TenkenData.SuperimposedGraphic.arSuperimposedGraphic ) return;

		var contents=null;
		var datas = TenkenData.SuperimposedGraphic.arSuperimposedGraphic.getDataValue();
		if ( null == datas ) return;
		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var sd=datas[i];
			if ( null != sd )
			{
				// Check that AR overlay data of scene ID, marker ID is not null
				var value=new Object();
				if(sd.arsen_sceneid != null && sd.armk_markerid != null)
				{
					if ( null == contents ) contents = new Object();
					var sceneId=sd.arsen_sceneid;
					var markerId=sd.armk_markerid

					var value=new Object();
					// Transform JSON representation of AR overlay data definition to an object
					if ( null != sd.arpoi_superimposedgraphic )
					{
						value = AR.Renderer.parseSuperimposedGraphic(sd.arpoi_superimposedgraphic);
					}

					if( null == contents[sceneId]) contents[sceneId] = new Object();
					if( null == contents[sceneId][markerId])
					{
						contents[sceneId][markerId] = new Array(value);
					}
					else
					{
						contents[sceneId][markerId].push(value);
					}
				}
			}
		}

		// Store processed AR overlay data into per scene ID and marker ID
		if ( null != contents )
		{
			for(scene in contents)
			{
				if( null == TenkenData.SuperimposedGraphic.objSuperimposedGraphics ) TenkenData.SuperimposedGraphic.objSuperimposedGraphics = new Object();

				if(TenkenData.SuperimposedGraphic.objSuperimposedGraphics[scene] == null)
				{
					TenkenData.SuperimposedGraphic.objSuperimposedGraphics[scene] = contents[scene];
				}
				else
				{
					for(marker in contents[scene])
					{
						TenkenData.SuperimposedGraphic.objSuperimposedGraphics[scene][marker] = contents[scene][marker];
					}
				}
			}
		}

	}
	catch(e)
	{
		alert("Exception : TenkenData.SuperimposedGraphic.createDataList\n" + e);
	}
}

// Success callback method upon data retrieval (AR overlay data)
TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic = function(_result)
{
	try
	{
		// Copy retrieved data
		TenkenData.SuperimposedGraphic.objSuperimposedGraphics=null;
		TenkenData.SuperimposedGraphic.createDataList();

	}
	catch (e)
	{
		alert("Exception : TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic\n" + e);
	}
}

// Error callback method upon data retrieval (AR overlay data)
TenkenData.SuperimposedGraphic.cbDataErrorSuperimposedGraphic = function(_result)
{
	var message = "Failed to download data (AR overlay data) from AR server. Please check operation mode and network connectivity to try again.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:SuperimposedGraphic:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Retrieve data from AR server (AR Overlay data)
TenkenData.SuperimposedGraphic.getSuperimposedGraphic = function(_scenarioId, _sceneId, _markerId)
{
	try
	{
		if ( null == TenkenData.SuperimposedGraphic.arSuperimposedGraphic )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic=new TenkenARdata(TenkenConst.TableName.SuperimposedGraphic);
		}
		if ( TenkenData.SuperimposedGraphic.arSuperimposedGraphic.getBusyStatus() == true )
		{
			alert("Communication in progress.\nPlease try again at later time.");
			return;
		}

		// Set force reload mode.
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.setReload(TenkenData.getSuperReloadMode());

		// Query parameter:
		// Initialize query 
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.clearWhere();

		// Query 1: scenario ID
		if ( null != _scenarioId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("arscn_scenarioid", null, _scenarioId, null, "LONG");
		}
		// Query 2: scene ID
		if ( null != _sceneId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("arsen_sceneid", null, _sceneId, null, "LONG");
		}
		// Query 3: marker ID
		if ( null != _markerId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("armk_markerid", null, _markerId, null, "LONG");
		}

		// Sort paramenter: none
		// Initialize sort parameter
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.clearSort();
		// Set sort older to ascending
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.setSortDesc(false);
		// Retrieve data
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.getArData(
			TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic,
			TenkenData.SuperimposedGraphic.cbDataErrorSuperimposedGraphic);
	}
	catch (e)
	{
		alert("Exception: TenkenData.SuperimposedGraphic.getSuperimposedGraphic\n" + e);
	}
}

// Store data to local storage (AR Overlay data)
TenkenData.SuperimposedGraphic.saveStorage = function()
{
	if(TenkenData.SuperimposedGraphic.objSuperimposedGraphics != null)
	{
		Tenken.Storage.SuperimposedGraphic.set(JSON.stringify(TenkenData.SuperimposedGraphic.objSuperimposedGraphics));
	}
};

// Load data from local storage (AR Overlay data)
TenkenData.SuperimposedGraphic.loadStorage = function()
{
	var data=Tenken.Storage.SuperimposedGraphic.get();
	if ( null != data )
	{
		TenkenData.SuperimposedGraphic.objSuperimposedGraphics = AR.Renderer.parseSuperimposedGraphic(data);
	}
	else
	{
		TenkenData.SuperimposedGraphic.objSuperimposedGraphics=null;
	}
};

//============================================================================
// Data management to each assets
//============================================================================
// Data managemet class (asset data)
TenkenData.Asset = {};

// Create TenkenARdata to send/receive data from server
TenkenData.Asset.arAsset=new TenkenARdata(TenkenConst.TableName.asset);

// Data management region (asset data)
TenkenData.Asset.ListAll = [];

// Process and copy downloaded TenkenData 
TenkenData.Asset.createDataList = function()
{
	try
	{
		if ( null == TenkenData.Asset.arAsset ) return;

		var datas = TenkenData.Asset.arAsset.getDataValue();
		if ( null == datas ) return;
		if ( null == TenkenData.Asset.ListAll ) return;

		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var dataValue = datas[i];
			if ( null != dataValue )
			{
				var newObj=new Object();
				// Copy entire data (per QAttribute)
				for ( var name in dataValue )
				{
					switch ( name )
					{
					case "msgICON":
						// additional message icon information
						//  (format: "icon name;icon image file")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.msgICON ) newObj.msgICON = new Array();
							newObj.msgICON.push(iconInfo);
						}
						break
					case "tenkenICON":
						// check input icon information
						//  (format: "icon name;icon image file")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.tenkenICON ) newObj.tenkenICON = new Array();
							newObj.tenkenICON.push(iconInfo);
						}
						break
					case "graphURL":
						// Check graph icon information
						//  (format: "icon name;graph URL")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.graphURL ) newObj.graphURL = new Array();
							newObj.graphURL.push(iconInfo);
						}
						break
					default:
						// Additional icon information
						//  (format: "icon name;icon image file;file name to open when tapped")
						if ( null != dataValue[name] && name.substr(0,4) == "icon" )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.listICON ) newObj.listICON = new Array();

							newObj.listICON.push(iconInfo);
						}
						else
						{
							newObj[name]=dataValue[name];
						}
						break;
					}
				}

				// Check duplicate and mandatory data
				TenkenData.Asset.checkData(newObj);

				// Add new
				TenkenData.Asset.ListAll.push(newObj);
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.Asset.createDataList\n" + e);
	}
}

// Success callback method upon data retrieval (Asset data)
TenkenData.Asset.cbDataSuccessAsset = function(_result)
{
	try
	{
		// Copy retrieved data
		TenkenData.Asset.ListAll.length=0;
		TenkenData.Asset.createDataList();

		if ( TenkenData.Asset.ListAll.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.asset, null, null, null, "None of valid asset data is registered.\nPlease register asset data.\n", null);
			return;
		}

		if ( TenkenData.AllGet.getPhase() == false )
		{
			TenkenData.AllGet.afterDownload();
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.Asset.cbDataSuccessAsset\n" + e);
	}
}

// Error callback method upon data retrieval (Asset data)
TenkenData.Asset.cbDataErrorAsset = function(_result)
{
	var message = "Failed to download data (Asset list) from AR server. Please check operation mode and network connectivity to try again.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:Asset:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Retrieve data from AR Server (Asset data)
TenkenData.Asset.getLastData = function()
{
	try
	{
		if ( null == TenkenData.Asset.arAsset )
		{
			TenkenData.Asset.arAsset=new TenkenARdata(TenkenConst.TableName.asset);
		}
		if ( TenkenData.Asset.arAsset.getBusyStatus() == true )
		{
			alert("Communication in progress.\nPlease try again at later time.");
			return;
		}

		// Set force reload mode
		TenkenData.Asset.arAsset.setReload(TenkenData.getSuperReloadMode());

		// Query parameter:none
		// Initialize query parameter
		TenkenData.Asset.arAsset.clearWhere();

		// Sort parameter:
		// Initialize sort parameter
		TenkenData.Asset.arAsset.clearSort();
		// Set sort order to ascdending
		TenkenData.Asset.arAsset.setSortDesc(false);
		// Sort query: marker ID
		// Marker ID of 0 do not exist in AR, but is specified here to use marker ID of 0 as an asset that do not use markers
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.Asset.arAsset.addSort("markerid", null, "0", "9223372036854775000", "LONG")
		// Retrieve data
		TenkenData.Asset.arAsset.getArData(TenkenData.Asset.cbDataSuccessAsset, TenkenData.Asset.cbDataErrorAsset);
	}
	catch (e)
	{
		alert("Exception: TenkenData.Asset.getAsset\n" + e);
	}
}

// Check mandatory and duplicate data of received data.
// If there is an issue in data, output data error and return to initial screen.
//
// Check item
// QAttribute name : Check item
// assetid       : null  duplicate
// assetname     : null  duplicate
// markerid      : null  duplicate
// markername    : null  duplicate
TenkenData.Asset.checkData = function(_data)
{
	try
	{
		var err=false;
		var errName=null;
		var errValue=null;
		var errMsg=null;

		if ( null == _data ) return;

		// Check null (value is mandatory)
		if ( null == _data.assetid )
		{
			err=true;
			errName="assetid";
		}
		else if ( null == _data.assetname )
		{
			err=true;
			errName="assetname";
		}
		else if ( null == _data.markerid )
		{
			err=true;
			errName="markerid";
		}
		else if ( null == _data.markername )
		{
			err=true;
			errName="markername";
		}
		if ( true == err )
		{
			errMsg="Mandatory data is missing.";
		}
		else
		{
			// Check duplicate
			var len=TenkenData.Asset.ListAll.length;
			for ( var i = 0 ; i < len ; i++ )
			{
				var ad=TenkenData.Asset.ListAll[i];
				if ( _data.assetid == ad.assetid )
				{
					err=true;
					errName="assetid";
					errValue=_data.assetid;
				}
				else if ( _data.assetname == ad.assetname )
				{
					err=true;
					errName="assetname";
					errValue=_data.assetname;
				}
				else if ( _data.markerid == ad.markerid )
				{
					err=true;
					errName="markerid";
					errValue=_data.markerid;
				}
				else if ( _data.markername == ad.markername )
				{
					err=true;
					errName="markername";
					errValue=_data.markername;
				}
			}
			if ( true == err )
			{
				errMsg="Duplicate data found.";
			}
		}

		// If error exist in data, output message and return to the initial screen.
		if ( true == err )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.asset, errName, errValue, null, errMsg);
		}
	}
	catch (e)
	{
		alert("Exception: TenkenData.Asset.checkData\n" + e);
	}
}

// Storage data into local storage (Asset data)
TenkenData.Asset.saveStorage = function()
{
	Tenken.Storage.lastAssetData.set(JSON.stringify(TenkenData.Asset.ListAll));
};

// Load data from local storage (Asset data)
TenkenData.Asset.loadStorage = function()
{
	var data=Tenken.Storage.lastAssetData.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.Asset.ListAll = tmplist;
		}
		else
		{
			TenkenData.Asset.ListAll.length = 0;
		}
	}
	else
	{
		TenkenData.Asset.ListAll.length = 0;
	}
};

// Get asset data (object type) from matching asset ID
TenkenData.Asset.getDatafromAssetId = function(_assetid)
{
	if ( null == _assetid || "" == _assetid )
	{
		return(null);
	}
	var qvalue=null;
	for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
	{
		if ( _assetid == TenkenData.Asset.ListAll[i].assetid )
		{
			qvalue = TenkenData.Asset.ListAll[i];
			break;
		}
	}
	return(qvalue);
}

// Get marker ID of the matching asset ID
TenkenData.Asset.getMarkerIdfromAssetId = function(_assetid)
{
	if ( null == _assetid || "" == _assetid )
	{
		return(null);
	}
	var markerid=-1;
	for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
	{
		if ( _assetid == TenkenData.Asset.ListAll[i].assetid )
		{
			markerid = TenkenData.Asset.ListAll[i].markerid;
			break;
		}
	}
	return(markerid);
}

// Get asset name from the matching marker ID
TenkenData.Asset.getAssetNamefromMarkerId = function(_markerid)
{
	if ( 0 >= TenkenData.Asset.ListAll.length )
	{
		return(-1);
	}

	var assetname = "";
	for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
	{
		if ( _markerid == TenkenData.Asset.ListAll[i].markerid )
		{
			assetname = TenkenData.Asset.ListAll[i].assetname;
			break;
		}
	}
	return(assetname);
}

// Get Asset data (object type) of the matching marker ID
TenkenData.Asset.getDatafromMarkerId = function(_markerid)
{
	var qvalue=null;
	for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
	{
		if ( _markerid == TenkenData.Asset.ListAll[i].markerid )
		{
			qvalue = TenkenData.Asset.ListAll[i];
			break;
		}
	}
	return(qvalue);
}

// Get entire asset data (object type) array of the matching marker ID
TenkenData.Asset.getDataListfromMarkerId = function(_markerid)
{
	var ret = [];
	for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
	{
		if ( _markerid == TenkenData.Asset.ListAll[i].markerid )
		{
			ret.push(TenkenData.Asset.ListAll[i]);
		}
	}
	return(ret);
}


// Delete data of specified asset ID
TenkenData.Asset.deleteAsset = function(_assetid)
{
	// Search asset id from the bottom, and delete.
	var lenList = TenkenData.Asset.ListAll.length;
	for ( i = (lenList - 1) ; i >= 0 ; i-- )
	{
		if (_assetid == TenkenData.Asset.ListAll[i].assetid )
		{
			TenkenData.Asset.ListAll.splice(i,1);
		}
	}
}


//============================================================================
// Data management for message data
//============================================================================

// Data management class (Message data)
TenkenData.MsgEvent = {};

// Create TenkenARdata for send/retrieve data from the server (for current and previous values)
TenkenData.MsgEvent.arMessageEventLast=new TenkenARdata(TenkenConst.TableName.messageevent);
TenkenData.MsgEvent.arMessageEventCurrent=new TenkenARdata(TenkenConst.TableName.messageevent);

// Data management region (Message Data). For current and previous values
TenkenData.MsgEvent.Last = [];
TenkenData.MsgEvent.Current = [];

// Process and copy downloaded TenkenData
TenkenData.MsgEvent.createDataList = function()
{
	// Message data will not be transformed, and copied as-is.
	// Although, add process that will move display coordinate to (X,Y,Z)
	// per marker ID, so that it will not overlap with message context on the display
	try
	{
		if ( null == TenkenData.MsgEvent.arMessageEventLast || null == TenkenData.MsgEvent.Last ) return;

		var datas = TenkenData.MsgEvent.arMessageEventLast.getDataValue();
		if ( null == datas ) return;

		var countList=datas.length;
		var markerid=-1;
		var MsgList = new Object();
		var saveIndex=0;
		for ( var i=0 ; i < countList ; i++ )
		{
			markerid=-1;
			var dataValue = datas[i];
			if ( null != dataValue )
			{
				var newObj=new Object();

				// Copy entire data (per QAttribute)
				for ( var name in dataValue )
				{
					newObj[name]=dataValue[name];
					if ( "markerid" == name )
					{
						markerid=dataValue[name];
					}
				}

				if ( -1 != markerid )
				{
					if ( null == MsgList[markerid] ) MsgList[markerid]= new Array();
			;
					// Store sort order as automated message display logic per marker will change the order
					newObj.saveIndex=saveIndex++;
					MsgList[markerid].push(newObj);
				}
			}
		}

		// Register data.
		// Also, automatically change the display coordinate of messages per markers.
		// (Display as-is only if data is at X=Y=Z=0)
		var sX = window.screen.width;
		var sY = window.screen.height;
		sizeX = sX / 5120;
		sizeY = sY / 3200;
		if ( sizeX < 0.2 || sizeX > 1.0 ) sizeX = 0.5;
		if ( sizeY < 0.2 || sizeY > 1.0 ) sizeY = 0.5;
		sizeZ = sizeX;

		// Fix X=0.7, and change each Y by -0.2 starting from 0.7 per Marker ID
		var LX=0.7;
		var LY=0.6;
		var LZ=0.0;
		var L_STEP = - 0.2; // fixed
		var index=0;

		for ( var markerid in  MsgList )
		{
			var data=MsgList[markerid];
			var lenMsgData=data.length;
			LZ=0.0;
			index=0;
			for ( var i=0 ; i < lenMsgData ; i++ )
			{
				if ( markerid == data[i].markerid )
				{
					if ( (null == data[i].x || 0 == data[i].x ) &&
						 (null == data[i].y || 0 == data[i].y ) &&
						 (null == data[i].z || 0 == data[i].z ) )
					{
						data[i].x=LX;
						data[i].y=Math.round((LY + (L_STEP * index++)) * 1000) / 1000;
						data[i].z=LZ;
					}
				}
				TenkenData.MsgEvent.Last[data[i].saveIndex]=data[i];
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.MsgEvent.createDataList\n" + e);
	}
}

// Success callback method upon data retrieval (message data)
TenkenData.MsgEvent.cbDataSuccessMessageEvent = function(_result)
{
	try
	{
		// Copy data
		TenkenData.MsgEvent.Last.length=0;
		TenkenData.MsgEvent.createDataList();

		if ( TenkenData.AllGet.getPhase() == false )
		{
			TenkenData.AllGet.afterDownload();
		}

	}
	catch (e)
	{
		alert("Exception : cbDataSuccessMessageEvent\n" + e);
	}
}

// Error callback method upon data retrieval (message data)
TenkenData.MsgEvent.cbDataErrorMessageEvent = function(_result)
{
	var message = "Failed to download data (Messages) from AR server. Please check the operation mode and network connectivity.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:messageevent:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Get data from AR server. (Message data)
TenkenData.MsgEvent.getLastData = function()
{
	try
	{
		if ( null == TenkenData.MsgEvent.arMessageEventLast )
		{
			TenkenData.MsgEvent.arMessageEventLast=new TenkenARdata(TenkenConst.TableName.messageevent);
		}
		if ( TenkenData.MsgEvent.arMessageEventLast.getBusyStatus() == true )
		{
			alert("Communication in progress.\nPlease try again at later time.");
			return;
		}

		// Set force reload mode
		TenkenData.MsgEvent.arMessageEventLast.setReload(TenkenData.getSuperReloadMode());

		// Query parameter: none
		// Initialize query parameter
		TenkenData.MsgEvent.arMessageEventLast.clearWhere();
		// Query 1: OR query of selected scenario ID and 0
		//             Marker ID=0 means that it's shared asset that do not use markers
		TenkenData.MsgEvent.arMessageEventLast.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");
		// Query 2: Messages that has Enabled=true.
		//             (true=valid, and message that has not yet been marked as reporting complete)
		TenkenData.MsgEvent.arMessageEventLast.addWhere("Enable", null, "true",  null, "STRING");

		// Sort paramenter:
		// Initialize sort parameter
		TenkenData.MsgEvent.arMessageEventLast.clearSort();
		// Set sort order as ascending
		TenkenData.MsgEvent.arMessageEventLast.setSortDesc(true);

		// Sort parameter 1: Sort by checked datetime
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.MsgEvent.arMessageEventLast.addSort("occurrencetime", null, "0", "9223372036854775000", "LONG");

		// Retrieve data
		TenkenData.MsgEvent.arMessageEventLast.getArData(TenkenData.MsgEvent.cbDataSuccessMessageEvent, TenkenData.MsgEvent.cbDataErrorMessageEvent);
	}
	catch (e)
	{
		alert("Exception: getMessageEvent\n" + e);
	}
}

// Save to local storage (Message data)
TenkenData.MsgEvent.saveStorage = function()
{
	Tenken.Storage.currentMessageEventData.set(JSON.stringify(TenkenData.MsgEvent.Current));
	Tenken.Storage.lastMessageEventData.set(JSON.stringify(TenkenData.MsgEvent.Last));
};

// Load from local storage (Message data)
TenkenData.MsgEvent.loadStorage = function()
{
	var data=Tenken.Storage.lastMessageEventData.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.MsgEvent.Last = tmplist;
		}
		else
		{
			TenkenData.MsgEvent.Last.length = 0;
		}

		tmplist = JSON.parse(Tenken.Storage.currentMessageEventData.get());
		if ( null != tmplist )
		{
			TenkenData.MsgEvent.Current = tmplist;
		}
		else
		{
			TenkenData.MsgEvent.Current.length = 0;
		}

	}
	else
	{
		TenkenData.MsgEvent.Last.length = 0;
		TenkenData.MsgEvent.Current.length = 0;
	}
};

// Clear current messages
TenkenData.MsgEvent.clearCurrentMsgEvent = function()
{
	TenkenData.MsgEvent.Current.length = 0;
	Tenken.Storage.currentMessageEventData.remove();
}

// Get current and previous message data (Object type) in array that matches with the marker ID
TenkenData.MsgEvent.getMsgEventListFromMarkerId = function(_markerid)
{
	// Have current and downloaded message data as the target
	var targetList = [];
	if ( 0 < TenkenData.MsgEvent.Current.length )
	{
		targetList.push(TenkenData.MsgEvent.Current);
	}
	if ( 0 < TenkenData.MsgEvent.Last.length )
	{
		targetList.push(TenkenData.MsgEvent.Last);
	}

	var msgeventlist = [];
	for ( var  i= 0 ; i < targetList.length ; i++ )
	{
		var lists = targetList[i];
		if ( null != lists )
		{
			for ( var j = 0 ; j < lists.length ; j++ )
			{
				if ( -1 == _markerid ||
		             _markerid == lists[j].markerid )
				{
					msgeventlist.push(lists[j]);
				}
			}
		}
	}
	return(msgeventlist);
}

// Get current and previous message data (Object type) in array that matches with the asset ID
TenkenData.MsgEvent.getMsgEventListFromAssetId = function(_assetid)
{
	// Have current and downloaded message data as the target
	var targetList = [];
	if ( 0 < TenkenData.MsgEvent.Current.length )
	{
		targetList.push(TenkenData.MsgEvent.Current);
	}
	if ( 0 < TenkenData.MsgEvent.Last.length )
	{
		targetList.push(TenkenData.MsgEvent.Last);
	}

	var msgeventlist = [];
	for ( var  i= 0 ; i < targetList.length ; i++ )
	{
		var lists = targetList[i];
		if ( null != lists )
		{
			for ( var j = 0 ; j < lists.length ; j++ )
			{
				if ( _assetid == lists[j].targetassetid )
				{
					msgeventlist.push(lists[j]);
				}
			}
		}
	}
	return(msgeventlist);
}

// Get current and previous message data (Object type) in array that matches with msgid and occurrencetime
// msgid should be unique id. the method will only return the first one found.
TenkenData.MsgEvent.getMsgEventFromMsgIdTime = function(_msgid,_occurrencetime)
{

	// Have current and downloaded message data as the target
	var targetList = [];
	if ( 0 < TenkenData.MsgEvent.Current.length )
	{
		targetList.push(TenkenData.MsgEvent.Current);
	}
	if ( 0 < TenkenData.MsgEvent.Last.length )
	{
		targetList.push(TenkenData.MsgEvent.Last);
	}

	var msgevent = null;

	for ( i = 0 ; null == msgevent  && i < targetList.length ; i++ )
	{
		var lists = targetList[i];

		for ( var j = 0 ; j < lists.length ; j++ )
		{
			if ( -1 == _msgid ||
	             (_msgid == lists[j].msgid &&
	              _occurrencetime == lists[j].occurrencetime))
			{
				msgevent = lists[j];
				break;
			}
		}
	}
	return(msgevent);
}

// Get Message data of msgid (Current data)
TenkenData.MsgEvent.getMsgEventFromMsgIdCurrent = function(_msgid)
{
	var msgevent = null;

	var lenList = TenkenData.MsgEvent.Current.length;
	for ( i = 0 ; i < lenList ; i++ )
	{
		if (_msgid == TenkenData.MsgEvent.Current[i].msgid )
		{
			msgevent=TenkenData.MsgEvent.Current[i];
			break;
		}
	}

	return(msgevent);
}

// Get Message data of msgid (Previous data)
TenkenData.MsgEvent.getMsgEventFromMsgIdLast = function(_msgid)
{
	var msgevent = null;

	var lenList = TenkenData.MsgEvent.Last.length;
	for ( i = 0 ; i < lenList ; i++ )
	{
		if (_msgid == TenkenData.MsgEvent.Last[i].msgid )
		{
			msgevent=TenkenData.MsgEvent.Last[i];
			break;
		}
	}

	return(msgevent);
}

// Delete Message data of msgid (Current data)
TenkenData.MsgEvent.deleteMsgEventCurrent = function(_msgid)
{
	// delete from back (Current)
	var lenList = TenkenData.MsgEvent.Current.length;
	for ( i = (lenList - 1) ; i >= 0 ; i-- )
	{
		if (_msgid == TenkenData.MsgEvent.Current[i].msgid )
		{
			TenkenData.MsgEvent.Current.splice(i,1);
		}
	}
}

// Delete Message data that are other than Enabled="true" (Only previous)
TenkenData.MsgEvent.deleteMsgEventDisable = function()
{
	// Search from back and delete.
	var lenList = TenkenData.MsgEvent.Last.length;
	for ( i = (lenList - 1) ; i >= 0 ; i-- )
	{
		if ("true" != TenkenData.MsgEvent.Last[i].Enable )
		{
			TenkenData.MsgEvent.Last.splice(i,1);
		}
	}
}

// Add new message data (current)
TenkenData.MsgEvent.addCurrentMsgEvent = function(_msg)
{
	try {
		var MsgEvent=new Object();

		MsgEvent.version = _msg.version;
		MsgEvent.qentityId = _msg.qentityId;
		MsgEvent.msgid = _msg.msgid;
		MsgEvent.msgname = _msg.msgname;
		MsgEvent.description = _msg.description;
		MsgEvent.registrationtime = _msg.registrationtime;
		if ( null != _msg.registrationtime ) MsgEvent.regDatetimeStr =  new Tenken.DatetimeValue(_msg.registrationtime).toStringFullTime();
		MsgEvent.registrant = _msg.registrant;
		MsgEvent.markerid = _msg.markerid;
		MsgEvent.markername = _msg.markername;
		MsgEvent.x = _msg.x;
		MsgEvent.y = _msg.y;
		MsgEvent.z = _msg.z;
		MsgEvent.targetassetid = _msg.targetassetid;
		MsgEvent.title = _msg.title;
		MsgEvent.level = _msg.level;
		MsgEvent.value = _msg.value;
		MsgEvent.occurrencetime = _msg.occurrencetime;
		if ( null != _msg.occurrencetime ) MsgEvent.occDatetimeStr =  new Tenken.DatetimeValue(_msg.occurrencetime).toStringFullTime();
		MsgEvent.operator = _msg.operator;
		MsgEvent.ScenarioId = _msg.ScenarioId;
		if ( null != _msg.Enable ) MsgEvent.Enable = _msg.Enable;
		if ( null != _msg.Answer ) MsgEvent.Answer =  _msg.Answer;

		// add
		TenkenData.MsgEvent.Current.push(MsgEvent);
		return(MsgEvent);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.addCurrentMsgEvent\n" + e);
	}
}


// Switch from Current to Last (Previous) of Message data
TenkenData.MsgEvent.moveCurrentDataToLastData = function()
{
	// Move entire current messages to last (previous) list
	for ( var  i=TenkenData.MsgEvent.Current.length - 1 ; 0 <= i ; i-- )
	{
		if ( null != TenkenData.MsgEvent.Current[i]  )
		{
			// add from top
			TenkenData.MsgEvent.Last.unshift(TenkenData.MsgEvent.Current[i]);
		}
	}

	// Clear current messages
	TenkenData.MsgEvent.clearCurrentMsgEvent();

	// Store moved messages to local storage
	TenkenData.MsgEvent.saveStorage();
}


//============================================================================
// Checklist data management
//============================================================================
// Only the latest value of each checklist item per asset (latest one record) will be downloaded as previous data.
// The current checklist data will be used from the data stored in local storage. This makes that current value do not have any data right after download.
// As checklist need to obtain data per assets, we're not using TenkenARData, but retrieving data directly from AR server.

// Data management class (Checklist result)
TenkenData.TenkenEvent = {};

// Create TenkenARdata to send/retrieve from server
TenkenData.TenkenEvent.arTenkenEventCurrent=new TenkenARdata(TenkenConst.TableName.tenkenevent);

// Data management region (checklist result data). For current and previous data
TenkenData.TenkenEvent.Last = [];
TenkenData.TenkenEvent.Current = [];

// Flag to store if data retrieval is in progress
TenkenData.TenkenEvent.getphase = false;

// Interval timer ID of data retrieval
TenkenData.TenkenEvent.IntervalTenkenEventId = null;
// Total data count of retrieval data
TenkenData.TenkenEvent.downloadCount = 0;
// Maximum data count of retrieval data
TenkenData.TenkenEvent.downloadMaxCount = 0;
// Next retrival data count to retrieve data
TenkenData.TenkenEvent.NextCnt = 0;

// Interval timer used when retrieving checklist data
TenkenData.TenkenEvent.IntervalGetTenkenEvent = function()
{
	try
	{
		if ( TenkenData.TenkenEvent.downloadCount >= TenkenData.TenkenEvent.downloadMaxCount )
		{
			// End as processed finished
			TenkenData.TenkenEvent.stopIntervalGetTenkenEvent();

			// Finish when all data is read.
			TenkenData.TenkenEvent.getphase=false;
			if ( TenkenData.AllGet.getPhase() == false )
			{
				TenkenData.AllGet.afterDownload2();
			}

			return;
		}

		if ( TenkenData.TenkenEvent.NextCnt <= TenkenData.TenkenEvent.downloadCount )
		{
			// Finished downloading to the next count. Proceed with next download.
			var startCnt = TenkenData.TenkenEvent.NextCnt;
			if ( ( TenkenData.TenkenEvent.downloadMaxCount - TenkenData.TenkenEvent.NextCnt ) < Tenken.config.DownloadStep )
			{
				TenkenData.TenkenEvent.NextCnt = TenkenData.TenkenEvent.downloadMaxCount;
			}
			else
			{
				TenkenData.TenkenEvent.NextCnt += Tenken.config.DownloadStep;
			}

			// Retrieve data only for checklist items that are defined.
			var targetList=TenkenData.TenkenTable.getTenkenTargetList();

			var strLog= "download=" + TenkenData.TenkenEvent.downloadCount
						+ ",start=" + startCnt
						+ ",next=" + TenkenData.TenkenEvent.NextCnt
						+ ",max=" + TenkenData.TenkenEvent.downloadMaxCount;

			Tenken.Util.logdebug("GET NEXT DATA:TenkenEvent:" + strLog);

			for ( var i=startCnt ; i < TenkenData.TenkenEvent.NextCnt  ; i++ )
			{
				var target=targetList[i];

				//Create query object

				var query = new TenkenARvalue.QuadQuery();
				query.type = "RECORDSANDCOUNT";
				// Max limit to query (obtain only the latest of each data)
				query.limitRange = new TenkenARvalue.Range(1);
				query.qattributeOrderIndexRange = new TenkenARvalue.Range(1,100);

				// Set qtype of retistered operator data
				query.qtypeNameRanges = new Array(new TenkenARvalue.Range(TenkenConst.TableName.tenkenevent));

				query.whereExpressions = new Array();

				// Query parameter:
				// Query 1: OR query of selected scenario ID and 0
				//             marker ID=0 is for shared assets that do not use markers
				var cond = new Array();
				cond.push(new TenkenARvalue.Range(0))
				cond.push(new TenkenARvalue.Range(Tenken.config.ScenarioId));
				query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("ScenarioId"), cond, "LONG"));

				// Query 1: Asset ID (assetid)
				if( null != target.assetid )
				{
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("targetassetid"), new TenkenARvalue.Range(target.assetid), "STRING"));
				}
				// Query 3: Check type (type)
				if( null != target.type )
				{
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("type"), new TenkenARvalue.Range(target.type), "STRING"));
				}

				// If we're going to skip assets that is in stopped state.
				if ( true == Tenken.config.skipStopLastData )
				{
					// Query 4: Initial State(assetstatus)=START
					//             Set assetstatus="START"
					//             Check value do not exist for assets that are in Stopped state. Get the last check value that was in start state.
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("assetstatus"), new TenkenARvalue.Range("START"), "STRING"));
				}

				// Sort parameter:
				// Sort 1: Registered Date and time (registrationtime)
				//               Obtain a single latest record by sorting with registration date desc.
				// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
				// will cause an error, hence hard coding 9223372036854776000 here.
				query.sortOrderExpressions = new Array(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("registrationtime"), new TenkenARvalue.Range(0,9223372036854775000), "LONG", true));

				// Transform to string
				var getQuery = TenkenARvalue.makeQuadQuery(query);

				Tenken.Util.logdebug("GET_DATA_REQUEST:TenkenEvent:" + i);

				// Set force reload mode
				var mode=TenkenData.getSuperReloadMode();

				// Retrieve check result data from AR server.
				AR.Data.getArServerData(
					getQuery,
					mode,
					TenkenData.TenkenEvent.getDataSuccess,
					TenkenData.TenkenEvent.getDataError
					);
			}

		}

	}
	catch (e)
	{
		Tenken.Util.logerr(e);
		alert("Exception : TenkenData.TenkenEvent.IntervalGetTenkenEvent\n" + e);
	}

	return;
}

// Start interval timer to retrieve check results
TenkenData.TenkenEvent.setIntervalGetTenkenEvent = function()
{
	if ( null == TenkenData.TenkenEvent.IntervalTenkenEventId )
	{
		TenkenData.TenkenEvent.IntervalTenkenEventId = setInterval('TenkenData.TenkenEvent.IntervalGetTenkenEvent()', Tenken.config.getIntervalTime);
	}
}

// Stop interval timer to retrieve check results
TenkenData.TenkenEvent.stopIntervalGetTenkenEvent = function()
{
	if ( null != TenkenData.TenkenEvent.IntervalTenkenEventId )
	{
		clearInterval(TenkenData.TenkenEvent.IntervalTenkenEventId);
		TenkenData.TenkenEvent.IntervalTenkenEventId = null;
	}
}

// Retrieve data from AR server (Check result data)
TenkenData.TenkenEvent.getLastData = function()
{
	try
	{
		if ( true == TenkenData.TenkenEvent.getphase )
		{
			return;
		}

		// Retrieve only the number defined in checklist table
		var targetList=TenkenData.TenkenTable.getTenkenTargetList();

		if (  null == targetList || 0 >= targetList.length )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, null, null, null, "Has not retrieved check result table to get check result data.\nEither data is not defined, or retrieval has failed.", null);
			return;
		}

		TenkenData.TenkenEvent.getphase=true;
		TenkenData.TenkenEvent.Last.length=0;
		TenkenData.TenkenEvent.Current.length=0;

		Tenken.Util.loginfo("GET_COUNT:TenkenEvent:" + targetList.length);

		TenkenData.TenkenEvent.NextCnt = 0;
		TenkenData.TenkenEvent.downloadCount = 0;
		TenkenData.TenkenEvent.downloadMaxCount =targetList.length;

		// Set the timer and retrieve in the method.
		TenkenData.TenkenEvent.setIntervalGetTenkenEvent();

	} catch(e){
		Tenken.Util.logerr(e);
	}
};


// Success callback mothod upon data retrieval (check result data)
TenkenData.TenkenEvent.getDataSuccess = function(_result)
{
	Tenken.Util.loginfo("GET_DATA_RESPONSE:SUCCESS:TenkenEvent:" + TenkenData.TenkenEvent.downloadCount);

	if ( null != _result.getValue() )
	{
		// Get necessary data and store into TenkenData.TenkenEvent.Last
		TenkenData.TenkenEvent.extractData(_result.getValue());

	}
};


// Get check result data from received JSON object
TenkenData.TenkenEvent.extractData = function(_data)
{
	try {
		if ( null == _data ) return;

		// Record count received
		var recordCount = _data.records.length;

		TenkenData.TenkenEvent.downloadCount++;

		Tenken.Util.logdebug("downloadCount:TenkenEvent:" + TenkenData.TenkenEvent.downloadCount + " , " + recordCount);

		for(var recordIndex = 0; recordIndex < recordCount; recordIndex++)
		{
			// Search records one by one
			var record = _data.records[recordIndex];
			var valueLength = record.qvalues.length;
			var value =new Object();

			value.version = record.version;
			value.qentityId = record.id;

			// Retrieve only the number specified in qvalue. Define by attributeName
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

			// Add new (Previous value)
			TenkenData.TenkenEvent.Last.push(value);
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenEvent.extractData\n" + e);
	}
};

// Error callback method upon data retrieval (Check result data)
TenkenData.TenkenEvent.getDataError = function(_result)
{
	var message = "Failed to retrieve data (Check result) from AR server. Please check the operation mode and network connectivity.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}
	// Clear the timer
	TenkenData.TenkenEvent.stopIntervalGetTenkenEvent();

	TenkenData.TenkenEvent.getphase=false;
	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:TenkenEvent:" + message + ":" + detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
};

// Get if the data retrieval is in progress
TenkenData.TenkenEvent.isGetPhase = function()
{
	return(TenkenData.TenkenEvent.getphase);
}

// Clear check result data (Only the Current)
TenkenData.TenkenEvent.clearCurrentTenkenEvent = function()
{
	TenkenData.TenkenEvent.Current.length = 0;
	Tenken.Storage.currentTenkenEventData.remove();
}

// Intialize check result data that matches the marker ID (Current only)
TenkenData.TenkenEvent.resetCurrentTenkenEventTable = function(_markerid)
{
	// Make current and downloaded check result data as the target.
	for ( var i = 0 ; i < TenkenData.TenkenEvent.Current.length ; i++ )
	{
		var tenkendata=TenkenData.TenkenEvent.Current[i];
		if ( _markerid == tenkendata.markerid )
		{
			// Initialize
			// Use as-is for the asset data those are not modified.
			// (description,type,markerid,markername,targetassetid,assetstatus)
			tenkendata.tenkenid=null;
			tenkendata.tenkenname=null;
			tenkendata.registrationtime=null;
			tenkendata.registrant=null;
			tenkendata.occurrencetime=null;
			tenkendata.operator=null;
			tenkendata.F01=null;
			tenkendata.F02=null;
			tenkendata.F03=null;
			tenkendata.F04=null;
			tenkendata.F05=null;
			tenkendata.S01=null;
			tenkendata.S02=null;
			tenkendata.S03=null;
			tenkendata.S04=null;
			tenkendata.S05=null;
		}
	}

	return;
}


// Retrieve check result data (Object type) that matches with specified assetid, TenkenType, and DataEntryName
TenkenData.TenkenEvent.getData = function(_targetList, _targetassetid, _tenkentype, _dataentryname)
{
	var tenken = null;

	for ( i = 0 ; i < _targetList.length ; i++ )
	{
		var lists = _targetList[i];
		if ( null == lists ) continue;

		for ( var j = 0 ; j < lists.length ; j++ )
		{
			var tmptenken = lists[j];

			if ( tmptenken.type == _tenkentype &&
				(null == _targetassetid ||
				 "" == _targetassetid ||
 				 tmptenken.targetassetid == _targetassetid) &&
				( null == _dataentryname || tmptenken[_dataentryname] != null) )
			{
				if ( null == tenken || (tmptenken.occurrencetime > tenken.occurrencetime))
				{
						tenken = tmptenken;
				}
			}
		}
	}

	return tenken;
}

// Process and copy downloaded TenkenData
TenkenData.TenkenEvent.createData = function(_targetList, _update, _tenken)
{
	try
	{
		var newData=true;
		for ( i = 0 ; i < _targetList.length ; i++ )
		{
			var tmptenken = _targetList[i];
			if ( null == tmptenken ) continue;

			if ( tmptenken.type == _tenken.type &&
				 tmptenken.targetassetid == _tenken.targetassetid &&
				 true == _update )
			{
				var value=tmptenken;
				newData=false;
			}
		}

		if ( true == newData )
		{
			var value =new Object();
		}
		value.version=_tenken.version;
		value.qentityId =_tenken.qentityId;
		value.tenkenid=_tenken.tenkenid;
		value.tenkenname=_tenken.tenkenname;
		value.description=_tenken.description;
		value.type=_tenken.type;
		value.registrationtime=_tenken.registrationtime;
		if ( null != value.registrationtime )
		{
			value.regDatetimeStr =  new Tenken.DatetimeValue(value.registrationtime).toStringFullTime();
		}
		value.registrant=_tenken.registrant;
		value.markerid=_tenken.markerid;
		value.markername=_tenken.markername;
		value.targetassetid=_tenken.targetassetid;
		value.assetstatus=_tenken.assetstatus;
		value.occurrencetime=_tenken.occurrencetime;
		if ( null != value.occurrencetime )
		{
			value.occDatetimeStr =  new Tenken.DatetimeValue(value.occurrencetime).toStringFullTime();
		}
		value.operator=_tenken.operator;
		value.ScenarioId=_tenken.ScenarioId;

		if ( true == newData )
		{
			_targetList.push(value);
		}

	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenEvent.createData\n" + e);
	}
	return(value);
}

// Store to local storage (check result data)
TenkenData.TenkenEvent.saveStorage = function()
{
	if ( 0 < TenkenData.TenkenEvent.Last.length )
	{
		Tenken.Storage.lastTenkenEventData.set(JSON.stringify(TenkenData.TenkenEvent.Last));
	}
	if ( 0 < TenkenData.TenkenEvent.Current.length )
	{
		Tenken.Storage.currentTenkenEventData.set(JSON.stringify(TenkenData.TenkenEvent.Current));
	}
};

// Load from local storage (check result data)
TenkenData.TenkenEvent.loadStorage = function()
{
	var data=Tenken.Storage.lastTenkenEventData.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.TenkenEvent.Last = tmplist;
		}
		else
		{
			TenkenData.TenkenEvent.Last.length = 0;
		}

		tmplist = JSON.parse(Tenken.Storage.currentTenkenEventData.get());
		if ( null != tmplist )
		{
			TenkenData.TenkenEvent.Current = tmplist;
		}
		else
		{
			TenkenData.TenkenEvent.Current.length = 0;
		}
	}
	else
	{
		TenkenData.TenkenEvent.Last.length = 0;
		TenkenData.TenkenEvent.Current.length = 0;
	}
};

// Copy entire current check results to previous values
TenkenData.TenkenEvent.copyCurrentDataFromLastData = function()
{
	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
        // Automatically set previous check results to current values.
        // Do not set if SetLastData is null, or value except true is set, or POI is not set.
		if ( null == _row.SetLastData ||
             "true" !=_row.SetLastData.toLowerCase() ||
				null == _poi2 )  return;

		// Set or register Current POI2 value
		var tmpPOI2=TenkenData.TenkenEvent.getData(TenkenData.TenkenEvent.Current, _row.AssetId, _row.TenkenType, null);
		if ( tmpPOI2 )
		{
			currentPoi2=tmpPOI2;
		}
		else
		{
			// Register new
			var value =new Object();
			value.version=_poi2.version;
			value.qentityId=_poi2.qentityId;
			value.tenkenid=_poi2.tenkenid;
			value.tenkenname=_poi2.tenkenname;
			value.Description=_poi2.Description;
			value.type=_poi2.type;
			value.registrationtime=null;
			value.registrant=null;
			value.markerid=_poi2.markerid;
			value.markername=_poi2.markername;
			value.targetassetid=_poi2.targetassetid;
			value.assetstatus=_poi2.assetstatus;
			value.occurrencetime=null;
			value.operator=null;
			value.ScenarioId=_poi2.ScenarioId;

			var currentPoi2=TenkenData.TenkenEvent.createData(
				TenkenData.TenkenEvent.Current, true, value);

		}
		if ( currentPoi2 ) currentPoi2[_valueEntryName] = _poi2[_valueEntryName];
	}
	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Last, null, null, rowFunc);
}

// Initialize check result that includeds specified tableid
TenkenData.TenkenEvent.resetCurrentTenkenEventTableTableId = function(_tabledid)
{


	// 1. Create assetid list that matches TenkenTable.TableId and _tableid
	var listAssetId=new Object();
	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		if ( _table && _row && _tabledid == _table.TableId)
		{
			listAssetId[_row.AssetId] = _row.AssetId;
		}
	}

	TenkenData.TenkenTable.foreachTables(null, null, null, rowFunc);

	// 2. Create markerid list that matches asset.assetid from assetid list
	var listMarkerIds=new Object();
	var markerid=-1;
	for ( var assetid in listAssetId )
	{
		markerid=TenkenData.Asset.getMarkerIdfromAssetId(assetid);
		if ( 0 <= markerid )
		{
			listMarkerIds[markerid]=markerid;
		}
	}

	// 3. Initialize current check results with markerid list.
	for ( var markerid in listMarkerIds )
	{
		TenkenData.TenkenEvent.resetCurrentTenkenEventTable(markerid);
	}

}

//============================================================================
// Data managenet for operators
//============================================================================

// Data Management class (operator data)
TenkenData.UserData = {};

// Create TenkenARdata to send/receive data from AR server.
TenkenData.UserData.arUserData=new TenkenARdata(TenkenConst.TableName.userdata);
// Data management region (operator data)
TenkenData.UserData.ListAll = [];

// Process and copy downloaded TenkenData.
TenkenData.UserData.createDataList = function()
{
	try
	{
		if ( null == TenkenData.UserData.arUserData ) return;

		var datas = TenkenData.UserData.arUserData.getDataValue();
		if ( null == datas ) return;
		if ( null == TenkenData.UserData.ListAll ) return;

		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var dataValue = datas[i];
			if ( null != dataValue )
			{
				var newObj=new Object();
				if ( null != dataValue )
				{
					// Copy entire data (per QAttribute)
					for ( var name in dataValue )
					{
						newObj[name]=dataValue[name];
					}
					// Check mandatory and duplicate data
					TenkenData.UserData.checkData(newObj);

					// Add new
					TenkenData.UserData.ListAll.push(newObj);
				}
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.UserData.createDataList \n" + e);
	}
}

// Success callback handler upon data retrieval (operator data)
TenkenData.UserData.cbDataSuccessUserData = function(_result)
{
	try
	{
		// Copy retrieved data
		TenkenData.UserData.ListAll.length=0;
		TenkenData.UserData.createDataList();

		if ( TenkenData.UserData.ListAll.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.userdata, null, null, null, "有効な作業者データが登録されていません。\n作業者データを登録してください。", null);
			return;
		}

		if ( TenkenData.AllGet.getPhase() == false )
		{
			TenkenData.AllGet.afterDownload();
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.UserData.cbDataSuccessUserData\n" + e);
	}
}

// Error callback handler upon data retrieval (operator data)
TenkenData.UserData.cbDataErrorUserData = function(_result)
{
	var message = "Failed to obtain data (operator list) from AR server. Please check the operation mode and network connectivity.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:UserData:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Retrieve data from AR server. (operator data)
TenkenData.UserData.getData = function()
{
	try
	{
		if ( null == TenkenData.UserData.arUserData )
		{
			TenkenData.UserData.arUserData=new TenkenARdata(TenkenConst.TableName.userdata);
		}
		if ( TenkenData.UserData.arUserData.getBusyStatus() == true )
		{
			alert("Communication in progress.\nPlease retry at later time.");
			return;
		}

		// Set force reload mode.
		TenkenData.UserData.arUserData.setReload(TenkenData.getSuperReloadMode());

		// Query parameter:
		// Initialize query parameter
		TenkenData.UserData.arUserData.clearWhere();
		// Query 1: OR query of selected scenario ID and 0
		//             Marker ID=0 is for shared assets that do not use markers
		TenkenData.UserData.arUserData.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");
		// Set query 2

		// Sort parameter：
		// Initialize sort parameter
		TenkenData.UserData.arUserData.clearSort();
		// Set sort order as ascending
		TenkenData.UserData.arUserData.setSortDesc(false);
		// Sort 1: Sort index (SortIndex)
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.UserData.arUserData.addSort("SortIndex", null, "0", "9223372036854775000", "LONG");

		// Retrieve data
		TenkenData.UserData.arUserData.getArData(TenkenData.UserData.cbDataSuccessUserData, TenkenData.UserData.cbDataErrorUserData);
	}
	catch (e)
	{
		alert("Exception: TenkenData.UserData.getUserData\n" + e);
	}
}

// Check mandatory and duplicate data of received data.
// If there is an issue in data, output data error and return to initial screen.
//
// Check items
// QAttribute name : Check items
// userid       : null  duplicate
// username     : null  duplicate
// ScenarioId   : null
TenkenData.UserData.checkData = function(_data)
{
	try
	{
		var err=false;
		var errName=null;
		var errValue=null;
		var errMsg=null;

		if ( null == _data ) return;

		// check null
		if ( null == _data.userid )
		{
			err=true;
			errName="userid";
		}
		else if ( null == _data.username )
		{
			err=true;
			errName="username";
		}
		else if ( null == _data.ScenarioId )
		{
			err=true;
			errName="ScenarioId";
		}
		if ( true == err )
		{
			errMsg="Mandatory data is not set.";
		}
		else
		{
			// Check duplicate
			var len=TenkenData.UserData.ListAll.length;
			for ( var i = 0 ; i < len ; i++ )
			{
				var ud=TenkenData.UserData.ListAll[i];
				if ( _data.userid == ud.userid )
				{
					err=true;
					errName="userid";
					errValue=_data.userid;
				}
				else if ( _data.username == ud.username )
				{
					err=true;
					errName="username";
					errValue=_data.username;
				}
			}
			if ( true == err )
			{
				errMsg="Duplicate data exists.";
			}
		}

		// If there is an issue in data, output error and move to initial screen.
		if ( true == err )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.userdata, errName, errValue, null, errMsg);
		}
	}
	catch (e)
	{
		alert("Exception: TenkenData.UserData.checkData\n" + e);
	}
}

// Store data to local storage (operator data)
TenkenData.UserData.saveStorage = function()
{
	Tenken.Storage.UserData.set(JSON.stringify(TenkenData.UserData.ListAll));
};

// Load data from local storage (operator data)
TenkenData.UserData.loadStorage = function()
{
	var data=Tenken.Storage.UserData.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.UserData.ListAll = tmplist;
		}
		else
		{
			TenkenData.UserData.ListAll.length = 0;
		}
	}
	else
	{
		TenkenData.UserData.ListAll.length = 0;
	}
};

// Construct downloaded operator list to HTML's select tag using option tag.
TenkenData.UserData.getUserNameHTML = function()
{
	TenkenData.UserData.loadStorage();
	var str = '';

	for ( var i = 0 ; i < TenkenData.UserData.ListAll.length ; i++ )
	{
		str += '<option value="' + TenkenData.UserData.ListAll[i].username + '">' + TenkenData.UserData.ListAll[i].username;
	}

	if ( 0 >= TenkenData.UserData.ListAll.length )
	{
		str += '<option value="">(Please download)'
	}

	return str;
};

// Add downloaded operator data as select tag of specified Element
TenkenData.UserData.selectUserNameHTML = function(_select)
{

	if ( _select )
	{
		TenkenData.UserData.loadStorage();

		if ( 0 < TenkenData.UserData.ListAll.length )
		{
			_select.length=(TenkenData.UserData.ListAll.length + 1);
			_select.options[0].text="Select";
			for ( var i = 0 ; i < TenkenData.UserData.ListAll.length ; i++ )
			{
				_select.options[i+1].text=TenkenData.UserData.ListAll[i].username;
				_select.options[i+1].value=TenkenData.UserData.ListAll[i].username;
			}

		}
		else
		{
			_select.length=2;
			_select.options[0].text="Select";
			_select.options[1].text="(Download)";
			_select.options[0].value="";
			_select.options[1].value="";
		}
	}
};

//============================================================================
// Data management of checklist table
//============================================================================

// Data management class (checklist data)
TenkenData.TenkenTable = {};

// Create TenkenARdata to send/receive from AR server.
TenkenData.TenkenTable.arTenkenTable=new TenkenARdata(TenkenConst.TableName.tenkentable);

// Data management region (Checklist data)
TenkenData.TenkenTable.ListTables = [];

// Success callback handler upon data retrieval (Checklist data)
TenkenData.TenkenTable.cbDataSuccessTenkenTable = function(_result)
{
	try
	{
		// Copy retrieved data
		TenkenData.TenkenTable.ListTables.length = 0;
		TenkenData.TenkenTable.createDataList();

		if ( TenkenData.TenkenTable.ListTables.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, null, null, null, "有効な点検項目データが登録されていません。\n点検項目データを登録してください。", null);
			return;
		}

		if ( TenkenData.AllGet.getPhase() == false )
		{
			TenkenData.AllGet.afterDownload();
		}

	}
	catch (e)
	{
		alert("Exception : cbDataSuccessTenkenTable\n" + e);
	}
}

// Error callback handler upon data retrieval (Checklist data)
TenkenData.TenkenTable.cbDataErrorTenkenTable = function(_result)
{
	var message = "Failed to download data (Checklist) from AR server. Please check operation mode and network connectivity.";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}

	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:tenkentable:" + message , detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
}

// Retrieve data from AR server (Checklist data)
TenkenData.TenkenTable.getData = function()
{
	try
	{
		if ( null == TenkenData.TenkenTable.arTenkenTable )
		{
			TenkenData.TenkenTable.arTenkenTable=new TenkenARdata(TenkenConst.TableName.tenkentable);
		}
		if ( TenkenData.TenkenTable.arTenkenTable.getBusyStatus() == true )
		{
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// Set force reload mode.
		TenkenData.TenkenTable.arTenkenTable.setReload(TenkenData.getSuperReloadMode());

		// Query paremeter:
		// Initialize query parameter
		TenkenData.TenkenTable.arTenkenTable.clearWhere();

		// Query 1: OR query of selected scenario ID and 0
		//             Marker ID=0 is shared assets that do not use markers
		TenkenData.TenkenTable.arTenkenTable.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");

		// Sort parameter
		// Initialize sort parameter
		TenkenData.TenkenTable.arTenkenTable.clearSort();
		// Set sort order as ascending
		TenkenData.TenkenTable.arTenkenTable.setSortDesc(false);

		// Sort 1: Index value of sort table.
		// JavaScript will round max long value of 9223372036854775807 to 9223372036854776000 that 
		// will cause an error, hence hard coding 9223372036854776000 here.
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfTable", null, "0", "9223372036854775000", "LONG");
		// Sort 2: Group index value of sort table
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfRowGroup", null, "0", "9223372036854775000", "LONG");
		// Sort 3: Row index value of sort table
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfRow", null, "0", "9223372036854775000", "LONG");

		// Retrieve data
		TenkenData.TenkenTable.arTenkenTable.getArData(
			TenkenData.TenkenTable.cbDataSuccessTenkenTable,
			TenkenData.TenkenTable.cbDataErrorTenkenTable);
	}
	catch (e)
	{
		alert("Exception: TenkenData.TenkenTable.getData\n" + e);
	}
}

// Retrieve Checklist data (Object type) that matches with selected table ID
TenkenData.TenkenTable.getTable = function(_tableid)
{
	try {
		if ( null == _tableid)
		{
			return(null);
		}
		for ( var i = 0 ; i < TenkenData.TenkenTable.ListTables.length ; i++ )
		{
			var table=TenkenData.TenkenTable.ListTables[i];
			if ( _tableid == table.TableId )
			{
				return(table);
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getTable\n" + e);
	}
}

// Retrieve Checklist data (Object type) that matches with select table ID and group ID.
TenkenData.TenkenTable.getRowGroup = function(_tableid, _rowgroupid)
{
	try{
		if ( null == _tableid )
		{
			return(null);
		}
		for ( var i = 0 ; i < TenkenData.TenkenTable.ListTables.length ; i++ )
		{
			var table=TenkenData.TenkenTable.ListTables[i];
			if ( _tableid == table.TableId )
			{
				for ( var j = 0 ; j < table.listRowGroups.length ; j++ )
				{
					var rowgroup=table.listRowGroups[j];
					if ( _rowgroupid == rowgroup.RowGroupId )
					{
						return(rowgroup);
					}
				}
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getRowGroup\n" + e);
	}
}

// Retrieve Checklist data that matches with all the table ID, group ID, and Row ID.
TenkenData.TenkenTable.getRow = function(_tableid, _rowgroupid, _rowid)
{
	try {
		if ( null == _tableid || null == _rowid )
		{
			return(null);
		}
		for ( var i = 0 ; i < TenkenData.TenkenTable.ListTables.length ; i++ )
		{
			var table=TenkenData.TenkenTable.ListTables[i];
			if ( _tableid == table.TableId )
			{
				if ( null != _rowgroupid )
				{
					// Search from RowGroup if RowGroup value is specified.
					for ( var j = 0 ; j < table.listRowGroups.length ; j++ )
					{
						var rowgroup=table.listRowGroups[j];
						if ( _rowgroupid == rowgroup.RowGroupId )
						{
							for ( var k = 0 ; k < rowgroup.listRows.length ; k++ )
							{
								var row=trowgroup.listRows[k];
								if ( _rowid == row.RowId )
								{
									return(row);
								}
							}
						}
					}
				}
				else
				{
					// Search from Table if RowGroup is not specified.
					for ( var j = 0 ; j < table.listRowsTable.length ; j++ )
					{
						var row=table.listRowsTable[j];
						if ( _rowid == row.RowId )
						{
							return(row);
						}
					}
				}
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getRow\n" + e);
	}
}

// Retrieve group data (an array) of Checklist data that matches with group id of the specified table list (an array)
TenkenData.TenkenTable.getRowGroupFromTable = function(_table, _rowgroupid)
{
	try {
		if ( null == _table || null == _rowgroupid )
		{
			return(null);
		}
		for ( var i = 0 ; i < _table.listRowGroups.length ; i++ )
		{
			var rowgroup=_table.listRowGroups[i];
			if ( _rowgroupid == rowgroup.RowGroupId )
			{
				return(rowgroup);
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getRowGroupFromTable\n" + e);
	}
}

// Retrieve Checklist row (Object type) data that matches with the RowId of specified group list (an array)
TenkenData.TenkenTable.getRowFromRowGroup = function(_rowgroup, _rowid)
{
	try {
		if ( null == _rowgroup || null == _rowid )
		{
			return(null);
		}
		for ( var i = 0 ; i < _rowgroup.listRows.length ; i++ )
		{
			var row=_rowgroup.listRows[i];
			if ( _rowid == row.RowId )
			{
				return(row);
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getRowFromRowGroup\n" + e);
	}
}

// Retrieve checklist row data (Object type) that matches with RowId of specified table list (an array)
TenkenData.TenkenTable.getRowFromTable = function(_table, _rowid)
{
	try {
		if ( null == _table || null == _rowid )
		{
			return(null);
		}
		for ( var i = 0 ; i < _table.listRowsTable.length ; i++ )
		{
			var row=_table.listRowsTable[i];
			if ( _rowid == row.RowId )
			{
				return(row);
			}
		}
		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getRowFromTable\n" + e);
	}
}

// Retrieve checlist row data (Object type) that matches with the specified RowId
TenkenData.TenkenTable.getRowFromRowId = function(_rowid)
{
	try {
		if ( null == _rowid )
		{
			return(null);
		}
		for ( var i=0 ; i < TenkenData.TenkenTable.ListTables.length ; i++ )
		{
			var table=TenkenData.TenkenTable.ListTables[i];

			// Group is set. Search from Group
			if ( null != table.listRowGroups &&  0 < table.listRowGroups.length )
			{
				// Group is set.
				for ( var j=0 ; j < table.listRowGroups.length ; j++ )
				{
					var group=table.listRowGroups[j];
					// Display checklist (Row)
					for ( var k=0 ; k < group.listRows.length ; k++ )
					{
						var row=group.listRows[k];
						if ( _rowid ==  row.RowId ) return(row);
					}

				}
			}

			// Search from items that Group is not set.
			for ( var k=0 ; k < table.listRowsTable.length ; k++ )
			{
				var row=table.listRowsTable[k];
				if ( _rowid ==  row.RowId ) return(row);
			}
		}

		return(null);
	}
	catch (e)
	{
		alert("Exception : TenkenData.getRowFromRowId\n" + e);
	}
}

// Retrieve table id that includes asset id.
// Search per Row as there could be multiple AssetId in a single TableId
TenkenData.TenkenTable.getTableIdFromAssetId = function(_assetid)
{
	var tableid=null;

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus) 
	{
		// Return immediately if tableid is already found.
		if ( null != tableid ) return;
		if ( _row )
		{
			if ( _assetid == _row.AssetId )
			{
				tableid=_table.TableId;
			}
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Last, null, null, rowFunc);

	return tableid;
}

// Save data to local storage (Checklist data)
TenkenData.TenkenTable.saveStorage = function()
{
	Tenken.Storage.TenkenTable.set(JSON.stringify(TenkenData.TenkenTable.ListTables));
};

// Load data from local storage (Checklist data)
TenkenData.TenkenTable.loadStorage = function()
{
	var data=Tenken.Storage.TenkenTable.get();
	if ( null != data )
	{
		var tmplist = JSON.parse(data);
		if ( null != tmplist )
		{
			TenkenData.TenkenTable.ListTables = tmplist;
		}
		else
		{
			TenkenData.TenkenTable.ListTables.length = 0;
		}
	}
	else
	{
		TenkenData.TenkenTable.ListTables.length = 0;
	}
};

// foreach method to call elements (table, group, checklist item) per checklist data array.
TenkenData.TenkenTable.foreachTables = function(_targetlist, _tableFunc, _rowGroupFunc, _rowFunc)
{
	try
	{
		var lenTable=TenkenData.TenkenTable.ListTables.length;
		for(var i = 0; i < lenTable ; i++)
		{
			var table = TenkenData.TenkenTable.ListTables[i];
			if(null != _tableFunc ) _tableFunc(true, table);

			if ( null != table.listRowGroups )
			{
				// If there is a group
				var lenRowGroups=table.listRowGroups.length;
				for(var j = 0; j < lenRowGroups; j++)
				{
					var rowGroup = table.listRowGroups[j];
					if(null != _rowGroupFunc ) _rowGroupFunc(true, table, rowGroup);
					var lenRows=rowGroup.listRows.length;
					for(var k = 0; k < lenRows; k++)
					{
						var row = rowGroup.listRows[k];
						if(null != _rowFunc)
						{
							// TenkenData.TenkenEvent.Current
							// TenkenData.TenkenEvent.Last
							var poi2 = null;
							if ( null != _targetlist )
							{
								poi2 = TenkenData.TenkenEvent.getData([_targetlist], row.AssetId, row.TenkenType, /*row.DataEntryName*/ null);
							}

							var value = ( null == poi2 ) ? null : poi2[row.DataEntryName];
							var assetstatus = ( null == poi2 ) ? null : poi2.assetstatus;
							_rowFunc(	table,
										rowGroup,
										row,
										poi2,
										row.DataEntryName,
										value,
										assetstatus);
						}
					}
					if(null != _rowGroupFunc) _rowGroupFunc(false, table, rowGroup);
				}
			}
			if ( null != table.listRowsTable )
			{
				// If there isn't a group
				var lenRowsTable=table.listRowsTable.length;
				for(var k = 0; k < lenRowsTable ; k++)
				{
					var row = table.listRowsTable[k];
					if(null != _rowFunc)
					{
							var poi2 = null;
							if ( null != _targetlist )
							{
								poi2 = TenkenData.TenkenEvent.getData([_targetlist], row.AssetId, row.TenkenType, /*row.DataEntryName*/ null);
							}
						var value = ( null == poi2 ) ? null : poi2[row.DataEntryName];
						var assetstatus = ( null == poi2 ) ? null : poi2.assetstatus;
						_rowFunc(	table,
									null,
									row,
									poi2,
									row.DataEntryName,
									value,
									assetstatus);
					}
				}
			}
			if(null != _tableFunc) _tableFunc(false, table);
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.foreachTables\n" + e);
	}
};

// Create check target asset list and table name to use when retrieving check results
TenkenData.TenkenTable.getTenkenTargetList = function()
{
	try
	{
		var tenkenTargetlist = [];

		for(var i = 0; i < TenkenData.TenkenTable.ListTables.length; i++)
		{
			var table = TenkenData.TenkenTable.ListTables[i];

			if ( null != table.listRowGroups )
			{
				// When there is a group
				for(var j = 0; j < table.listRowGroups.length; j++)
				{
					var rowGroup = table.listRowGroups[j];
					for(var k = 0; k < rowGroup.listRows.length; k++)
					{
						var row = rowGroup.listRows[k];
						var value = new Object();
						value.table=table.TableId;
						value.type=row.TenkenType;
						value.assetid=row.AssetId;
						var found=0;
						for(var l = 0; l < tenkenTargetlist.length; l++)
						{
							var setvalue=tenkenTargetlist[l];
							if (setvalue.table == table.TableId &&
								setvalue.type == row.TenkenType &&
								setvalue.assetid == row.AssetId )
							{
								found=1;
								break;
							}
						}
						if ( 0 == found )
						{
							tenkenTargetlist.push(value);
						}
					}
				}
			}
			if ( null != table.listRowsTable )
			{
				// When there is no group
				for(var k = 0; k < table.listRowsTable.length; k++)
				{
					var row = table.listRowsTable[k];
						var value = new Object();
						value.table=table.TableId;
						value.type=row.TenkenType;
						value.assetid=row.AssetId;
						var found=0;
						for(var l = 0; l < tenkenTargetlist.length; l++)
						{
							var setvalue=tenkenTargetlist[l];
							if (setvalue.table == table.TableId &&
								setvalue.type == row.TenkenType &&
								setvalue.assetid == row.AssetId )
							{
								found=1;
								break;
							}
						}
						if ( 0 == found )
						{
							tenkenTargetlist.push(value);
						}
				}
			}
		}

	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenTable.getTenkenTargetList\n" + e);
	}

	return(tenkenTargetlist);
};

// Process and copy selected checklist (Object type) of TenkenData
TenkenData.TenkenTable.createListTenkenTable = function(_value)
{
	try {
		var tmptable=TenkenData.TenkenTable.getTable(_value.TableId);

		if ( null == tmptable )
		{
			// Create new
			var table=new Object();
			table.listRowGroups=[];
			// Create Row list directly under Table if RowGroup is null.
			// We'll create unconditionally here.
			table.listRowsTable=[];

			table.TableId=_value.TableId;
			table.TableName=_value.TableName;
			table.SortIndexOfTable=_value.SortIndexOfTable;
			table.AssetStatusStoppable=_value.AssetStatusStoppable;
			table.ScenarioId=_value.ScenarioId;

			TenkenData.TenkenTable.ListTables.push(table);
		}
		else
		{
			// Use existing table (Use initial value not overwriting the value)
			// If we need to cross check with existing, add here.
			var table=tmptable;
		}

		// Create RowGroup list
		if (  null != table && _value.RowGroupId )
		{
		var tmpgroup=TenkenData.TenkenTable.getRowGroupFromTable(table, _value.RowGroupId);
			if ( null == tmpgroup )
			{
				var rowgroup=new Object();
				rowgroup.listRows=[];
				rowgroup.RowGroupId=_value.RowGroupId;
				rowgroup.RowGroupName=_value.RowGroupName;
				rowgroup.SortIndexOfRowGroup=_value.SortIndexOfRowGroup;

				rowgroup.ScenarioId=_value.ScenarioId;

				table.listRowGroups.push(rowgroup);
			}
			else
			{
				var rowgroup=tmpgroup;
			}
		}

		// Check max and min range
		var checkFloatLimit = function(_dataname, _value) 
		{
			if ( null != _value )
			{
				// If number, check that it's in the range of AR's FLOAT (-9999999～9999999)
				if ( _value < -9999999 || 9999999 < _value )
				{
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, _dataname, _value, null, "Number outside AR's FLOAT range specified.\nPlease specify number between -9999999 and 9999999.");
				}
			}
		}

		// Create Row list
		if ( null != _value.RowId && null != table )
		{
			// Create Row under RowGroup if RowGroupId is set.
			if ( null != _value.RowGroupId && null != rowgroup)
			{
				var tmprow=TenkenData.TenkenTable.getRowFromRowGroup(rowgroup, _value.RowId);
				if ( null == tmprow )
				{
					var row=new Object();

					// Save Table and Group information into Row.
					for ( dataname in _value )
					{
						// Store Max/Min and base value for QAttribute name that starts with LimitValue.
						// Define for secondary value except for LimitHigh, LimitLow, and LimitBase.
						if ( null != _value[dataname] && dataname.substr(0,10) == "LimitValue" )
						{
							// Additional minimum, maximum, and base value (format: min;max;base)
							var limitInfoTmp = _value[dataname].split(";");
							var limitInfo = new Array(3);
							// Minimum value.
							limitInfo[0]=(Tenken.isNumber(limitInfoTmp[0]) == true) ? parseFloat(limitInfoTmp[0]) : null;
							// Maximum value.
							limitInfo[1]=(Tenken.isNumber(limitInfoTmp[1]) == true) ? parseFloat(limitInfoTmp[1]) : null;
							// Base value or the base RowId
							limitInfo[2] = limitInfoTmp[2];
							if ( null == row.listLimit ) row.listLimit = new Array();

							checkFloatLimit(dataname, limitInfo[0]);
							checkFloatLimit(dataname, limitInfo[1]);
							if( true == Tenken.isNumber(limitInfoTmp[2]) )
							{
								checkFloatLimit(dataname, limitInfo[2]);
							}

							// Add new.
							row.listLimit.push(limitInfo);
						}
						else
						{
							// Add new.
							row[dataname] = _value[dataname];
						}
					}

					rowgroup.listRows.push(row);
				}
				else
				{
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, "RowId", _value.RowId, null, "Same RowId exist in a group (Checklist item already exists)");
				}
			}
			else
			{
				// Create Row directly under Table if RowGroupId is null.
				var tmprow=TenkenData.TenkenTable.getRowFromTable(table, _value.RowId);
				if ( null == tmprow )
				{
					var row=new Object();

					// Save table and group information into Row.
					for ( dataname in _value )
					{
						// Store Max/Min and base value for QAttribute name that starts with LimitValue.
						// Define for secondary value except for LimitHigh, LimitLow, and LimitBase.
						if ( null != _value[dataname] && dataname.substr(0,10) == "LimitValue" )
						{
							// Additional minimum, maximum, and base value (format: min;max;base)
							var limitInfoTmp = _value[dataname].split(";");
							var limitInfo = new Array(3);
							// minimum value
							limitInfo[0]=(Tenken.isNumber(limitInfoTmp[0]) == true) ? parseFloat(limitInfoTmp[0]) : null;
							// maximum value
							limitInfo[1]=(Tenken.isNumber(limitInfoTmp[1]) == true) ? parseFloat(limitInfoTmp[1]) : null;
							// base value or base RowId.
							limitInfo[2] = limitInfoTmp[2];

							checkFloatLimit(dataname, limitInfo[0]);
							checkFloatLimit(dataname, limitInfo[1]);
							if( true == Tenken.isNumber(limitInfoTmp[2]) )
							{
								checkFloatLimit(dataname, limitInfo[2]);
							}


							if ( null == row.listLimit ) row.listLimit = new Array();
							row.listLimit.push(limitInfo);
						}
						else
						{
							row[dataname] = _value[dataname];
						}
					}

					table.listRowsTable.push(row);
				}
				else
				{
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, "RowId", _value.RowId, null, "Same RowId exist in a table (Checklist item already exists)");
				}
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.TenkenTable.createListTenkenTable\n" + e);
	}
}

// Check mandatory and duplicate data of received data.
// If there is an issue in data, output data error and return to initial screen.
//
// Check items
// QAttribute name : Check items
// TableId              : null
// TableName            : null
// RowId                : null
// RowName              : null
// RowGoupName          : null (Only when value is set in RowGroupId)
// ValueType            : null
// AssetId              : null
// TenkenType           : null
// DataEntryName        : null
// ScenarioId           : null
// We will not perform mandatory check for the follwing. When value is not set, set default.
// AssetStatusStoppable : If not set, proceed as true.
// SetLastData          : If not set, proceed as false.
TenkenData.TenkenTable.checkData = function(_data)
{
	try
	{
		var err=false;
		var errName=null;
		var errValue=null;
		var errMsg=null;

		if ( null == _data ) return;

		var funcCheck=function(_name)
		{
			if ( null == _data[_name] )
			{
				err=true;
				errName=_name;
			}
		}

		if ( false == err ) funcCheck("TableId");
		if ( false == err ) funcCheck("TableName");
		if ( false == err ) funcCheck("RowId");
		if ( false == err ) funcCheck("RowName");
		if ( false == err ) funcCheck("AssetId");
		if ( false == err ) funcCheck("TenkenType");
		if ( false == err ) funcCheck("DataEntryName");
		if ( false == err ) funcCheck("ScenarioId");
		if ( null != _data.RowGroupId )
		{
			if ( false == err ) funcCheck("RowGroupName");
		}
		if ( false == err ) funcCheck("ValueType");

		if ( true == err )
		{
			errMsg="Mandatory field without data exists";
		}
		else
		{
			// Check if selection is wrong
			if ( null != _data.ValueType )
			{
				switch(_data.ValueType)
				{
					case "NUMBER":
						// Selection is correct.
						// Check if DataEntryName has name with valid numbers
						if ( _data.DataEntryName != "F01" &&
							 _data.DataEntryName != "F02" &&
							 _data.DataEntryName != "F03" &&
							 _data.DataEntryName != "F04" &&
							 _data.DataEntryName != "F05" )
						{
							err=true;
							errName="DataEntryName";
							errValue=_data.DataEntryName;
							errMsg=_data.ValueType + "F01 to F05 is not specified for the type of DataEntryName\n";
						}
						break;
					case "WEATHER":
					case "OKNG":
					case "STRING":
					case "MARUBATSU":
						// Selection is correct.
						// Check if DataEntryName has name with valid numbers
						if ( _data.DataEntryName != "S01" &&
							 _data.DataEntryName != "S02" &&
							 _data.DataEntryName != "S03" &&
							 _data.DataEntryName != "S04" &&
							 _data.DataEntryName != "S05" )
						{
							err=true;
							errName="DataEntryName";
							errValue=_data.DataEntryName;
							errMsg=_data.ValueType + "S01 to S05 is not specified for the type of DataEntryName\n";
						}
						break;
					default:
						err=true;
						errName="ValueType";
						errValue=_data.ValueType;
						errMsg="Can not use specified type.";
						break;
				}
			}
		}

		// If error exists in data, output error and return to initial screen.
		if ( true == err )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, errName, errValue, null, errMsg);
		}
	}
	catch (e)
	{
		alert("Exception: TenkenData.TenkenTable.checkData\n" + e);
	}
}

// Process and copy downloaded TenkenData
TenkenData.TenkenTable.createDataList = function()
{
	try {
		if ( null == TenkenData.TenkenTable.arTenkenTable || null == TenkenData.TenkenTable.ListTables ) return;

		var datas = TenkenData.TenkenTable.arTenkenTable.getDataValue();
		if ( null == datas ) return;
		var countList=datas.length;
		for ( var i=0 ; i < countList ; i++ )
		{
			var dataValue=datas[i];
			if ( null != dataValue )
			{
				// Goto next item by removing from checklist, as it is invalid item if Disable="true" is set.
				if ( null != dataValue.Disable && "true" == dataValue.Disable.toLowerCase() )
				{
					continue;
				}

				// Check mandatory data
				TenkenData.TenkenTable.checkData(dataValue);

				TenkenData.TenkenTable.createListTenkenTable(dataValue);
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.TenkenTable.createDataList\n" + e);
	}
}

//============================================================================
// Manage entire retrieve data
//============================================================================

// Data management class (Entire data retrieval)
TenkenData.AllGet = function() {};

// Save scenario's callbacks
TenkenData.AllGet.downloadScenarioSuccessFunc=null;
TenkenData.AllGet.downloadScenarioErrorFunc=null;

// Save entire data callback (Except for scenario data)
TenkenData.AllGet.downloadSuccessFunc=null;
TenkenData.AllGet.downloadErrorFunc=null;

// Flag to determine if it's abort state
TenkenData.AllGet.abortON=false;

// Confirm if download is in progress
TenkenData.AllGet.getPhase = function()
{
	// Retrun status complete even if dowload is in progress if abort is set.
	if ( true == TenkenData.AllGet.abortON )
	{
		// Data retrieve complete or not retrieved.
		return(false);
	}

	// Confirm other than scenario and check results (tenkenevent)
	if ( (null != TenkenData.Asset.arAsset &&
			TenkenData.Asset.arAsset.getBusyStatus() == true) ||
		 (null != TenkenData.MsgEvent.arMessageEventLast &&
			TenkenData.MsgEvent.arMessageEventLast.getBusyStatus() == true ) ||
		 (null != TenkenData.UserData.arUserData &&
			TenkenData.UserData.arUserData.getBusyStatus() == true ) ||
		 (null != TenkenData.Scene.arScene &&
			TenkenData.Scene.arScene.getBusyStatus() == true ) ||
		 (null != TenkenData.SuperimposedGraphic.arSuperimposedGraphic&&
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.getBusyStatus() == true ) ||
		 (null != TenkenData.TenkenTable.arTenkenTable &&
			TenkenData.TenkenTable.arTenkenTable.getBusyStatus() == true ) ||
		 TenkenData.TenkenEvent.isGetPhase() == true )
	{
		// Data retrieve in progress
		return(true);
	}
	else
	{
		// Data retrieve complete or not retrieved
		return(false);
	}
}

// Check if download is in progress (Only Scenario data)
TenkenData.AllGet.getPhaseScenario = function()
{
	if (null != TenkenData.Scenario.arScenario && TenkenData.Scenario.arScenario.getBusyStatus() == true )
	{
		return(true);
	}
	else
	{
		return(false);
	}
}

// Download entire data (except for scenario and check results)
TenkenData.AllGet.download = function(_mode, _downloadSuccess, _downloadError)
{
	Tenken.Util.loginfo("GET_ALL_DATA1:START");

	// Save callback methods called after entire download
	TenkenData.AllGet.downloadSuccessFunc=_downloadSuccess;
	TenkenData.AllGet.downloadErrorFunc=_downloadError;

	// Set force reload mode
	var mode=( false == _mode ) ? false : true;
	TenkenData.setSuperReloadMode(mode);

	// Download each data

	// Scene data
	TenkenData.Scene.getScene();

	// AR Overlay data. Download without specifying scene ID and marker ID here.
	TenkenData.SuperimposedGraphic.getSuperimposedGraphic(Tenken.config.ScenarioId, null, null);

	// Asset data
	TenkenData.Asset.getLastData();

	// Checklist table data
	TenkenData.TenkenTable.getData();

	// Message data
	TenkenData.MsgEvent.getLastData();

	// Workder data
	TenkenData.UserData.getData();

}

// Download check results
TenkenData.AllGet.download2 = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA2:START");

	// Check results
	TenkenData.TenkenEvent.getLastData();
}


// Download scenarios
TenkenData.AllGet.downloadScenario = function(_mode, _downloadSuccess, _downloadError)
{
	Tenken.Util.loginfo("GET_ALL_DATA_SCENARIO:START");

	// Save callback called after entire download.
	TenkenData.AllGet.downloadScenarioSuccessFunc=_downloadSuccess;
	TenkenData.AllGet.downloadScenarioErrorFunc=_downloadError;

	// Set force reload mode.
	var mode=( false == _mode ) ? false : true;
	TenkenData.setSuperReloadMode(mode);

	// Scenario data
	TenkenData.Scenario.getScenario();

}

// Save each data into local storage (except for scenario)
TenkenData.AllGet.saveStorage = function()
{
	TenkenData.Asset.saveStorage();
	TenkenData.MsgEvent.saveStorage();
	TenkenData.TenkenEvent.saveStorage();
	TenkenData.UserData.saveStorage();
	TenkenData.Scene.saveStorage();
	TenkenData.SuperimposedGraphic.saveStorage();
	TenkenData.TenkenTable.saveStorage();
}

// Load each data from local storage (except for scenario)
TenkenData.AllGet.loadStorage = function()
{
	TenkenData.Asset.loadStorage();
	TenkenData.MsgEvent.loadStorage();
	TenkenData.TenkenEvent.loadStorage();
	TenkenData.UserData.loadStorage();
	TenkenData.Scene.loadStorage();
	TenkenData.SuperimposedGraphic.loadStorage();
	TenkenData.TenkenTable.loadStorage();
}

// Save scenario data into local storage
TenkenData.AllGet.saveStorageScenario = function()
{
	TenkenData.Scenario.saveStorage();
}

// Load scenario data from local storage
TenkenData.AllGet.loadStorageScenario = function()
{
	TenkenData.Scenario.loadStorage();
}

// The method will be called after download has completed except for scenario and check results.
// If success, entire data will be stored in local storage and displays operator who downloaded in the operator list.
TenkenData.AllGet.afterDownload = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA1:END:SUCCESS");

	TenkenData.AllGet.download2();
}

// Delete items that is not needed for selected scenario
// (Delete ScenarioId=0 or none selected scenario)
TenkenData.AllGet.SkipDisableData = function()
{
	try {

		//--------------------------------------------------
		// Re-create list that are valid assets only for
		// selected scenario.
		//--------------------------------------------------

		var tmpListAsset=[];

		// Retrieve valid asset ID inside checklist table
		var listAssets=new Object();

		var funcRow=function(_table, _group, _row, _poi, _valueEntryName, _value, _assetstatus)
		{
			if ( null == _row ) return;
			// Save selected assetid those are valid within the checklist
			listAssets[_row.AssetId]=_row.AssetId;
		}

		TenkenData.TenkenTable.foreachTables(null, null, null, funcRow);

		// Re-create asset list those checklist are only valid from selected assetid list.
		// Make array list of assetid for items that is not used in checklist table.
		var found=0;
		var arrayDeleteAsset=[];
		for ( var i = 0 ; i < TenkenData.Asset.ListAll.length ; i++ )
		{
			found=0;
			for ( assetid in listAssets )
			{
				if ( assetid == TenkenData.Asset.ListAll[i].assetid )
				{
					found=1;
					break;
				}
			}
			if ( 0 == found )
			{
				arrayDeleteAsset.push(TenkenData.Asset.ListAll[i].assetid);
			}
		}
		if ( 0 < arrayDeleteAsset.length )
		{
			for ( var i =0 ; i < arrayDeleteAsset.length ; i++ )
			{
				TenkenData.Asset.deleteAsset(arrayDeleteAsset[i]);
			}
		}

		//--------------------------------------------------
		// Re-create AR overlay data those are valid from
		// Marker ID from selected scenario
		//--------------------------------------------------
		// Create valid marker ID list
		var listMarkerIds=new Object();
		for ( var aid in listAssets )
		{
			var mid=-1;
			mid=TenkenData.Asset.getMarkerIdfromAssetId(aid);
			listMarkerIds[mid]=mid;
		}

		// Delete invalid marker id data from AR overlay data
		for(var scene in TenkenData.SuperimposedGraphic.objSuperimposedGraphics)
		{
			var listScenes=TenkenData.SuperimposedGraphic.objSuperimposedGraphics[scene];

			for(var markerid in listScenes)
			{
				if ( null == listMarkerIds[markerid] )
				{
					delete TenkenData.SuperimposedGraphic.objSuperimposedGraphics[scene][markerid];
				}
			}
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.AllGet.SkipDisableData\n" + e);
	}
}

// Post process after entire data download
TenkenData.AllGet.afterDownload2 = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA2:END:SUCCESS");

	TenkenData.AllGet.SkipDisableData();

	TenkenData.AllGet.saveStorage();

	// Pre download.
	TenkenData.AllGet.PreloadData();

	// Call operator list in operator selection windows and download complete callback methods (if registered) after entire download is complete.
	var elm = document.getElementById("operatorselect");
	if ( null != elm )
	{
		elm.innerHTML=TenkenData.UserData.getUserNameHTML();
	}
	if ( null != TenkenData.AllGet.downloadSuccessFunc )
	{
		TenkenData.AllGet.downloadSuccessFunc();
	}
}

// Called when download failed (after completion of entire data).
// End by displaying error message.
TenkenData.AllGet.afterDownloadError = function(_errorMsg)
{
	Tenken.Util.logerr("GET_ALL_DATA1:END:ERROR:" + _errorMsg);

	if ( null != TenkenData.AllGet.downloadErrorFunc )
	{
		// Clear callback so it will only be called once.
		var func=TenkenData.AllGet.downloadErrorFunc;
		TenkenData.AllGet.downloadErrorFunc=null;
		func(_errorMsg);
	}
}

// If error exists on operator data when recieving data, clear the data and return to initial screen (index.html)
TenkenData.AllGet.abortInvalidData = function(_table, _qattribute, _value, _msghead, _msg)
{
	// Do nothing while abort in progress.
	if ( true == TenkenData.AllGet.abortON ) return;

	TenkenData.AllGet.abortON=true;

	// Delete storage and AR's offline storage data
	Tenken.Storage.clear();
	AR.Data.clearResourceStorage(Tenken.Util.noop, Tenken.Util.noop);

	// Output message
	var str="";
	if ( null != _msghead )
	{
		str=_msghead;
	}
	else
	{
		str="Error in data.\n\n";
	}
	if ( _table ) str += "Table name=" + _table + "\n";
	if ( _qattribute ) str += "QAttribute name=" + _qattribute + "\n";
	if ( _value ) str += "value=" + _value + "\n";
	if ( _msg ) str += "\n" + _msg + "\n";
	str += "\nAboring process. Returning to initial screen.\n";
	alert(str);

	// Move to initial screen
	location.replace(TenkenConst.PageName.top);
}


// Pre download
TenkenData.AllGet.PreloadData = function()
{

	// check if predownload is invalid.
	var skipPreload=false;
	var skipPreloadSG=false;
	var skipPreloadAsset=false;

	if ( null != Tenken.config.ScenarioId && 0 < TenkenData.Scenario.ListAll.length)
	{
		var lenScenaio=TenkenData.Scenario.ListAll.length;
		for ( var i=0 ; i < lenScenaio; i++ )
		{
			var asset=TenkenData.Scenario.ListAll[i];
			if ( Tenken.config.ScenarioId == TenkenData.Scenario.ListAll[i].scenarioId )
			{
				if ( 0 <= asset.description.indexOf("#unpreload#"))		
				{
					// Value set. Invalidate pre-download of selected scenario.
					skipPreload=true;
				}
				if ( 0 <= asset.description.indexOf("#unpreloadsg#"))
				{
					// Value set. Invalidate pre-download of AR overlay data.
					skipPreloadSG=true;
				}
				if ( 0 <= asset.description.indexOf("#unpreloadasset#"))		
				{
					// Value set. Invalidate pre-download of files of additional icons in asset table.
					skipPreloadAsset=true;
				}
			}
		}
	}
	if ( false == Tenken.config.preloadFile || true == skipPreload )
	{
		return;  // Do nothing as we're skipping predownload.
	}

	preloadSuperimposedGraphics = [];

	//Pre download AR overlay data
	if ( true != skipPreloadSG )
	{
		var listSG=TenkenData.SuperimposedGraphic.objSuperimposedGraphics;
		if ( null != listSG )
		{
			for(scene in listSG)
			{
				if( null != listSG[scene])
				{
					for(marker in listSG[scene])
					{
						var arraySG=listSG[scene][marker];
						if ( null != arraySG && 0 < arraySG.length )
						{
							for ( var i=0 ; i < arraySG.length ; i++ )
							{
								var sg=arraySG[i];
								if ( null != sg )
								{
									preloadSuperimposedGraphics.push(sg);
								}
							}
						}
					}
				}
			}
		}

		if ( 0 < preloadSuperimposedGraphics.length )
		{
			Tenken.ARRendering.createSuperimposedGraphicsPreload(preloadSuperimposedGraphics);
		}
	}

	// Pre download if URL is specified for additional icon of assets.
	if ( false == Tenken.config.preloadAssetFile || true == skipPreloadAsset )
	{
		return;  // Do nothing as we're skipping pre dowload.
	}

	if ( !AR.Data.cacheUrlResource ) return;

	var len=TenkenData.Asset.ListAll.length;
	for ( var i=0 ; i < len ; i++ )
	{
		var asset=TenkenData.Asset.ListAll[i];
		if ( null != asset && null != asset.listICON)
		{
			var lenListIcon=asset.listICON.length;
			for ( var j = 0 ; j < lenListIcon ; j++ )
			{
				if ( null == asset.listICON[j] ) continue;

				var iconInfo=asset.listICON[j];
				if ( null == iconInfo[2] || "" == iconInfo[2] ) continue;

				// Remove non http value.
				// Also remove value that do not start with http:// and minimum of 8 chars.
				var strURL=iconInfo[2];
				if (  strURL.length < 8 ) continue; 
				if (  0 <= strURL.indexOf("?") ) continue;
				var strProtcol=strURL.substring(0,4);
				if ( "http" != strProtcol.toLowerCase() ) continue;

				AR.Data.cacheUrlResource(strURL, Tenken.Util.noop, Tenken.Util.noop);
			}

		}

	}

}

//============================================================================
// Data send (Check result: tenkenevent)
//============================================================================


// Sequence value to hand over to callback upon sending check results
TenkenData.TenkenEvent.onSuccess = null;
TenkenData.TenkenEvent.onError = null;
TenkenData.TenkenEvent.cbValue = null;

// Create check data
TenkenData.TenkenEvent.createTenkenDataQuad = function(_data)
{
	// Create QUAD
	var quad = new TenkenARvalue.Quad(TenkenConst.TableName.tenkenevent);

	// Set type name of QUAD
	quad.qtypeName = TenkenConst.TableName.tenkenevent;

	var Id       = ( null != _data.tenken_id ) ? new TenkenARvalue.QValue(quad.qtypeName,  "tenkenid", null, _data.tenken_id, null) : null;
	var Name     = ( null != _data.tenken_name ) ? new TenkenARvalue.QValue(quad.qtypeName,  "tenkenname", _data.tenken_name, null, null) : null;
	var Description = ( null != _data.description ) ? new TenkenARvalue.QValue(quad.qtypeName,  "description", _data.description, null, null) : null;
	var Type = ( null != _data.type ) ? new TenkenARvalue.QValue(quad.qtypeName,  "type", _data.type, null, null) : null;
	var Registrationtime = ( null != _data.registrationtime ) ? new TenkenARvalue.QValue(quad.qtypeName,  "registrationtime", null, _data.registrationtime, null) : null;
	var RegDatetimeStr = ( null != _data.regDatetimeStr ) ? new TenkenARvalue.QValue(quad.qtypeName,  "regDatetimeStr", _data.regDatetimeStr, null, null) : null;
	var Registrant = ( null != _data.registrant ) ? new TenkenARvalue.QValue(quad.qtypeName,  "registrant", _data.registrant, null, null) : null;
	var Markerid = ( null != _data.markerid ) ? new TenkenARvalue.QValue(quad.qtypeName,  "markerid", null, _data.markerid, null) : null;
	var Markername = ( null != _data.markername ) ? new TenkenARvalue.QValue(quad.qtypeName,  "markername", _data.markername, null, null) : null;
	var Targetassetid = ( null != _data.targetassetid ) ? new TenkenARvalue.QValue(quad.qtypeName,  "targetassetid", _data.targetassetid, null, null) : null;
	var AssetStatus = ( null != _data.assetstatus ) ? new TenkenARvalue.QValue(quad.qtypeName,  "assetstatus", _data.assetstatus, null, null) : null;
	var Occurrencetime = ( null != _data.occurrencetime ) ? new TenkenARvalue.QValue(quad.qtypeName,  "occurrencetime", null, _data.occurrencetime, null) : null;
	var OccDatetimeStr = ( null != _data.occDatetimeStr ) ? new TenkenARvalue.QValue(quad.qtypeName,  "occDatetimeStr", _data.occDatetimeStr, null, null) : null;
	var Operator = ( null != _data.operator ) ? new TenkenARvalue.QValue(quad.qtypeName,  "operator", _data.operator, null, null) : null;
	var ScenarioId = ( null != _data.ScenarioId ) ? new TenkenARvalue.QValue(quad.qtypeName,  "ScenarioId", null, _data.ScenarioId, null) : null;

	var F01 = ( null != _data.F01 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "F01", null, null, _data.F01) : null;
	var F02 = ( null != _data.F02 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "F02", null, null, _data.F02) : null;
	var F03 = ( null != _data.F03 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "F03", null, null, _data.F03) : null;
	var F04 = ( null != _data.F04 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "F04", null, null, _data.F04) : null;
	var F05 = ( null != _data.F05 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "F05", null, null, _data.F05) : null;
	var S01 = ( null != _data.S01 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "S01", _data.S01, null, null) : null;
	var S02 = ( null != _data.S02 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "S02", _data.S02, null, null) : null;
	var S03 = ( null != _data.S03 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "S03", _data.S03, null, null) : null;
	var S04 = ( null != _data.S04 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "S04", _data.S04, null, null) : null;
	var S05 = ( null != _data.S05 ) ? new TenkenARvalue.QValue(quad.qtypeName,  "S05", _data.S05, null, null) : null;

	// Set valid QValue of QUAD.
	var values =[];
	if ( null != Id ) values.push(Id);
	if ( null != Name ) values.push(Name);
	if ( null != Description ) values.push(Description);
	if ( null != Type ) values.push(Type);
	if ( null != Registrationtime ) values.push(Registrationtime);
	if ( null != RegDatetimeStr ) values.push(RegDatetimeStr);
	if ( null != Registrant ) values.push(Registrant);
	if ( null != Markerid ) values.push(Markerid);
	if ( null != Markername ) values.push(Markername);
	if ( null != Targetassetid ) values.push(Targetassetid);
	if ( null != AssetStatus ) values.push(AssetStatus);
	if ( null != Occurrencetime ) values.push(Occurrencetime);
	if ( null != OccDatetimeStr ) values.push(OccDatetimeStr);
	if ( null != Operator ) values.push(Operator);
	if ( null != ScenarioId ) values.push(ScenarioId);

	if ( null != F01 ) values.push(F01);
	if ( null != F02 ) values.push(F02);
	if ( null != F03 ) values.push(F03);
	if ( null != F04 ) values.push(F04);
	if ( null != F05 ) values.push(F05);
	if ( null != S01 ) values.push(S01);
	if ( null != S02 ) values.push(S02);
	if ( null != S03 ) values.push(S03);
	if ( null != S04 ) values.push(S04);
	if ( null != S05 ) values.push(S05);
	quad.qvalues=values;

	// Transform to string.
	var rtndata = JSON.stringify(quad);
	return rtndata;
};


// Success callback method upon upload (Check result data)
TenkenData.TenkenEvent.cbPostSuccess = function(_result)
{
	if ( null != TenkenData.TenkenEvent.onSuccess ) TenkenData.TenkenEvent.onSuccess(TenkenData.TenkenEvent.cbValue);
};

// Error callback method upon upload (Check result data)
TenkenData.TenkenEvent.cbPostError = function(_result)
{
	try
	{
		var message = "Failed to upload check results. Please check operation mode and network connectivity.";
		var detail="";

		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr("POST_TENKENEVENT_RESPONSE:ERROR:" + message + ":" + detail);

		alert("Failed to upload check results.\n\nPlease check operation mode and network connectivity.\n\nPlease restart Tenken application if network is online.\n\n" + detail);


	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenEvent.cbPostError\n" + e);
	}

	if ( null != TenkenData.TenkenEvent.onError ) TenkenData.TenkenEvent.onError(TenkenData.TenkenEvent.cbValue);
};

// Send check results.
// _markerids : Specify marker ID to send. Array.
//              Send everything if null is set.
// _submitall : false: Do not send check results for asset that is in STOP state.
//              true or other: Send check results for asset that is even in STOP state.
TenkenData.TenkenEvent.submitTenkenEvent = function(_markerids, _submitall, _onSuccess, _onError, _value)
{
	try
	{
		if ( null != _onSuccess ) TenkenData.TenkenEvent.onSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.TenkenEvent.onError = _onError;
		if ( null != _value ) TenkenData.TenkenEvent.cbValue = _value;

		var tenkenlists = [];
		// Change registered DateTime to send DateTime and send data.
		var nowdatetime=new Date().getTime();

		TenkenData.TenkenTable.foreachTables(
			TenkenData.TenkenEvent.Current,
			null,
			null,
			function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
			{
				if ( null == _poi2 ) return;

				if ( false == _submitall && "STOP" == _assetstatus )
				{
					// Do not send check results for asset in STOP state.
					return;
				}

				// IF marker id array is specified, check if item are target to send, and if not, skip them.
				if ( null != _markerids )
				{
					var targetid=false;
					for ( var j = 0 ; j < _markerids.length ; j++ )
					{
						// Mark as send target if marker ID is selected or marker ID is 0.
						if ( _markerids[j] == _poi2.markerid )
						{
							targetid=true;
							break;
						}
					}
					if ( true != targetid )
					{
						// Skip and proceed to next as it is not the target marker id.
						return;
					}
				}

				var replaceindex = -1;
				var tmptenken = null;

				for ( var l = 0 ; l < tenkenlists.length ; l++ )
				{
					tmptenken = tenkenlists[l];
					if ( _table.TableId == tmptenken.table_id &&
						 (null == _group || _group.RowGroupdId == tmptenken.rowgroups_id) &&
						 _row.TenkenType == tmptenken.type )
					{
						replaceindex = l;
						break;
					}
				}
				if ( -1 != replaceindex )
				{
					var tenken=tmptenken;
				}
				else
				{
					var startdatetime = Tenken.Storage.startDatetime.get();
					if ( null == startdatetime )
					{
						startdatetime = nowdatetime;
					}
					var operator = Tenken.Storage.operator.get();

					var tenken = {};
					tenken.table_id = _table.TableId;
					tenken.table_name = _table.TableName;
					tenken.rowgroups_id = ( _group )  ? _group.RowGroupdId : null;
					tenken.rowgroups_name = ( _group )  ? _group.RowGroupdName : null;
					tenken.tenken_id = nowdatetime; // Use current DateTime as tenkenid.
					if ( null != _group && null != _group.RowGroupdName )
					{
						tenken.tenken_name = _table.TableName + "_" + _group.RowGroupdName;
					}
					else
					{
						tenken.tenken_name = _table.TableName;
					}
					tenken.description = _poi2.description;
					tenken.type = _poi2.type;
					tenken.registrationtime = nowdatetime;
					tenken.regDatetimeStr = new Tenken.DatetimeValue(nowdatetime).toStringFullTime();
					tenken.registrant =  operator;
					tenken.markerid =  _poi2.markerid;
					tenken.markername = _poi2.markername;
					tenken.targetassetid =  _row.AssetId;
					tenken.assetstatus = (_assetstatus != null) ? _assetstatus : "START";
					tenken.occurrencetime = startdatetime;
					tenken.occDatetimeStr = new Tenken.DatetimeValue(startdatetime).toStringFullTime();
					tenken.operator = operator;
					tenken.ScenarioId=Tenken.config.ScenarioId;
				}
				// Do not set checklist value of F01-F05, and S01-S05 for stopped assets
				if ( "STOP" != _assetstatus )
				{
					/* entryname: F01 F02 F03 F04 F05 S01 S02 S03 S04 S05 */
					tenken[_row.DataEntryName]=_value;
				}

				if ( -1 != replaceindex )
				{
					tenkenlists[replaceindex]=tenken;
				}
				else
				{
					tenkenlists.push(tenken);
				}
			}
		);

		if ( tenkenlists.length <= 0  )
		{
			alert("No valid data to send.");

			// Do not send if there is nothing registered.
			// Call success callback method.
			if ( null != _onSuccess )
			{
				_onSuccess(_value);
			}
			else
			{
				return;
			}
		}

		// Create send data and store 
		for ( var j = 0 ; j < tenkenlists.length ; j++ )
		{
			TenkenData.TenkenEvent.arTenkenEventCurrent.addPostData(
				TenkenData.TenkenEvent.createTenkenDataQuad(tenkenlists[j]));
		}

		TenkenData.TenkenEvent.arTenkenEventCurrent.postArData(
			TenkenData.TenkenEvent.cbPostSuccess,
			TenkenData.TenkenEvent.cbPostError);
	}
	catch(e) {
		alert("Error occured while uploading check results.\n" + e);
		return false;
	}
}

//============================================================================
// Data send (Messages: messageevent)
//============================================================================

// Sequence value to hand over to callback upon sending check results
TenkenData.MsgEvent.onPostSuccess = null;
TenkenData.MsgEvent.onPostError = null;
TenkenData.MsgEvent.cbPostValue = null;

// Create operator data to register.
TenkenData.MsgEvent.CreateCommentDataQuad = function(_data)
{
	// Create QUAD
	var quad = new TenkenARvalue.Quad(TenkenConst.TableName.messageevent);

	// Set type name of QUAD
	quad.qtypeName = TenkenConst.TableName.messageevent;

	// Create attributes of QUAD

	var Id = ( null != _data.msgid ) ? new TenkenARvalue.QValue(quad.qtypeName,  "msgid", null, _data.msgid, null) : null;
	var Name = ( null != _data.msgname ) ? new TenkenARvalue.QValue(quad.qtypeName,  "msgname", _data.msgname, null, null) : null;
	var Description = ( null != _data.description ) ? new TenkenARvalue.QValue(quad.qtypeName,  "description", _data.description, null, null) : null;
	var Registrationtime = ( null != _data.registrationtime ) ? new TenkenARvalue.QValue(quad.qtypeName,  "registrationtime", null, _data.registrationtime, null) : null;
	var RegDatetimeStr = ( null != _data.regDatetimeStr ) ? new TenkenARvalue.QValue(quad.qtypeName,  "regDatetimeStr", _data.regDatetimeStr, null, null) : null;
	var Registrant = ( null != _data.registrant ) ? new TenkenARvalue.QValue(quad.qtypeName,  "registrant", _data.registrant, null, null) : null;
	var Markerid = ( null != _data.markerid ) ? new TenkenARvalue.QValue(quad.qtypeName,  "markerid", null, _data.markerid, null) : null;
	var Markername = ( null != _data.markername ) ? new TenkenARvalue.QValue(quad.qtypeName,  "markername", _data.markername , null, null) : null;
	var X = ( null != _data.x ) ? new TenkenARvalue.QValue(quad.qtypeName,  "x", null, null, _data.x) : null;
	var Y = ( null != _data.y ) ? new TenkenARvalue.QValue(quad.qtypeName,  "y", null, null, _data.y) : null;
	var Z = ( null != _data.z ) ? new TenkenARvalue.QValue(quad.qtypeName,  "z", null, null, _data.z) : null;
	var Targetassetid = ( null != _data.targetassetid ) ? new TenkenARvalue.QValue(quad.qtypeName,  "targetassetid", _data.targetassetid , null, null) : null;
	var Title = ( null != _data.title ) ? new TenkenARvalue.QValue(quad.qtypeName,  "title", _data.title, null, null) : null;
	var Level = ( null != _data.level ) ? new TenkenARvalue.QValue(quad.qtypeName,  "level", null, _data.level, null) : null;
	var Value = ( null != _data.value ) ?  new TenkenARvalue.QValue(quad.qtypeName,  "value",  _data.value, null, null) : null;
	var Occurrencetime = ( null != _data.occurrencetime ) ? new TenkenARvalue.QValue(quad.qtypeName,  "occurrencetime",  null, _data.occurrencetime, null) : null;
	var OccDatetimeStr = ( null != _data.occDatetimeStr ) ? new TenkenARvalue.QValue(quad.qtypeName,  "occDatetimeStr",  _data.occDatetimeStr, null, null) : null;
	var Operator = ( null != _data.operator ) ? new TenkenARvalue.QValue(quad.qtypeName,  "operator",  _data.operator, null, null) : null;
	var ScenarioId = ( null != _data.ScenarioId ) ? new TenkenARvalue.QValue(quad.qtypeName,  "ScenarioId", null, _data.ScenarioId, null) : null;
	var Enable = ( null != _data.Enable ) ? new TenkenARvalue.QValue(quad.qtypeName,  "Enable", _data.Enable, null, null) : null;
	var Answer = ( null != _data.Answer ) ? new TenkenARvalue.QValue(quad.qtypeName,  "Answer", _data.Answer, null, null) : null;

	// Set valid QValue to QUAD
	var values =[];
	if ( null != Id ) values.push(Id);
	if ( null != Name ) values.push(Name);
	if ( null != Description ) values.push(Description);
	if ( null != Registrationtime ) values.push(Registrationtime);
	if ( null != RegDatetimeStr ) values.push(RegDatetimeStr);
	if ( null != Registrant ) values.push(Registrant);
	if ( null != Markerid ) values.push(Markerid);
	if ( null != Markername ) values.push(Markername);
	if ( null != X ) values.push(X);
	if ( null != Y ) values.push(Y);
	if ( null != Z ) values.push(Z);
	if ( null != Targetassetid ) values.push(Targetassetid);
	if ( null != Title ) values.push(Title);
	if ( null != Level ) values.push(Level);
	if ( null != Value ) values.push(Value);
	if ( null != Occurrencetime ) values.push(Occurrencetime);
	if ( null != OccDatetimeStr ) values.push(OccDatetimeStr);
	if ( null != Operator ) values.push(Operator);
	if ( null != ScenarioId ) values.push(ScenarioId);
	if ( null != Enable ) values.push(Enable);
	if ( null != Answer ) values.push(Answer);
	quad.qvalues=values;

	// Transform into string.
	var rtndata = JSON.stringify(quad);
	return rtndata;
};

// Success callback handler upon upload (Messages)
TenkenData.MsgEvent.cbPostSuccess = function(_result)
{
	if ( null != TenkenData.MsgEvent.onPostSuccess ) TenkenData.MsgEvent.onPostSuccess(TenkenData.MsgEvent.cbPostValue);
};

// Error callback handler upon upload (Messages)
TenkenData.MsgEvent.cbPostError = function(_result)
{
	try {
		var message = "Failed to upload messages. Please check operation mode and network connectivity.";
		var detail="";
		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr(message, detail);

		alert("Failed to upload messages.\n\nPlease check operation mode and network connectivity.\n\nPlease restart Tenken application if network is online.\n\n" + detail);

		Tenken.Util.logerr("POST_MSGEVENT_RESPONSE:ERROR:" + message + ":" + detail);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.cbPostError \n" + e);
	}
	if ( null != TenkenData.MsgEvent.onPostError ) TenkenData.MsgEvent.onPostError(TenkenData.MsgEvent.cbPostValue);
};

// Send Messages
TenkenData.MsgEvent.submitMsgEvent = function(_markerids, _onSuccess, _onError, _value)
{
	try
	{
		if ( null != _onSuccess ) TenkenData.MsgEvent.onPostSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.MsgEvent.onPostError = _onError;
		if ( null != _value ) TenkenData.MsgEvent.cbPostValue = _value;

		// Change registered DateTime to send DateTime and send data.
		var nowdatetime=new Date().getTime();

		// Messages (New registration)
		// Do not send if nothing is registered.
		if ( TenkenData.MsgEvent.Current.length <= 0 )
		{
			// Call success callback method.
			if ( null != _onSuccess )
			{
				_onSuccess(_value);
			}
			else
			{
				return;
			}
		}

		for ( var i = 0 ; i < TenkenData.MsgEvent.Current.length ; i++ )
		{
			var msgevent=TenkenData.MsgEvent.Current[i];

			// IF marker id array is specified, check if item are target to send, and if not, skip them.
			if ( null != _markerids )
			{
				var targetid=false;
				for ( var j = 0 ; j < _markerids.length ; j++ )
				{
					if ( _markerids[j] == msgevent.markerid )
					{
						targetid=true;
						break;
					}
				}
				if ( true != targetid )
				{
					// Skip and proceed to next as it is not the target marker id.
					continue;
				}
			}

			// Change registered DateTime to send DateTime and send data.
			msgevent.registrationtime =nowdatetime;
			msgevent.regDatetimeStr = new Tenken.DatetimeValue(nowdatetime).toStringFullTime();

			TenkenData.MsgEvent.arMessageEventCurrent.addPostData(
				TenkenData.MsgEvent.CreateCommentDataQuad(msgevent));
		}


		Tenken.Util.loginfo("POST_MSGEVENT_REQUEST:allcount:" + TenkenData.MsgEvent.Current.length);

		TenkenData.MsgEvent.arMessageEventCurrent.postArData(
			TenkenData.MsgEvent.cbPostSuccess,
			TenkenData.MsgEvent.cbPostError);

	}
	catch(e) {
		alert("Error occured uploading Messages.\n" + e);
		return false;
	}
}

//============================================================================
// Data send (Completion report:messageevent)
//============================================================================

// Sequence value to hand over to callback upon sending completion report
TenkenData.MsgEvent.arCompleteMessageEvent=null;
TenkenData.MsgEvent.onCompletePostSuccess = null;
TenkenData.MsgEvent.onCompletePostError = null;
TenkenData.MsgEvent.cbCompletePostValue = null;

// Success callback method upon upload (Completion result)
TenkenData.MsgEvent.completeMsgEventSuccess = function(_result)
{
	if ( null != TenkenData.MsgEvent.onCompletePostSuccess ) TenkenData.MsgEvent.onCompletePostSuccess(TenkenData.MsgEvent.cbCompletePostValue);
};

// Error callback method upon upload (Completion result)
TenkenData.MsgEvent.completeMsgEventError = function(_result)
{
	try
	{
		var message = "Failed to updalod Messages (Completion report)\n\nPlease check operation mode and network connectivity.\n\nPlease restart Tenken application if network is online.";
		var detail="";

		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr(message, detail);

		alert(message + "\n\n" + detail);

		Tenken.Util.logerr("POST_COMPLETEMSGEVENT_RESPONSE:ERROR:" + message + ":" + detail);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.completeMsgEventError\n" + e);
	}
	if ( null != TenkenData.MsgEvent.onCompletePostError ) TenkenData.MsgEvent.onCompletePostError(TenkenData.MsgEvent.cbCompletePostValue);
};

// Send completion report of messages (update exsting messages)
TenkenData.MsgEvent.completeMsg = function(_onSuccess, _onError, _value)
{
	if ( null != _onSuccess ) TenkenData.MsgEvent.onCompletePostSuccess = _onSuccess;
	if ( null != _onError ) TenkenData.MsgEvent.onCompletePostError = _onError;
	if ( null != _value ) TenkenData.MsgEvent.cbCompletePostValue = _value;

	if ( null == TenkenData.MsgEvent.arCompleteMessageEvent ) TenkenData.MsgEvent.arCompleteMessageEvent=new TenkenARdata(TenkenConst.TableName.messageevent);

	TenkenData.MsgEvent.deleteMsgEventDatas.length = 0

	for ( var i = 0 ; i < TenkenData.MsgEvent.Last.length ; i++ )
	{
		var msgevent=TenkenData.MsgEvent.Last[i];

		if ( "true" != msgevent.Enable && null != msgevent.Answer)
		{
			TenkenData.MsgEvent.arCompleteMessageEvent.addPostData(
				TenkenData.MsgEvent.CreateCommentDataQuad(msgevent));

			// Add original version and QentityId to delete list.
			var deleteMsg=new Object();
			deleteMsg.version=msgevent.version;
			deleteMsg.qentityId=msgevent.qentityId;
			TenkenData.MsgEvent.deleteMsgEventDatas.push(deleteMsg);

		}
	}

	if ( 0 == TenkenData.MsgEvent.deleteMsgEventDatas.length )
	{
		// End by calling success callback method as there is no completion report.
		if ( null != _onSuccess ) _onSuccess(_value);
		return;
	}

	TenkenData.MsgEvent.arCompleteMessageEvent.postArData(
		TenkenData.MsgEvent.completeMsgEventSuccess,
		TenkenData.MsgEvent.completeMsgEventError);

}

//============================================================================
// Data delete (Original data for completion report:messageevent)
//============================================================================

// Sequence value to hand over to callback upon deleting completion report
TenkenData.MsgEvent.arDeleteteMessageEvent=null;
TenkenData.MsgEvent.onDeleteSuccess = null;
TenkenData.MsgEvent.onDeleteError = null;
TenkenData.MsgEvent.cbDeleteValue = null;

// List to delete completion report
TenkenData.MsgEvent.deleteMsgEventDatas = [];

// Success callback method when message deletion of completion report registration has ended
TenkenData.MsgEvent.deleteMsgEventSuccess = function(_result)
{
	try
	{
		// Clear send data.
		TenkenData.MsgEvent.deleteMsgEventDatas.length=0;

		// Delete messages where completion report is set.
		TenkenData.MsgEvent.deleteMsgEventDisable();

		if ( null != TenkenData.MsgEvent.onDeleteSuccess ) TenkenData.MsgEvent.onDeleteSuccess(TenkenData.MsgEvent.cbDeleteValue);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.deleteMsgEventSuccess\n" + e);
	}
};

// Error callback method when message deletion of completion report registration has ended
TenkenData.MsgEvent.deleteMsgEventError = function(_result)
{
	try
	{
		var message = "Failed to uplaod messages (modify completion report)\n\nPlease check operation mode and network connectivity.\n\nPlease restart Tenken application if network is online.";
		var detail="";

		var ErrorStatus=0;
		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
			ErrorStatus=_result.getValue().status;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr(message, detail);

		// Clear send data.
		TenkenData.MsgEvent.deleteMsgEventDatas.length=0;

		// It sometimes return with 404 Not Found upon delete.
		// When 404 is returned, process the same as success.

		if ( 404 == ErrorStatus )
		{
			// Call upload success callback method
			if ( null != TenkenData.MsgEvent.onDeleteSuccess ) TenkenData.MsgEvent.onDeleteSuccess(TenkenData.MsgEvent.cbDeleteValue);
			return;
		}
		else
		{
			alert(message + "\n\n" + detail);
		}

		Tenken.Util.logerr("DELETE_MSGEVENT_RESPONSE:ERROR:" + message + ":" + detail);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.deleteMsgEventError\n" + e);
	}
	if ( null != TenkenData.MsgEvent.onDeleteError ) TenkenData.MsgEvent.onDeleteError(TenkenData.MsgEvent.cbDeleteValue);
};

// Delete original message that has completed report.
TenkenData.MsgEvent.deleteMsgEvent = function(_onSuccess, _onError, _value)
{
	try {
		if ( null != _onSuccess ) TenkenData.MsgEvent.onDeleteSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.MsgEvent.onDeleteError = _onError;
		if ( null != _value ) TenkenData.MsgEvent.cbDeleteValue = _value;

		// Check if delete data exists after completion report.
		var lenDeleteMsg=TenkenData.MsgEvent.deleteMsgEventDatas.length;
		if ( lenDeleteMsg <= 0 )
		{
			// Data not present. Call success callback method.
			if ( null != _onSuccess ) _onSuccess(_value);
			 return;
		}

		if ( null == TenkenData.MsgEvent.arDeleteteMessageEvent ) TenkenData.MsgEvent.arDeleteteMessageEvent=new TenkenARdata(TenkenConst.TableName.messageevent);

		Tenken.Util.loginfo("DELETE_MSGEVENT_REQUEST:allcount:" + lenDeleteMsg);
		for ( var i=0 ; i < lenDeleteMsg ; i++ )
		{
			var deleteMsg=TenkenData.MsgEvent.deleteMsgEventDatas[i];
			var deleteData=new TenkenARvalue.QDelete(deleteMsg.qentityId, deleteMsg.version );

			TenkenData.MsgEvent.arDeleteteMessageEvent.addDeleteData(deleteData);
		}
		TenkenData.MsgEvent.arDeleteteMessageEvent.deleteArData(TenkenData.MsgEvent.deleteMsgEventSuccess, TenkenData.MsgEvent.deleteMsgEventError);
	}
	catch (e)
	{
		alert("Exception : Tenken.GUI.deleteMsgEvent\n" + e);
	}
}
