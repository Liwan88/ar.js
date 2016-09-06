/**
 * @overview JavaScript API of Storages used in Tenken
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * Namespace for Tenken storage
 */
Tenken.Storage = {};


/**
 * Class to access Tenken storage
 * @param {Object} _key key of a storage
 */
Tenken.Storage.Accessor = function(_key) {
	this._key = _key;
};
/**
 * Returns value
 * @return {Object} value
 */
Tenken.Storage.Accessor.prototype.get = function() { return localStorage.getItem(this._key); };
/**
 * Sets value
 * @param {Object} _value value
 */
Tenken.Storage.Accessor.prototype.set = function(_value) { localStorage.setItem(this._key, _value); };
/**
 * Deletes value
 */
Tenken.Storage.Accessor.prototype.remove = function() { localStorage.removeItem(this._key); };
/**
 * Return if the value exist or not
 * @return {Boolean} true if value exists、false for other
 */
Tenken.Storage.Accessor.prototype.isExist = function()
{
  if ( null != localStorage.getItem(this._key) )
  {
    return true;
  }
  else
  {
    return false
  }
};


/** access Time and Date when check (tenken) started */
Tenken.Storage.startDatetime = new Tenken.Storage.Accessor(TenkenConst.StorageName.startDatatime);


/** access operator data */
Tenken.Storage.operator = new Tenken.Storage.Accessor(TenkenConst.StorageName.operator);

/** access assets and equipments */
Tenken.Storage.lastAssetData = new Tenken.Storage.Accessor(TenkenConst.StorageName.asset);

/** access to previous message events */
Tenken.Storage.lastTenkenEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.lastMessageEvent);

/** access to previous check list events */
Tenken.Storage.lastMessageEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.lastTenkenEvent);

/** access to current check list events */
Tenken.Storage.currentTenkenEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.currentTenkenEevnt);

/** access to current message events */
Tenken.Storage.currentMessageEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.currentMessageEvent);

/** access to operation mode */
Tenken.Storage.OperationMode = new Tenken.Storage.Accessor(TenkenConst.StorageName.OperationMode);

/** access to operator data */
Tenken.Storage.UserData = new Tenken.Storage.Accessor(TenkenConst.StorageName.username);

/** access to last download time and date */
Tenken.Storage.DownloadDate = new Tenken.Storage.Accessor(TenkenConst.StorageName.DownloadDate);


/** access to scenes */
Tenken.Storage.SceneList = new Tenken.Storage.Accessor(TenkenConst.StorageName.scene);
Tenken.Storage.SceneNames = new Tenken.Storage.Accessor(TenkenConst.StorageName.SceneNames);

/** access to ar overlay data */
Tenken.Storage.SuperimposedGraphic = new Tenken.Storage.Accessor(TenkenConst.StorageName.SuperimposedGraphic);

/** access to checklist tables */
Tenken.Storage.TenkenTable = new Tenken.Storage.Accessor(TenkenConst.StorageName.tenkentable);

/** access to scenario list*/
Tenken.Storage.ScenarioList = new Tenken.Storage.Accessor(TenkenConst.StorageName.scenario);
/** selected scenario name and ID */
Tenken.Storage.ScenarioId = new Tenken.Storage.Accessor(TenkenConst.StorageName.ScenarioId);
Tenken.Storage.ScenarioName = new Tenken.Storage.Accessor(TenkenConst.StorageName.ScenarioName);
/** access to last date and time of scenario download */
Tenken.Storage.DownloadScenario = new Tenken.Storage.Accessor(TenkenConst.StorageName.DownloadScenario);


/**
 * Clear storage data except for scenario data
 */

Tenken.Storage.clearWithOutScenario = function() {
	Tenken.Storage.startDatetime.remove();
	Tenken.Storage.operator.remove();

	Tenken.Storage.OperationMode.remove();
	Tenken.Storage.lastAssetData.remove();
	Tenken.Storage.lastTenkenEventData.remove();
	Tenken.Storage.lastMessageEventData.remove();
	Tenken.Storage.currentTenkenEventData.remove();
	Tenken.Storage.currentMessageEventData.remove();
	Tenken.Storage.UserData.remove();
	Tenken.Storage.DownloadDate.remove();
	Tenken.Storage.SceneList.remove();
	Tenken.Storage.SceneNames.remove();
	Tenken.Storage.SuperimposedGraphic.remove();
	Tenken.Storage.TenkenTable.remove();

};
/**
 * Clear entire storage data
 */
Tenken.Storage.clear = function() {
	Tenken.Storage.clearWithOutScenario();

	Tenken.Storage.ScenarioId.remove();
	Tenken.Storage.ScenarioName.remove();
	Tenken.Storage.ScenarioList.remove();
	Tenken.Storage.DownloadScenario.remove();

};

/**
 * Clear storage data under work
 */
Tenken.Storage.clearCurrent = function() {
	Tenken.Storage.startDatetime.remove();
	Tenken.Storage.operator.remove();

	Tenken.Storage.OperationMode.remove();
	Tenken.Storage.currentTenkenEventData.remove();
	Tenken.Storage.currentMessageEventData.remove();
};

/* Check that all download data exists to run Tenken */
Tenken.Storage.AllDownloadIsExist = function()
{
	if (Tenken.Storage.lastAssetData.isExist() == true &&
		Tenken.Storage.UserData.isExist() == true &&
		Tenken.Storage.ScenarioList.isExist() == true &&
		Tenken.Storage.SceneList.isExist() == true &&
		Tenken.Storage.TenkenTable.isExist() == true )
	{
		return(true)
	}

	return(false);
}
