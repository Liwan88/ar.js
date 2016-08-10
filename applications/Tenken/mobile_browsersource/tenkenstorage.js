/**
 * @overview 点検業務向けJavaScript API群(ストレージ)です。
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * 点検業務ストレージのライブラリ空間です。
 */
Tenken.Storage = {};


/**
 * 点検業務ストレージのアクセサクラスです。
 * @param {Object} _key ストレージのキー
 */
Tenken.Storage.Accessor = function(_key) {
	this._key = _key;
};
/**
 * 値を返します。
 * @return {Object} 値
 */
Tenken.Storage.Accessor.prototype.get = function() { return localStorage.getItem(this._key); };
/**
 * 値を設定します。
 * @param {Object} _value 値
 */
Tenken.Storage.Accessor.prototype.set = function(_value) { localStorage.setItem(this._key, _value); };
/**
 * 値を削除します。
 */
Tenken.Storage.Accessor.prototype.remove = function() { localStorage.removeItem(this._key); };
/**
 * 値が存在するか否かを判定して返します。
 * @return {Boolean} 値が存在する場合はtrue、それ以外はfalse
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


/** 点検開始日時アクセサ。*/
Tenken.Storage.startDatetime = new Tenken.Storage.Accessor(TenkenConst.StorageName.startDatatime);


/** 点検作業者アクセサ。*/
Tenken.Storage.operator = new Tenken.Storage.Accessor(TenkenConst.StorageName.operator);

/** Assetアクセサ。*/
Tenken.Storage.lastAssetData = new Tenken.Storage.Accessor(TenkenConst.StorageName.asset);

/** 前回の申し送りEventアクセサ。*/
Tenken.Storage.lastTenkenEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.lastMessageEvent);

/** 前回の点検Eventアクセサ。*/
Tenken.Storage.lastMessageEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.lastTenkenEvent);

/** 今回の点検Eventアクセサ。*/
Tenken.Storage.currentTenkenEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.currentTenkenEevnt);

/** 今回の申し送りEventアクセサ。*/
Tenken.Storage.currentMessageEventData = new Tenken.Storage.Accessor(TenkenConst.StorageName.currentMessageEvent);

/** 通信モードアクセサ。*/
Tenken.Storage.OperationMode = new Tenken.Storage.Accessor(TenkenConst.StorageName.OperationMode);

/** 作業者データアクセサ。*/
Tenken.Storage.UserData = new Tenken.Storage.Accessor(TenkenConst.StorageName.username);

/** 最終ダウンロード日時アクセサ。*/
Tenken.Storage.DownloadDate = new Tenken.Storage.Accessor(TenkenConst.StorageName.DownloadDate);


/** シーンアクセサ。*/
Tenken.Storage.SceneList = new Tenken.Storage.Accessor(TenkenConst.StorageName.scene);
Tenken.Storage.SceneNames = new Tenken.Storage.Accessor(TenkenConst.StorageName.SceneNames);

/** AR重畳表示定義データアクセサ。*/
Tenken.Storage.SuperimposedGraphic = new Tenken.Storage.Accessor(TenkenConst.StorageName.SuperimposedGraphic);

/** 点検項目テーブルデータアクセサ。*/
Tenken.Storage.TenkenTable = new Tenken.Storage.Accessor(TenkenConst.StorageName.tenkentable);

/** シナリオアクセサ。*/
Tenken.Storage.ScenarioList = new Tenken.Storage.Accessor(TenkenConst.StorageName.scenario);
/** 選択シナリオ名・ID */
Tenken.Storage.ScenarioId = new Tenken.Storage.Accessor(TenkenConst.StorageName.ScenarioId);
Tenken.Storage.ScenarioName = new Tenken.Storage.Accessor(TenkenConst.StorageName.ScenarioName);
/** 最終シナリオダウンロード日時アクセサ。*/
Tenken.Storage.DownloadScenario = new Tenken.Storage.Accessor(TenkenConst.StorageName.DownloadScenario);


/**
 * シナリオデータ以外のストレージデータをクリアします。
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
 * 全点検業務ストレージデータをクリアします。
 */
Tenken.Storage.clear = function() {
	Tenken.Storage.clearWithOutScenario();

	Tenken.Storage.ScenarioId.remove();
	Tenken.Storage.ScenarioName.remove();
	Tenken.Storage.ScenarioList.remove();
	Tenken.Storage.DownloadScenario.remove();

};

/**
 * 作業中ストレージデータをクリアします。
 */
Tenken.Storage.clearCurrent = function() {
	Tenken.Storage.startDatetime.remove();
	Tenken.Storage.operator.remove();

	Tenken.Storage.OperationMode.remove();
	Tenken.Storage.currentTenkenEventData.remove();
	Tenken.Storage.currentMessageEventData.remove();
};

/* 点検アプリに必要なダウンロードデータが存在するかチェックします */
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
