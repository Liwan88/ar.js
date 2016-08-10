/**
 * @overview 点検業務向けJavaScript API群(データ管理)です。
 * @copyright Copyright 2014 FUJITSU LIMITED
 */

var TenkenData = {};

//============================================================================
// 共有部品定義
//============================================================================

// 強制読み込みモード設定
TenkenData.setSuperReloadMode = function(_mode)
{
	// 強制制読み込みモード
	Tenken.config.SuperReload=_mode;
}
// 強制読み込みモード取得
TenkenData.getSuperReloadMode = function()
{
	return(Tenken.config.SuperReload);
}

//============================================================================
// シナリオのデータ管理
//============================================================================

// データ管理クラス(シナリオ)
TenkenData.Scenario = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.Scenario.arScenario=new TenkenARdata(TenkenConst.TableName.scenario);
// データ管理領域(シナリオ)
TenkenData.Scenario.ListAll = [];

// 選択中シナリオ名
TenkenData.Scenario.ScenarioName = null;

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
				// 対象のシナリオかチェック
				if ( dataValue.ar_description )
				{
					if ( -1 == dataValue.ar_description.indexOf("#tenken#")  )
					{
						// 対象外のシナリオのため、次のシナリオにスキップする
						continue;
					}
				}
				else
				{
					// 備考に記載が無いシナリオは、対象外のシナリオのため、
					// 次のシナリオにスキップする
					continue;
				}

				// 全データをコピー(QAttribute単位の処理)
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

// データの取得成功時のコールバック（シナリオ)
TenkenData.Scenario.cbDataSuccessScenario = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
		TenkenData.Scenario.ListAll.length = 0;
		TenkenData.Scenario.createDataList();

		if ( TenkenData.Scenario.ListAll.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(null, null, null, "シナリオが登録されていないか、点検システムの対象となるシナリオが存在しませんでした。\n点検システム用のシナリオを登録してください。", null);
			return;
		}

		TenkenData.AllGet.saveStorageScenario();

		// シナリオデータが完了した場合、作業者選択画面の作業者リストと
		// (登録されていれば)ダウンロード完了通知用コールバックを呼び出す
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

// データの取得失敗時のコールバック（シナリオ)
TenkenData.Scenario.cbDataErrorScenario = function(_result)
{
	var message = "AR実行サーバのデータ取得(シナリオ)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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
		// 一度しか呼び出さないようにするためコールバックをクリアする
		var func=TenkenData.AllGet.downloadScenarioErrorFunc;
		TenkenData.AllGet.downloadScenarioErrorFunc=null;
		func(detail);
	}
}

// AR実行サーバからデータの取得を行います。(シナリオ)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.Scenario.arScenario.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:なし
		// 検索条件を初期化
		TenkenData.Scenario.arScenario.clearWhere();

		// ソート条件:シナリオID
		// ソート条件を初期化
		TenkenData.Scenario.arScenario.clearSort();
		// ソート方向に昇順を設定
		TenkenData.Scenario.arScenario.setSortDesc(false);
		// ソート条件１：シーンID
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.Scenario.arScenario.addSort("ar_id", null, "0", "9223372036854775000", "LONG");


		// データ取得
		TenkenData.Scenario.arScenario.getArData(TenkenData.Scenario.cbDataSuccessScenario, TenkenData.Scenario.cbDataErrorScenario);
	}
	catch (e)
	{
		alert("Exception: getScenario\n" + e);
	}
}

// ローカルストレージにデータを保存(シナリオ)
TenkenData.Scenario.saveStorage = function()
{
	Tenken.Storage.ScenarioList.set(JSON.stringify(TenkenData.Scenario.ListAll));
	if ( null != TenkenData.Scenario.ScenarioName )
	{
		Tenken.Storage.ScenarioName.set(JSON.stringify(TenkenData.Scenario.ScenarioName));
	}
};

// ローカルストレージからデータをロード(シナリオ)
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


// 作業中のシナリオ名設定
TenkenData.Scenario.setScenarioName = function(_nameScenario)
{
	TenkenData.Scenario.ScenarioName=_nameScenario;
};

// 作業中のシナリオ名取得
TenkenData.Scenario.getScenarioName = function()
{
	return(TenkenData.Scenario.ScenarioName);
};

// シナリオIDからシナリオ名取得します。
TenkenData.Scenario.getScenarioNameFromId = function(_id)
{
	var nameScenario = null;

	if ( !_id || _id <=0 )
	{
		// 無効なシナリオID、または全対象(=0)のためnullで復帰
		return(null);
	}

	if ( null == TenkenData.Scenario.ListAll || 0 == TenkenData.Scenario.ListAll.length )
	{
		// シナリオデータが無い場合は、
		// シナリオデータをローカルストレージから取得する
		TenkenData.Scenario.loadStorage();
	}
	if ( null == TenkenData.Scenario.ListAll || 0 == TenkenData.Scenario.ListAll.length )
	{
		// シナリオデータが無いため、シナリオ名=nullで復帰
		return(null);
	}

	// シナリオリストから検索
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

// 指定されたselectタグのElementにダウンロードしたシナリオデータを
// 選択肢として追加します。
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
// シーンのデータ管理
//============================================================================

// データ管理クラス(シーン)
TenkenData.Scene = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.Scene.arScene=new TenkenARdata(TenkenConst.TableName.scene);

// データ管理領域(シーン)
TenkenData.Scene.ListAll = [];

// ダウンロードしたシーン名リスト保存用
TenkenData.Scene.SceneNames = null;

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
				// 全データをコピー(QAttribute単位の処理)
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

				// シーン名保存
				TenkenData.Scene.SceneNames[newObj.sceneid]=newObj.name;

				// 申し送り表示、設備名表示を表示するシーンか判定。
				// 説明(ar_description)に以下の文字列が定義されている場合は
				// それぞれの表示対象シーンです。(大文字小文字区別あり)
				//
				//   #MSG#   : 申し送り
				//   #TENKEN# : 設備名表示
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

// データの取得成功時のコールバック（シーン)
TenkenData.Scene.cbDataSuccessScene = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
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

// データの取得失敗時のコールバック（シーン)
TenkenData.Scene.cbDataErrorScene = function(_result)
{
	var message = "AR実行サーバのデータ取得(シーン)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(シーン)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.Scene.arScene.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:
		// 検索条件を初期化
		TenkenData.Scene.arScene.clearWhere();
		// 検索条件１: 選択されたシナリオID指定
		TenkenData.Scene.arScene.addWhere("arscn_scenarioid", null, Tenken.config.ScenarioId, null, "LONG");

		// ソート条件：
		TenkenData.Scene.arScene.clearSort();
		// ソート方向に昇順を設定
		TenkenData.Scene.arScene.setSortDesc(false);
		// ソート条件１：シーンID
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.Scene.arScene.addSort("ar_id", null, "0", "9223372036854775000", "LONG");
		// データ取得
		TenkenData.Scene.arScene.getArData(TenkenData.Scene.cbDataSuccessScene, TenkenData.Scene.cbDataErrorScene);
	}
	catch (e)
	{
		alert("Exception: TenkenData.Scene.getScene\n" + e);
	}
}

// ローカルストレージにデータを保存(シーン)
TenkenData.Scene.saveStorage = function()
{
	Tenken.Storage.SceneList.set(JSON.stringify(TenkenData.Scene.ListAll));
	if ( null !=TenkenData.Scene.SceneNames )
	{
		Tenken.Storage.SceneNames.set(JSON.stringify(TenkenData.Scene.SceneNames));
	}
};

// ローカルストレージからデータをロード(シーン)
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

// シーン名の取得
TenkenData.Scene.getSceneName = function(_sceneid)
{
	if ( null != TenkenData.Scene.SceneNames && null != TenkenData.Scene.SceneNames[_sceneid] )
	{
		return(TenkenData.Scene.SceneNames[_sceneid]);
	}
	return null;
};


//============================================================================
// AR重畳表示定義データの管理
//============================================================================

// データ管理クラス(AR重畳表示定義データ)
TenkenData.SuperimposedGraphic = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.SuperimposedGraphic.arSuperimposedGraphic=new TenkenARdata(TenkenConst.TableName.SuperimposedGraphic);
;
// データ管理領域(AR重畳表示定義データ) Object型で使用
TenkenData.SuperimposedGraphic.objSuperimposedGraphics=null;

// 指定されたシナリオID、シーンID、マーカーID保存用
TenkenData.SuperimposedGraphic.setSecenarioId = -1;
TenkenData.SuperimposedGraphic.setSceneId = -1;
TenkenData.SuperimposedGraphic.setMarkerId = -1;

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
				//AR重畳表示定義のシーンID、マーカーID、AR重畳表示定義データ
				//がnullでないことを確認
				var value=new Object();
				if(sd.arsen_sceneid != null && sd.armk_markerid != null)
				{
					if ( null == contents ) contents = new Object();
					var sceneId=sd.arsen_sceneid;
					var markerId=sd.armk_markerid

					var value=new Object();
					// JSON文字列のAR重畳表示定義データをオブジェクトに変換
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

		//抽出したAR重畳表示定義データをシーンID、マーカーID別に
		//格納します。
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

// データの取得成功時のコールバック（AR重畳表示定義データ)
TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
		TenkenData.SuperimposedGraphic.objSuperimposedGraphics=null;
		TenkenData.SuperimposedGraphic.createDataList();

	}
	catch (e)
	{
		alert("Exception : TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic\n" + e);
	}
}

// データの取得失敗時のコールバック（AR重畳表示定義データ)
TenkenData.SuperimposedGraphic.cbDataErrorSuperimposedGraphic = function(_result)
{
	var message = "AR実行サーバのデータ取得(AR重畳定義データ)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(AR重畳表示定義データ)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:
		// 検索条件を初期化
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.clearWhere();

		// 検索条件１：シナリオID
		if ( null != _scenarioId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("arscn_scenarioid", null, _scenarioId, null, "LONG");
		}
		// 検索条件２：シーンID
		if ( null != _sceneId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("arsen_sceneid", null, _sceneId, null, "LONG");
		}
		// 検索条件３：マーカーID
		if ( null != _markerId )
		{
			TenkenData.SuperimposedGraphic.arSuperimposedGraphic.addWhere("armk_markerid", null, _markerId, null, "LONG");
		}

		// ソート条件:なし
		// ソート条件を初期化
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.clearSort();
		// ソート方向に昇順を設定
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.setSortDesc(false);
		// データ取得
		TenkenData.SuperimposedGraphic.arSuperimposedGraphic.getArData(
			TenkenData.SuperimposedGraphic.cbDataSuccessSuperimposedGraphic,
			TenkenData.SuperimposedGraphic.cbDataErrorSuperimposedGraphic);
	}
	catch (e)
	{
		alert("Exception: TenkenData.SuperimposedGraphic.getSuperimposedGraphic\n" + e);
	}
}

// ローカルストレージにデータを保存(AR重畳表示定義データ)
TenkenData.SuperimposedGraphic.saveStorage = function()
{
	if(TenkenData.SuperimposedGraphic.objSuperimposedGraphics != null)
	{
		Tenken.Storage.SuperimposedGraphic.set(JSON.stringify(TenkenData.SuperimposedGraphic.objSuperimposedGraphics));
	}
};

// ローカルストレージからデータをロード(AR重畳表示定義データ)
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
// 各設備のデータ管理
//============================================================================
// データ管理クラス(設備データ)
TenkenData.Asset = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.Asset.arAsset=new TenkenARdata(TenkenConst.TableName.asset);

// データ管理領域(設備データ)
TenkenData.Asset.ListAll = [];

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
				// 全データをコピー(QAttribute単位の処理)
				for ( var name in dataValue )
				{
					switch ( name )
					{
					case "msgICON":
						// 申送追加アイコン情報 
						//	(形式:  "アイコン名;アイコンイメージファイル名")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.msgICON ) newObj.msgICON = new Array();
							newObj.msgICON.push(iconInfo);
						}
						break
					case "tenkenICON":
						// 点検入力アイコン情報 
						//	(形式:  "アイコン名;アイコンイメージファイル名")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.tenkenICON ) newObj.tenkenICON = new Array();
							newObj.tenkenICON.push(iconInfo);
						}
						break
					case "graphURL":
						// 点検グラフアイコン情報 
						//	(形式:  "アイコン名;グラフURL")
						if ( null != dataValue[name] )
						{
							var iconInfo = dataValue[name].split(";");
							if ( null == newObj.graphURL ) newObj.graphURL = new Array();
							newObj.graphURL.push(iconInfo);
						}
						break
					default:
						// 追加アイコン情報 
						//	(形式:  "アイコン名;アイコンイメージファイル名;タップ時オープンファイル名")
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

				// 必須項目・重複データのチェック
				TenkenData.Asset.checkData(newObj);

				// 新規追加
				TenkenData.Asset.ListAll.push(newObj);
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.Asset.createDataList\n" + e);
	}
}

// データの取得成功時のコールバック（設備データ)
TenkenData.Asset.cbDataSuccessAsset = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
		TenkenData.Asset.ListAll.length=0;
		TenkenData.Asset.createDataList();

		if ( TenkenData.Asset.ListAll.length <= 0 )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.asset, null, null, null, "有効な設備データが登録されていません。\n設備データを登録してください。\n", null);
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

// データの取得失敗時のコールバック（設備データ)
TenkenData.Asset.cbDataErrorAsset = function(_result)
{
	var message = "AR実行サーバのデータ取得(設備一覧)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(設備データ)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.Asset.arAsset.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:なし
		// 検索条件を初期化
		TenkenData.Asset.arAsset.clearWhere();

		// ソート条件:
		// ソート条件を初期化
		TenkenData.Asset.arAsset.clearSort();
		// ソート方向に昇順を設定
		TenkenData.Asset.arAsset.setSortDesc(false);
		// ソート条件１：マーカーID
		// マーカーID=0はARには存在しないが、
		// 点検システム内でマーカーを利用しない設備をマーカーID=0として
		// 扱うためソート値に含めています。
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.Asset.arAsset.addSort("markerid", null, "0", "9223372036854775000", "LONG")
		// データ取得
		TenkenData.Asset.arAsset.getArData(TenkenData.Asset.cbDataSuccessAsset, TenkenData.Asset.cbDataErrorAsset);
	}
	catch (e)
	{
		alert("Exception: TenkenData.Asset.getAsset\n" + e);
	}
}

// 受信データの必須データの有無、重複をチェックします。
// データ異常があった場合は、データ定義異常を出力し、
// 初画面に戻ります。
//
// チェック内容
// QAttribute名 : チェック項目
// assetid       : null  重複
// assetname     : null  重複
// markerid      : null  重複
// markername    : null  重複
TenkenData.Asset.checkData = function(_data)
{
	try
	{
		var err=false;
		var errName=null;
		var errValue=null;
		var errMsg=null;

		if ( null == _data ) return;

		// nullチェック(値指定必須で値なし)
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
			errMsg="必須項目が未定義のデータがあります。";
		}
		else
		{
			// 重複チェック
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
				errMsg="重複したデータ定義があります。";
			}
		}

		// データに異常がある場合は、エラーを出力し初画面に戻る
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

// ローカルストレージにデータを保存(設備データ)
TenkenData.Asset.saveStorage = function()
{
	Tenken.Storage.lastAssetData.set(JSON.stringify(TenkenData.Asset.ListAll));
};

// ローカルストレージからデータをロード(設備データ)
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

// 指定assetidから設備データ(Object型)を取得します。
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

// 指定assetidと一致する設備データのマーカーIDを取得します。
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

// 指定マーカーIDと一致する設備データの設備名を取得します。
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

// 指定マーカーIDと一致する設備データ(Object型)を取得します。
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

// 指定マーカーIDと一致する設備データ(Object型)すべてを配列型で取得します。
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


// 指定されたassetidのデータを削除します。
TenkenData.Asset.deleteAsset = function(_assetid)
{
	// 後ろから順に対象のassetid検索して削除します。
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
// 申し送りデータ管理
//============================================================================

// データ管理クラス(申し送りデータ)
TenkenData.MsgEvent = {};

// AR実行サーバのデータ送受信用TenkenARdata作成(今回値と前回値用)
TenkenData.MsgEvent.arMessageEventLast=new TenkenARdata(TenkenConst.TableName.messageevent);
TenkenData.MsgEvent.arMessageEventCurrent=new TenkenARdata(TenkenConst.TableName.messageevent);

// データ管理領域(申し送りデータ)。今回値と前回値用
TenkenData.MsgEvent.Last = [];
TenkenData.MsgEvent.Current = [];

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
TenkenData.MsgEvent.createDataList = function()
{
	// 申し送りデータの構造は変更せず、そのままの構造でコピーする。
	// ただし、申し送りの表示位置が重ならないようにマーカーID単位で
	// 表示位置(X,Y,Z)の座標をずらして再設定する処理を追加する。
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

				// 全データをコピー(QAttribute単位の処理)
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
					// マーカー単位で申し送りの表示位置を自動設定する際に
					// ソート順が変わってしまうためソート順の順番も保存します。
					newObj.saveIndex=saveIndex++;
					MsgList[markerid].push(newObj);
				}
			}
		}

		// データを登録します。
		// また、マーカーID毎の申し送りデータの表示位置を自動的に変更します。
		// (X=Y=Zが0の場合だけで、値が設定されている場合は、その座標で表示)
		var sX = window.screen.width;
		var sY = window.screen.height;
		sizeX = sX / 5120;
		sizeY = sY / 3200;
		if ( sizeX < 0.2 || sizeX > 1.0 ) sizeX = 0.5;
		if ( sizeY < 0.2 || sizeY > 1.0 ) sizeY = 0.5;
		sizeZ = sizeX;

		// X=0.7固定で、マーカーID毎にY=0.7から-0.2ずつ表示
		var LX=0.7;
		var LY=0.6;
		var LZ=0.0;
		var L_STEP = - 0.2; // 固定
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

// データの取得成功時のコールバック（申し送りデータ)
TenkenData.MsgEvent.cbDataSuccessMessageEvent = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
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

// データの取得失敗時のコールバック（申し送りデータ)
TenkenData.MsgEvent.cbDataErrorMessageEvent = function(_result)
{
	var message = "AR実行サーバのデータ取得(申し送り)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(申し送りデータ)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.MsgEvent.arMessageEventLast.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:なし
		// 検索条件を初期化
		TenkenData.MsgEvent.arMessageEventLast.clearWhere();
		// 検索条件１: 選択されたシナリオID指定と0の(OR条件)
		//             マーカーID=0は、マーカーを利用しない共通設備等です。
		TenkenData.MsgEvent.arMessageEventLast.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");
		// 検索条件２: Enableがtrueの申し送り。
		//             (true=有効なもの、かつ完了報告が行われていない申し送り)
		TenkenData.MsgEvent.arMessageEventLast.addWhere("Enable", null, "true",  null, "STRING");

		// ソート条件：
		// ソート条件を初期化
		TenkenData.MsgEvent.arMessageEventLast.clearSort();
		// ソート方向に降順を設定
		TenkenData.MsgEvent.arMessageEventLast.setSortDesc(true);

		// ソート条件１：点検日時でソート
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.MsgEvent.arMessageEventLast.addSort("occurrencetime", null, "0", "9223372036854775000", "LONG");

		// データ取得
		TenkenData.MsgEvent.arMessageEventLast.getArData(TenkenData.MsgEvent.cbDataSuccessMessageEvent, TenkenData.MsgEvent.cbDataErrorMessageEvent);
	}
	catch (e)
	{
		alert("Exception: getMessageEvent\n" + e);
	}
}

// ローカルストレージにデータを保存(申し送りデータ)
TenkenData.MsgEvent.saveStorage = function()
{
	Tenken.Storage.currentMessageEventData.set(JSON.stringify(TenkenData.MsgEvent.Current));
	Tenken.Storage.lastMessageEventData.set(JSON.stringify(TenkenData.MsgEvent.Last));
};

// ローカルストレージからデータをロード(申し送りデータ)
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

// カレントの申し送りをクリア
TenkenData.MsgEvent.clearCurrentMsgEvent = function()
{
	TenkenData.MsgEvent.Current.length = 0;
	Tenken.Storage.currentMessageEventData.remove();
}

// 指定されたマーカーIDと一致する今回値および前回値の申し送りデータ(Object型)
// を配列型で取得します。
TenkenData.MsgEvent.getMsgEventListFromMarkerId = function(_markerid)
{
	// カレントおよびダウンロードした申し送りデータを対象にします。
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

// 指定されたassetidと一致する今回値および前回値の申し送りデータ(Object型)
// を配列型で取得します。
TenkenData.MsgEvent.getMsgEventListFromAssetId = function(_assetid)
{
	// カレントおよびダウンロードした申し送りデータを対象にします。
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

// 指定されたmsgidおよびoccurrencetimeと一致する今回値および前回値の
// 申し送りデータ(Object型)を配列型で取得します。
// msgidはユニークで運用するため、複数あった場合も１個目に見つかったもの
// を返します。
TenkenData.MsgEvent.getMsgEventFromMsgIdTime = function(_msgid,_occurrencetime)
{

	// カレントおよびダウンロードした申し送りデータを対象にします。
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

// 指定されたmsgidの申し送りデータを返します。(カレント）
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

// 指定されたmsgidの申し送りデータを返します。（過去の申し送り)
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

// 指定されたmsgidの申し送りデータを削除します。(カレント)
TenkenData.MsgEvent.deleteMsgEventCurrent = function(_msgid)
{
	// 後ろから順に対象のmsgidを削除します。(カレント)
	var lenList = TenkenData.MsgEvent.Current.length;
	for ( i = (lenList - 1) ; i >= 0 ; i-- )
	{
		if (_msgid == TenkenData.MsgEvent.Current[i].msgid )
		{
			TenkenData.MsgEvent.Current.splice(i,1);
		}
	}
}

// Enable="true"以外の申し送りデータを削除します。(Lastのみ)
TenkenData.MsgEvent.deleteMsgEventDisable = function()
{
	// 後ろから順に検索・削除します。
	var lenList = TenkenData.MsgEvent.Last.length;
	for ( i = (lenList - 1) ; i >= 0 ; i-- )
	{
		if ("true" != TenkenData.MsgEvent.Last[i].Enable )
		{
			TenkenData.MsgEvent.Last.splice(i,1);
		}
	}
}

// 申し送りデータ(カレント)を追加します
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

		// 追加
		TenkenData.MsgEvent.Current.push(MsgEvent);
		return(MsgEvent);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.addCurrentMsgEvent\n" + e);
	}
}


// 申し送りのCurrentからLastへ移動する
TenkenData.MsgEvent.moveCurrentDataToLastData = function()
{
	// カレントの申し送りすべてをLastリストに移動する
	for ( var  i=TenkenData.MsgEvent.Current.length - 1 ; 0 <= i ; i-- )
	{
		if ( null != TenkenData.MsgEvent.Current[i]  )
		{
			// 先頭から加えていく
			TenkenData.MsgEvent.Last.unshift(TenkenData.MsgEvent.Current[i]);
		}
	}

	// カレントの申し送りをクリア
	TenkenData.MsgEvent.clearCurrentMsgEvent();

	// 移動した申し送りをローカルストレージに保存
	TenkenData.MsgEvent.saveStorage();
}


//============================================================================
// 点検データ管理
//============================================================================
// 点検結果データは、各設備の各点検項目の最新の値のみ(各項目最新１レコード分)
// 前回値としてダウンロードします。
// 今回値は、点検している端末内のローカルストレージ内のローカルデータを使用
// します。今回値は、ダウンロード直後は値なしの状態です。
// 点検データ取得は、設備毎にデータ取得必要なため、TenkenARDataを利用せず
// 直接ARからデータを取得しています。

// データ管理クラス(点検結果データ)
TenkenData.TenkenEvent = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.TenkenEvent.arTenkenEventCurrent=new TenkenARdata(TenkenConst.TableName.tenkenevent);

// データ管理領域(点検結果データ)。今回値と前回値用。
TenkenData.TenkenEvent.Last = [];
TenkenData.TenkenEvent.Current = [];

// データ取得中状態フラグ
TenkenData.TenkenEvent.getphase = false;

// データ取得時のインターバルタイマーID
TenkenData.TenkenEvent.IntervalTenkenEventId = null;
// データ取得時の受信済数
TenkenData.TenkenEvent.downloadCount = 0;
// データ取得時の最大受信数
TenkenData.TenkenEvent.downloadMaxCount = 0;
// データ取得時の次の受信数
TenkenData.TenkenEvent.NextCnt = 0;

// 点検結果データ取得時のインターバルタイマー
TenkenData.TenkenEvent.IntervalGetTenkenEvent = function()
{
	try
	{
		if ( TenkenData.TenkenEvent.downloadCount >= TenkenData.TenkenEvent.downloadMaxCount )
		{
			// 最後まで受信したので終了
			TenkenData.TenkenEvent.stopIntervalGetTenkenEvent();

			// すべてのデータを読み込んだら終了
			TenkenData.TenkenEvent.getphase=false;
			if ( TenkenData.AllGet.getPhase() == false )
			{
				TenkenData.AllGet.afterDownload2();
			}

			return;
		}

		if ( TenkenData.TenkenEvent.NextCnt <= TenkenData.TenkenEvent.downloadCount )
		{
			// 次のカウントまでダウンロードが完了したため、
			// 次のデータのダウンロードを実行する
			var startCnt = TenkenData.TenkenEvent.NextCnt;
			if ( ( TenkenData.TenkenEvent.downloadMaxCount - TenkenData.TenkenEvent.NextCnt ) < Tenken.config.DownloadStep )
			{
				TenkenData.TenkenEvent.NextCnt = TenkenData.TenkenEvent.downloadMaxCount;
			}
			else
			{
				TenkenData.TenkenEvent.NextCnt += Tenken.config.DownloadStep;
			}

			// 定義されている点検項目の数だけデータを取得する。
			var targetList=TenkenData.TenkenTable.getTenkenTargetList();

			var strLog= "download=" + TenkenData.TenkenEvent.downloadCount
						+ ",start=" + startCnt
						+ ",next=" + TenkenData.TenkenEvent.NextCnt
						+ ",max=" + TenkenData.TenkenEvent.downloadMaxCount;

			Tenken.Util.logdebug("GET NEXT DATA:TenkenEvent:" + strLog);

			for ( var i=startCnt ; i < TenkenData.TenkenEvent.NextCnt  ; i++ )
			{
				var target=targetList[i];

				//検索クエリオブジェクトを作成します。

				var query = new TenkenARvalue.QuadQuery();
				query.type = "RECORDSANDCOUNT";
				// 検索数の上限 (各データの最新の１つのみ取得する）
				query.limitRange = new TenkenARvalue.Range(1);
				query.qattributeOrderIndexRange = new TenkenARvalue.Range(1,100);

				//利用者定義データが登録されているqtypeを指定します。
				query.qtypeNameRanges = new Array(new TenkenARvalue.Range(TenkenConst.TableName.tenkenevent));

				query.whereExpressions = new Array();

				// 検索条件:
				// 検索条件１: 選択されたシナリオID指定と0の(OR条件)
				//             マーカーID=0は、マーカーを利用しない共通設備等です。
				var cond = new Array();
				cond.push(new TenkenARvalue.Range(0))
				cond.push(new TenkenARvalue.Range(Tenken.config.ScenarioId));
				query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("ScenarioId"), cond, "LONG"));

				// 検索条件２: 設備ID(assetid)
				if( null != target.assetid )
				{
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("targetassetid"), new TenkenARvalue.Range(target.assetid), "STRING"));
				}
				// 検索条件３: 点検タイプ(type)
				if( null != target.type )
				{
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("type"), new TenkenARvalue.Range(target.type), "STRING"));
				}

				// 停止中(STOP)の設備の前回値を対象外とする場合
				if ( true == Tenken.config.skipStopLastData )
				{
					// 検索条件４: 起動状態(assetstatus)=START
					//             assetstatus="START"を指定します。
					//             停止中は点検値が無いため、稼働中の最後の点検値
					//             を取得します。
					query.whereExpressions.push(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("assetstatus"), new TenkenARvalue.Range("START"), "STRING"));
				}

				// ソート条件：
				// ソート条件１：登録日時(registrationtime)
				//               登録日時を降順にソートして最新のデータを1件分を
				//               取得します。
				// LONG型最大値9223372036854775807は、9223372036854776000に
				// 丸められてエラーになるため、9223372036854775000を指定して
				// います。
				query.sortOrderExpressions = new Array(new TenkenARvalue.QuadQueryExpression(new TenkenARvalue.Range("registrationtime"), new TenkenARvalue.Range(0,9223372036854775000), "LONG", true));

				//文字列に変換します。
				var getQuery = TenkenARvalue.makeQuadQuery(query);

				Tenken.Util.logdebug("GET_DATA_REQUEST:TenkenEvent:" + i);

				// 強制読み込みモード設定
				var mode=TenkenData.getSuperReloadMode();

				//AR実行サーバから点検結果データを取得します。
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

// 点検結果データ取得時のインターバルタイマーを起動
TenkenData.TenkenEvent.setIntervalGetTenkenEvent = function()
{
	if ( null == TenkenData.TenkenEvent.IntervalTenkenEventId )
	{
		TenkenData.TenkenEvent.IntervalTenkenEventId = setInterval('TenkenData.TenkenEvent.IntervalGetTenkenEvent()', Tenken.config.getIntervalTime);
	}
}

// 点検結果データ取得時のインターバルタイマーを停止
TenkenData.TenkenEvent.stopIntervalGetTenkenEvent = function()
{
	if ( null != TenkenData.TenkenEvent.IntervalTenkenEventId )
	{
		clearInterval(TenkenData.TenkenEvent.IntervalTenkenEventId);
		TenkenData.TenkenEvent.IntervalTenkenEventId = null;
	}
}

// AR実行サーバからデータの取得を行います。(点検結果データ)
TenkenData.TenkenEvent.getLastData = function()
{
	try
	{
		if ( true == TenkenData.TenkenEvent.getphase )
		{
			return;
		}

		// 定義されている点検項目テーブルの数だけデータを取得する。
		var targetList=TenkenData.TenkenTable.getTenkenTargetList();

		if (  null == targetList || 0 >= targetList.length )
		{
			TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, null, null, null, "点検結果データを取得するための点検結果テーブルの取得ができていません。\nデータが定義されていないか、取得に失敗しています。", null);
			return;
		}

		TenkenData.TenkenEvent.getphase=true;
		TenkenData.TenkenEvent.Last.length=0;
		TenkenData.TenkenEvent.Current.length=0;

		Tenken.Util.loginfo("GET_COUNT:TenkenEvent:" + targetList.length);

		TenkenData.TenkenEvent.NextCnt = 0;
		TenkenData.TenkenEvent.downloadCount = 0;
		TenkenData.TenkenEvent.downloadMaxCount =targetList.length;

		// タイマーをセットし、その関数内で受信
		TenkenData.TenkenEvent.setIntervalGetTenkenEvent();

	} catch(e){
		Tenken.Util.logerr(e);
	}
};


// データの取得成功時のコールバック（点検結果データ)
TenkenData.TenkenEvent.getDataSuccess = function(_result)
{
	Tenken.Util.loginfo("GET_DATA_RESPONSE:SUCCESS:TenkenEvent:" + TenkenData.TenkenEvent.downloadCount);

	if ( null != _result.getValue() )
	{
		//結果から必要なデータを抽出してTenkenData.TenkenEvent.Lastに格納します。
		TenkenData.TenkenEvent.extractData(_result.getValue());

	}
};


// 受信したJSONオブジェクトから点検結果データを抽出します。
TenkenData.TenkenEvent.extractData = function(_data)
{
	try {
		if ( null == _data ) return;

		//取得したレコード数です
		var recordCount = _data.records.length;

		TenkenData.TenkenEvent.downloadCount++;

		Tenken.Util.logdebug("downloadCount:TenkenEvent:" + TenkenData.TenkenEvent.downloadCount + " , " + recordCount);

		for(var recordIndex = 0; recordIndex < recordCount; recordIndex++)
		{
			//レコードを一つずつ調べます。
			var record = _data.records[recordIndex];
			var valueLength = record.qvalues.length;
			var value =new Object();

			value.version = record.version;
			value.qentityId = record.id;

			//使用するqvalueの数だけ取得します。attributeNameで判断します。
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

			// 新規追加(前回値)
			TenkenData.TenkenEvent.Last.push(value);
		}
	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenEvent.extractData\n" + e);
	}
};

// データの取得失敗時のコールバック（点検結果データ)
TenkenData.TenkenEvent.getDataError = function(_result)
{
	var message = "AR実行サーバのデータ取得(点検結果)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
	var detail="";
	if(_result.getStatus() == "AR_HTTP_EXCEPTION")
	{
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else
	{
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}
	// タイマーをクリア
	TenkenData.TenkenEvent.stopIntervalGetTenkenEvent();

	TenkenData.TenkenEvent.getphase=false;
	Tenken.Util.logerr("GET_DATA_RESPONSE:ERROR:TenkenEvent:" + message + ":" + detail);

	if ( TenkenData.AllGet.getPhase() == false )
	{
		TenkenData.AllGet.afterDownloadError(detail);
	}
};

// 点検結果データ取得中状態フラグの値を取得します。
TenkenData.TenkenEvent.isGetPhase = function()
{
	return(TenkenData.TenkenEvent.getphase);
}

// 点検結果データをクリアします。(今回値のみ)
TenkenData.TenkenEvent.clearCurrentTenkenEvent = function()
{
	TenkenData.TenkenEvent.Current.length = 0;
	Tenken.Storage.currentTenkenEventData.remove();
}

// 指定マーカーIDと一致する点検結果データの値を初期化します。(今回値のみ)
TenkenData.TenkenEvent.resetCurrentTenkenEventTable = function(_markerid)
{
	// カレントおよびダウンロードした点検結果データを対象にします。
	for ( var i = 0 ; i < TenkenData.TenkenEvent.Current.length ; i++ )
	{
		var tenkendata=TenkenData.TenkenEvent.Current[i];
		if ( _markerid == tenkendata.markerid )
		{
			// 初期化します
			// 変更が無い設備データなどはそのまま利用します。
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


// 指定されたassetid、TenkenType、DataEntryNameに一致する
// 点検結果データ(Object型)を取得します。
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

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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

// ローカルストレージにデータを保存(点検結果データ)
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

// ローカルストレージからデータをロード(点検結果データ)
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

// 今回値の点検結果データすべてを前回値へコピーする。
TenkenData.TenkenEvent.copyCurrentDataFromLastData = function()
{
	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		// 点検結果の前回値を今回値に自動設定する
		// ただし、SetLastDataの値がない、またはtrue以外設定されている場合、
        // およびPOIが存在しない場合は、設定しない。
		if ( null == _row.SetLastData ||
             "true" !=_row.SetLastData.toLowerCase() ||
				null == _poi2 )  return;

		// カレント(今回値)POI2の登録または設定
		var tmpPOI2=TenkenData.TenkenEvent.getData(TenkenData.TenkenEvent.Current, _row.AssetId, _row.TenkenType, null);
		if ( tmpPOI2 )
		{
			currentPoi2=tmpPOI2;
		}
		else
		{
			// 新規登録
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

// 指定されたtableidが含まれる点検結果データの値を初期化します。
TenkenData.TenkenEvent.resetCurrentTenkenEventTableTableId = function(_tabledid)
{


	// 1. TenkenTable.TableIdと_tableidが一致するassetidのリストを作成
	var listAssetId=new Object();
	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		if ( _table && _row && _tabledid == _table.TableId)
		{
			listAssetId[_row.AssetId] = _row.AssetId;
		}
	}

	TenkenData.TenkenTable.foreachTables(null, null, null, rowFunc);

	// 2. assetidのリストからasset.assetidと一致するmarkeridのリストを作成
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

	// 3. markeridのリストでカレントの点検結果の値を初期化する。
	for ( var markerid in listMarkerIds )
	{
		TenkenData.TenkenEvent.resetCurrentTenkenEventTable(markerid);
	}

}

//============================================================================
// 作業者名のデータ管理
//============================================================================

// データ管理クラス(作業者データ)
TenkenData.UserData = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.UserData.arUserData=new TenkenARdata(TenkenConst.TableName.userdata);
// データ管理領域(作業者データ)
TenkenData.UserData.ListAll = [];

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
					// 全データをコピー(QAttribute単位の処理)
					for ( var name in dataValue )
					{
						newObj[name]=dataValue[name];
					}
					// 必須項目・重複データのチェック
					TenkenData.UserData.checkData(newObj);

					// 新規追加
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

// データの取得成功時のコールバック（作業者データ)
TenkenData.UserData.cbDataSuccessUserData = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
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

// データの取得失敗時のコールバック（作業者データ)
TenkenData.UserData.cbDataErrorUserData = function(_result)
{
	var message = "AR実行サーバのデータ取得(作業者一覧)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(作業者データ)
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
			alert("通信中です。\nしばらく時間をおいてから再度実行してください。");
			return;
		}

		// 強制読み込みモード設定
		TenkenData.UserData.arUserData.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:
		// 検索条件を初期化
		TenkenData.UserData.arUserData.clearWhere();
		// 検索条件１: 選択されたシナリオID指定と0の(OR条件)
		//             マーカーID=0は、マーカーを利用しない共通設備等です。
		TenkenData.UserData.arUserData.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");
		// 条件２を指定

		// ソート条件：
		// ソート条件を初期化
		TenkenData.UserData.arUserData.clearSort();
		// ソート方向に昇順を設定
		TenkenData.UserData.arUserData.setSortDesc(false);
		// ソート条件１：ソートインデックス(SortIndex)
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.UserData.arUserData.addSort("SortIndex", null, "0", "9223372036854775000", "LONG");

		// データ取得
		TenkenData.UserData.arUserData.getArData(TenkenData.UserData.cbDataSuccessUserData, TenkenData.UserData.cbDataErrorUserData);
	}
	catch (e)
	{
		alert("Exception: TenkenData.UserData.getUserData\n" + e);
	}
}

// 受信データの必須データの有無、重複をチェックします。
// データ異常があった場合は、データ定義異常を出力し、
// 初画面に戻ります。
//
// チェック内容
// QAttribute名 : チェック項目
// userid       : null  重複
// username     : null  重複
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

		// nullチェック(値指定必須で値なし)
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
			errMsg="必須項目が未定義のデータがあります。";
		}
		else
		{
			// 重複チェック
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
				errMsg="重複したデータ定義があります。";
			}
		}

		// データに異常がある場合は、エラーを出力し初画面に戻る
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

// ローカルストレージにデータを保存(作業者データ)
TenkenData.UserData.saveStorage = function()
{
	Tenken.Storage.UserData.set(JSON.stringify(TenkenData.UserData.ListAll));
};

// ローカルストレージからデータをロード(作業者データ)
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

// ダウンロードした作業者の一覧をHTMLのselectタグのoptionタグ形式で組み立てます
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
		str += '<option value="">(ダウンロードしてください)'
	}

	return str;
};

// 指定されたselectタグのElementにダウンロードした作業者データを
// 選択肢として追加します。
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
// 点検項目テーブルのデータ管理
//============================================================================

// データ管理クラス(点検項目データ)
TenkenData.TenkenTable = {};

// AR実行サーバのデータ送受信用TenkenARdata作成
TenkenData.TenkenTable.arTenkenTable=new TenkenARdata(TenkenConst.TableName.tenkentable);

// データ管理領域(点検項目データ)
TenkenData.TenkenTable.ListTables = [];

// データの取得成功時のコールバック（点検項目データ)
TenkenData.TenkenTable.cbDataSuccessTenkenTable = function(_result)
{
	try
	{
		// 取得したデータをコピーする。
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

// データの取得失敗時のコールバック（点検項目データ)
TenkenData.TenkenTable.cbDataErrorTenkenTable = function(_result)
{
	var message = "AR実行サーバのデータ取得(点検項目)に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
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

// AR実行サーバからデータの取得を行います。(点検項目データ)
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

		// 強制読み込みモード設定
		TenkenData.TenkenTable.arTenkenTable.setReload(TenkenData.getSuperReloadMode());

		// 検索条件:
		// 検索条件を初期化
		TenkenData.TenkenTable.arTenkenTable.clearWhere();

		// 検索条件１: 選択されたシナリオID指定と0の(OR条件)
		//             マーカーID=0は、マーカーを利用しない共通設備等です。
		TenkenData.TenkenTable.arTenkenTable.addWhere("ScenarioId", null, [0, Tenken.config.ScenarioId], null, "LONG");

		// ソート条件：
		// ソート条件を初期化
		TenkenData.TenkenTable.arTenkenTable.clearSort();
		// ソート方向に昇順を設定
		TenkenData.TenkenTable.arTenkenTable.setSortDesc(false);

		// ソート条件１：ソート用テーブルインデックス値
		// LONG型最大値9223372036854775807は、9223372036854776000に
		// 丸められてエラーになるため、9223372036854775000を指定しています。
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfTable", null, "0", "9223372036854775000", "LONG");
		// ソート条件２：ソート用グループインデックス値
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfRowGroup", null, "0", "9223372036854775000", "LONG");
		// ソート条件３：ソート用項目(Row)インデックス値
		TenkenData.TenkenTable.arTenkenTable.addSort("SortIndexOfRow", null, "0", "9223372036854775000", "LONG");

		// データ取得
		TenkenData.TenkenTable.arTenkenTable.getArData(
			TenkenData.TenkenTable.cbDataSuccessTenkenTable,
			TenkenData.TenkenTable.cbDataErrorTenkenTable);
	}
	catch (e)
	{
		alert("Exception: TenkenData.TenkenTable.getData\n" + e);
	}
}

// 指定されたテーブルIDと一致する点検項目データ(Object型)を取得します。
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

// 指定されたテーブルIDおよびグループIDと一致する
// 点検項目データ(Object型)を取得します。
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

// 指定されたテーブルID、グループID、RowID全てと一致する
// 点検項目データ(Object型)を取得します。
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
					// RowGroupに値が指定されている場合は、RowGroupから検索
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
					// RowGroupに値が指定されていない場合は、Tableから検索
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

// 指定されたテーブルリスト(配列)の中でグループIDと一致する
// 点検項目データのグループデータ(配列)を取得します。
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

// 指定されたグループリスト(配列)の中でRowIdと一致する
// 点検項目データの点検項目Row(Object型)を取得します。
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

// 指定されたテーブルリスト(配列)の中でRowIdと一致する
// 点検項目データの点検項目Row(Object型)を取得します。
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

// 指定されたRowIdと一致する点検項目データの
// 点検項目Row(Object型)を取得します。
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

			// グループ設定あり。グループ内から検索
			if ( null != table.listRowGroups &&  0 < table.listRowGroups.length )
			{
				// グループ設定あり
				for ( var j=0 ; j < table.listRowGroups.length ; j++ )
				{
					var group=table.listRowGroups[j];
					// 点検項目(Row)表示
					for ( var k=0 ; k < group.listRows.length ; k++ )
					{
						var row=group.listRows[k];
						if ( _rowid ==  row.RowId ) return(row);
					}

				}
			}

			// グループ設定なしの項目からも検索。
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

// 指定されたassetidが含まれるtableidを取得します。
// １つのTableIdで複数のAssetIdを持つことがあるため、
// Row単位で検索します。
TenkenData.TenkenTable.getTableIdFromAssetId = function(_assetid)
{
	var tableid=null;

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus) 
	{
		// 既にtableidが見つかっている場合は即復帰
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

// ローカルストレージにデータを保存(点検項目データ)
TenkenData.TenkenTable.saveStorage = function()
{
	Tenken.Storage.TenkenTable.set(JSON.stringify(TenkenData.TenkenTable.ListTables));
};

// ローカルストレージからデータをロード(点検項目データ)
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

// 点検項目データ配列の各要素(テーブル、グループ、点検項目)毎に
// 指定されたメソッドを呼び出すforeach定義
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
				// グループがある場合
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
				// グループが無い場合
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

// 点検結果取得時に利用するテーブル名と点検設備名一覧を作成する
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
				// グループがある場合
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
				// グループが無い場合
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

// 指定された点検項目(Object型)をTenkenDataの管理用データに加工して
// コピーします。
TenkenData.TenkenTable.createListTenkenTable = function(_value)
{
	try {
		var tmptable=TenkenData.TenkenTable.getTable(_value.TableId);

		if ( null == tmptable )
		{
			// 新規作成
			var table=new Object();
			table.listRowGroups=[];
			// RowGroupがnullの場合は、Table直下にRowリストを作成する
			// ここでは、無条件で作成する
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
			// 既存テーブルを利用(値は上書きせず、最初の値を採用する)
			// 既存値との矛盾チェックをする場合は、ここに追加
			var table=tmptable;
		}

		// RowGroupリストの作成
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

		// 上限値と下限値の設定範囲をチェックします。
		var checkFloatLimit = function(_dataname, _value) 
		{
			if ( null != _value )
			{
				//数値ならARのFLOAT範囲(-9999999～9999999)の値かチェック
				if ( _value < -9999999 || 9999999 < _value )
				{
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, _dataname, _value, null, "ARのFLOAT値範囲外の値が指定されました。\n-9999999～9999999の範囲で指定してください。");
				}
			}
		}

		// Rowリストの作成
		if ( null != _value.RowId && null != table )
		{
			// RowGroupIdが設定されている場合は、RowGroupにRowを作成
			if ( null != _value.RowGroupId && null != rowgroup)
			{
				var tmprow=TenkenData.TenkenTable.getRowFromRowGroup(rowgroup, _value.RowId);
				if ( null == tmprow )
				{
					var row=new Object();

					// Rowには、テーブル、グループの情報も保存する
					for ( dataname in _value )
					{
						// LimitValueで始まるQAttribute名の場合には上下限値と
						// 基準値を保存する
						// LimitHigh,LimitLow,LimitBase以外の２個目以上を定義する
						// 場合に定義します。
						if ( null != _value[dataname] && dataname.substr(0,10) == "LimitValue" )
						{
							// 追加(2個目以降)の下限値、上限値、基礎値情報 (形式 :  下限値;上限値;基礎値)
							var limitInfoTmp = _value[dataname].split(";");
							var limitInfo = new Array(3);
							// 下限値
							limitInfo[0]=(Tenken.isNumber(limitInfoTmp[0]) == true) ? parseFloat(limitInfoTmp[0]) : null;
							// 上限値
							limitInfo[1]=(Tenken.isNumber(limitInfoTmp[1]) == true) ? parseFloat(limitInfoTmp[1]) : null;
							// 基礎値または基礎RowId
							limitInfo[2] = limitInfoTmp[2];
							if ( null == row.listLimit ) row.listLimit = new Array();

							checkFloatLimit(dataname, limitInfo[0]);
							checkFloatLimit(dataname, limitInfo[1]);
							if( true == Tenken.isNumber(limitInfoTmp[2]) )
							{
								checkFloatLimit(dataname, limitInfo[2]);
							}

							// 新規追加
							row.listLimit.push(limitInfo);
						}
						else
						{
							// 新規追加
							row[dataname] = _value[dataname];
						}
					}

					rowgroup.listRows.push(row);
				}
				else
				{
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, "RowId", _value.RowId, null, "グループに同じRowId(点検項目が存在します)");
				}
			}
			else
			{
				// RowGroupIdがnullの場合は、Table直下にRowを作成する。
				var tmprow=TenkenData.TenkenTable.getRowFromTable(table, _value.RowId);
				if ( null == tmprow )
				{
					var row=new Object();

					// Rowには、テーブル、グループの情報も保存する
					for ( dataname in _value )
					{
						// LimitValueで始まるQAttribute名の場合には上下限値と
						// 基準値を保存する
						// LimitHigh,LimitLow,LimitBase以外の２個目以上を定義する
						// 場合に定義します。
						if ( null != _value[dataname] && dataname.substr(0,10) == "LimitValue" )
						{
							// 追加(2個目以降)の下限値、上限値、基礎値情報 (形式 :  下限値;上限値;基礎値)
							var limitInfoTmp = _value[dataname].split(";");
							var limitInfo = new Array(3);
							// 下限値
							limitInfo[0]=(Tenken.isNumber(limitInfoTmp[0]) == true) ? parseFloat(limitInfoTmp[0]) : null;
							// 上限値
							limitInfo[1]=(Tenken.isNumber(limitInfoTmp[1]) == true) ? parseFloat(limitInfoTmp[1]) : null;
							// 基礎値または基礎RowId
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
					TenkenData.AllGet.abortInvalidData(TenkenConst.TableName.tenkentable, "RowId", _value.RowId, null, "テーブルに同じRowId(点検項目が存在します)");
				}
			}
		}
	}
	catch(e)
	{
		alert("Exception : TenkenData.TenkenTable.createListTenkenTable\n" + e);
	}
}

// 受信データの必須データの有無、指定誤りをチェックします。
// データ異常があった場合は、データ定義異常を出力し、
// 初画面に戻ります。
//
// チェック内容
// QAttribute名 : チェック項目
// TableId              : null
// TableName            : null
// RowId                : null
// RowName              : null
// RowGoupName          : null (RowGroupIdに値が指定されている場合のみ)
// ValueType            : null
// AssetId              : null
// TenkenType           : null
// DataEntryName        : null
// ScenarioId           : null
// 以下は必須チェックは行わず、指定なしはデフォルト動作を行う
// AssetStatusStoppable : 指定無し時はtrue指定扱い
// SetLastData          : 指定無し時はfalse指定扱い
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
			errMsg="必須項目が未定義のデータがあります。";
		}
		else
		{
			// 指定誤りのチェック
			if ( null != _data.ValueType )
			{
				switch(_data.ValueType)
				{
					case "NUMBER":
						// 正常指定
						// DataEntryNameに数値型の名前が指定されているかチェック
						if ( _data.DataEntryName != "F01" &&
							 _data.DataEntryName != "F02" &&
							 _data.DataEntryName != "F03" &&
							 _data.DataEntryName != "F04" &&
							 _data.DataEntryName != "F05" )
						{
							err=true;
							errName="DataEntryName";
							errValue=_data.DataEntryName;
							errMsg=_data.ValueType + "型のDataEntryNameがF01～F05ではありませんでした。\n";
						}
						break;
					case "WEATHER":
					case "OKNG":
					case "STRING":
					case "MARUBATSU":
						// 正常指定
						// DataEntryNameに数値型の名前が指定されているかチェック
						if ( _data.DataEntryName != "S01" &&
							 _data.DataEntryName != "S02" &&
							 _data.DataEntryName != "S03" &&
							 _data.DataEntryName != "S04" &&
							 _data.DataEntryName != "S05" )
						{
							err=true;
							errName="DataEntryName";
							errValue=_data.DataEntryName;
							errMsg=_data.ValueType + "型のDataEntryNameがS01～S05ではありませんでした。\n";
						}
						break;
					default:
						err=true;
						errName="ValueType";
						errValue=_data.ValueType;
						errMsg="指定したタイプは利用できません。";
						break;
				}
			}
		}

		// データに異常がある場合は、エラーを出力し初画面に戻る
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

// 取得したデータをTenkenDataの管理用データに加工してコピーします。
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
				// Disableに"true"が設定されていた場合には、無効な項目のため、
				// 点検項目から除外して、次ぎの項目へ。
				if ( null != dataValue.Disable && "true" == dataValue.Disable.toLowerCase() )
				{
					continue;
				}

				// 必須項目データのチェック
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
// 全受信データの管理
//============================================================================

// データ管理クラス(全受信データ管理)
TenkenData.AllGet = function() {};

// シナリオのコールバック保存
TenkenData.AllGet.downloadScenarioSuccessFunc=null;
TenkenData.AllGet.downloadScenarioErrorFunc=null;

// 全データのコールバック保存（シナリオ以外受信時）
TenkenData.AllGet.downloadSuccessFunc=null;
TenkenData.AllGet.downloadErrorFunc=null;

// abort中を判定するフラグ
TenkenData.AllGet.abortON=false;

// ダウンロード中か確認する
TenkenData.AllGet.getPhase = function()
{
	// abort中の場合には、ダウンロード中でも完了状態を返す
	if ( true == TenkenData.AllGet.abortON )
	{
		// データ未受信または受信完了
		return(false);
	}

	// シナリオと点検結果(tenkenevent)以外を確認する
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
		// データ受信中
		return(true);
	}
	else
	{
		// データ未受信または受信完了
		return(false);
	}
}

// ダウンロード中か確認する。(シナリオデータのみ)
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

// 全データ(シナリオと点検結果以外)をダウンロード
TenkenData.AllGet.download = function(_mode, _downloadSuccess, _downloadError)
{
	Tenken.Util.loginfo("GET_ALL_DATA1:START");

	// 全ダウンロード後に呼ばれるコールバックを保存
	TenkenData.AllGet.downloadSuccessFunc=_downloadSuccess;
	TenkenData.AllGet.downloadErrorFunc=_downloadError;

	// 強制モード設定
	var mode=( false == _mode ) ? false : true;
	TenkenData.setSuperReloadMode(mode);

	// 各データをダウンロードする

	// シーンデータ
	TenkenData.Scene.getScene();

	// AR重畳表示定義データ。ここではシーンIDとマーカーIDは指定しないでダウンロード。
	TenkenData.SuperimposedGraphic.getSuperimposedGraphic(Tenken.config.ScenarioId, null, null);

	// 設備データ
	TenkenData.Asset.getLastData();

	// 点検項目テーブルデータ
	TenkenData.TenkenTable.getData();

	// 申し送りデータ
	TenkenData.MsgEvent.getLastData();

	// 作業者データ
	TenkenData.UserData.getData();

}

// 点検結果をダウンロード
TenkenData.AllGet.download2 = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA2:START");

	// 点検結果データ
	TenkenData.TenkenEvent.getLastData();
}


// シナリオをダウンロード
TenkenData.AllGet.downloadScenario = function(_mode, _downloadSuccess, _downloadError)
{
	Tenken.Util.loginfo("GET_ALL_DATA_SCENARIO:START");

	// 全ダウンロード後に呼ばれるコールバックを保存
	TenkenData.AllGet.downloadScenarioSuccessFunc=_downloadSuccess;
	TenkenData.AllGet.downloadScenarioErrorFunc=_downloadError;

	// 強制モード設定
	var mode=( false == _mode ) ? false : true;
	TenkenData.setSuperReloadMode(mode);

	// シナリオデータ
	TenkenData.Scenario.getScenario();

}

// 各データをローカルストレージに保存(シナリオ以外)
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

// 各データをローカルストレージからロード (シナリオ以外)
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

// シナリオデータをローカルストレージに保存
TenkenData.AllGet.saveStorageScenario = function()
{
	TenkenData.Scenario.saveStorage();
}

// シナリオデータをローカルストレージからロード
TenkenData.AllGet.loadStorageScenario = function()
{
	TenkenData.Scenario.loadStorage();
}

// シナリオと点検結果以外全データのダウンロード完了後に呼ばれます。
// 正常終了の場合には、全データをローカルストレージに保存し、
// 作業者選択一覧にダウンロードした作業者を表示します。
TenkenData.AllGet.afterDownload = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA1:END:SUCCESS");

	TenkenData.AllGet.download2();
}

// 選択されたシナリオに必要のない項目を削除
// (ScenariodIdが0または選択シナリオID以外を削除)
TenkenData.AllGet.SkipDisableData = function()
{
	try {

		//--------------------------------------------------
		// 選択されているシナリオで有効な設備(asset)のみの
		// リストに再作成します。
		//--------------------------------------------------

		var tmpListAsset=[];

		// 点検項目テーブルで有効な設備IDを抽出
		var listAssets=new Object();

		var funcRow=function(_table, _group, _row, _poi, _valueEntryName, _value, _assetstatus)
		{
			if ( null == _row ) return;
			// 有効な点検項目で指定されているassetidのみを保存します。
			listAssets[_row.AssetId]=_row.AssetId;
		}

		TenkenData.TenkenTable.foreachTables(null, null, null, funcRow);

		// 有効な点検項目で指定されているassetidのリストに指定されている
		// 設備のみで設備リストを再作成します。
		// 点検項目テーブルで利用されていないassetidを配列リストにします。
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
		// 選択されているシナリオで有効なマーカーIDのみの
		// AR重畳表示データに再作成します。
		//--------------------------------------------------
		// 有効なマーカーIDリストを生成
		var listMarkerIds=new Object();
		for ( var aid in listAssets )
		{
			var mid=-1;
			mid=TenkenData.Asset.getMarkerIdfromAssetId(aid);
			listMarkerIds[mid]=mid;
		}

		// AR重畳表示データ中から無効マーカーIDのデータを削除する
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

// 全データダウンロード後の後処理
TenkenData.AllGet.afterDownload2 = function()
{
	Tenken.Util.loginfo("GET_ALL_DATA2:END:SUCCESS");

	TenkenData.AllGet.SkipDisableData();

	TenkenData.AllGet.saveStorage();

	// 事前ダウンロード
	TenkenData.AllGet.PreloadData();

	// 全データが完了した場合、作業者選択画面の作業者リストと
	// (登録されていれば)ダウンロード完了通知用コールバックを呼び出す
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

// ダウンロード失敗時(全データ完了後)に呼ばれます。
// エラーメッセージを表示して終了します。
TenkenData.AllGet.afterDownloadError = function(_errorMsg)
{
	Tenken.Util.logerr("GET_ALL_DATA1:END:ERROR:" + _errorMsg);

	if ( null != TenkenData.AllGet.downloadErrorFunc )
	{
		// 一度しか呼び出さないようにするためコールバックをクリアする
		var func=TenkenData.AllGet.downloadErrorFunc;
		TenkenData.AllGet.downloadErrorFunc=null;
		func(_errorMsg);
	}
}

// データ受信時に利用者定義データに誤りがある場合は、
// データをクリアし、初画面(index.html)に戻る
TenkenData.AllGet.abortInvalidData = function(_table, _qattribute, _value, _msghead, _msg)
{
	// 既にabort処理中の場合は何もしない
	if ( true == TenkenData.AllGet.abortON ) return;

	TenkenData.AllGet.abortON=true;

	// ストレージとARのオフラインストレージデータの削除
	Tenken.Storage.clear();
	AR.Data.clearResourceStorage(Tenken.Util.noop, Tenken.Util.noop);

	// メッセージの出力
	var str="";
	if ( null != _msghead )
	{
		str=_msghead;
	}
	else
	{
		str="データ定義に誤りがありました。\n\n";
	}
	if ( _table ) str += "テーブル名=" + _table + "\n";
	if ( _qattribute ) str += "QAttribute名=" + _qattribute + "\n";
	if ( _value ) str += "値=" + _value + "\n";
	if ( _msg ) str += "\n" + _msg + "\n";
	str += "\n処理を中止し初画面に戻ります\n";
	alert(str);

	// 初画面へ移動
	location.replace(TenkenConst.PageName.top);
}


// 事前ダウンロード
TenkenData.AllGet.PreloadData = function()
{

	// 事前ロードの無効化指定チェック
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
					// 指定あり。選択シナリオの全事前ダウンロードを無効化
					skipPreload=true;
				}
				if ( 0 <= asset.description.indexOf("#unpreloadsg#"))
				{
					// 指定あり。重畳表示データの事前ダウンロードを無効化
					skipPreloadSG=true;
				}
				if ( 0 <= asset.description.indexOf("#unpreloadasset#"))		
				{
					// 指定あり。assetテーブルの追加アイコンの 指定ファイル
					// の事前ダウンロードを無効化
					skipPreloadAsset=true;
				}
			}
		}
	}
	if ( false == Tenken.config.preloadFile || true == skipPreload )
	{
		return;  // 事前ダウンロードしない設定のため何もしない
	}

	preloadSuperimposedGraphics = [];

	//AR重畳表示定義を事前ダウンロード
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

	// assetの追加アイコンにURLが指定されている場合、
	// 事前ダウンロードを実施します。

	if ( false == Tenken.config.preloadAssetFile || true == skipPreloadAsset )
	{
		return;  // 事前ダウンロードしない設定のため何もしない
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

				// 問い合わせ(?)があるもの、先頭がhttpで無いものは対象外。
				// http://が先頭にない8文字に満たない場合も対象外。
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
// データ送信(点検結果:tenkenevent)
//============================================================================


// 点検結果送信時のコールバックおよびコールバックに渡すシーケンス値
TenkenData.TenkenEvent.onSuccess = null;
TenkenData.TenkenEvent.onError = null;
TenkenData.TenkenEvent.cbValue = null;

// 点検データを作成します。
TenkenData.TenkenEvent.createTenkenDataQuad = function(_data)
{
	// QUADを作成します。
	var quad = new TenkenARvalue.Quad(TenkenConst.TableName.tenkenevent);

	// QUADのタイプネームを設定します。
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

	// 有効なQValueをQUADに設定します。
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

	//文字列に変換します。
	var rtndata = JSON.stringify(quad);
	return rtndata;
};


// アップロードに成功した場合のコールバック関数です。(点検結果データ)
TenkenData.TenkenEvent.cbPostSuccess = function(_result)
{
	if ( null != TenkenData.TenkenEvent.onSuccess ) TenkenData.TenkenEvent.onSuccess(TenkenData.TenkenEvent.cbValue);
};

// アップロードに失敗した場合のコールバック関数です。(点検結果データ)
TenkenData.TenkenEvent.cbPostError = function(_result)
{
	try
	{
		var message = "点検結果データのアップロードに失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
		var detail="";

		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr("POST_TENKENEVENT_RESPONSE:ERROR:" + message + ":" + detail);

		alert("点検結果データのアップロードに失敗しました。\n\n動作モードとネットワーク状況を確認して再度お試しください。\n\nネットワークがオンライン状態の場合には、AR重畳表示アプリケーションを再起動してください。\n\n" + detail);


	}
	catch (e)
	{
		alert("Exception : TenkenData.TenkenEvent.cbPostError\n" + e);
	}

	if ( null != TenkenData.TenkenEvent.onError ) TenkenData.TenkenEvent.onError(TenkenData.TenkenEvent.cbValue);
};

// 点検結果データの送信
// _markerids : 送信対象のマーカーIDを指定します。配列指定。
//              nullの場合は、すべて送信
// _submitall : false:停止状態の設備の点検結果は送信しない。
//              true またはその他:停止状態の設備の点検結果も送信する。
TenkenData.TenkenEvent.submitTenkenEvent = function(_markerids, _submitall, _onSuccess, _onError, _value)
{
	try
	{
		if ( null != _onSuccess ) TenkenData.TenkenEvent.onSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.TenkenEvent.onError = _onError;
		if ( null != _value ) TenkenData.TenkenEvent.cbValue = _value;

		var tenkenlists = [];
		// 登録時間は、送信日時に設定しなおして送信します。
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
					// 停止している設備の点検結果は送信しない
					return;
				}

				// 送信対象のマーカーID配列が指定されていれば
				// 送信対象かチェックし、送信対象でない場合には送信しない。
				if ( null != _markerids )
				{
					var targetid=false;
					for ( var j = 0 ; j < _markerids.length ; j++ )
					{
						// 選択マーカーIDか、マーカーID=0の場合は、
						// あれば送信対象とする
						if ( _markerids[j] == _poi2.markerid )
						{
							targetid=true;
							break;
						}
					}
					if ( true != targetid )
					{
						// 送信対象の対象のマーカーIDでないため、
						// 送信せず次ぎのデータへ
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
					tenken.tenken_id = nowdatetime; // 現在時間をtenkenidとして利用する
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
				// 停止中設備の点検項目値F01～F05,S01～S05は設定しない。
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
			alert("有効な送信用データがありません。");

			// １件も登録されてない場合は送信なし。
			// 成功時コールバックを呼ぶ
			if ( null != _onSuccess )
			{
				_onSuccess(_value);
			}
			else
			{
				return;
			}
		}

		// 送信用データを生成し格納する
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
		alert("点検結果データのアップロード中にエラーが発生しました。\n" + e);
		return false;
	}
}

//============================================================================
// データ送信(申し送り:messageevent)
//============================================================================

// 申し送り送信時のコールバックおよびコールバックに渡すシーケンス値
TenkenData.MsgEvent.onPostSuccess = null;
TenkenData.MsgEvent.onPostError = null;
TenkenData.MsgEvent.cbPostValue = null;

// 登録用の利用者定義データを作成します。
TenkenData.MsgEvent.CreateCommentDataQuad = function(_data)
{
	// QUADを作成します。
	var quad = new TenkenARvalue.Quad(TenkenConst.TableName.messageevent);

	// QUADのタイプネームを設定します。
	quad.qtypeName = TenkenConst.TableName.messageevent;

	// QUADの各属性の値を作成します。

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

	// 有効なQValueをQUADに設定します。
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

	//文字列に変換します。
	var rtndata = JSON.stringify(quad);
	return rtndata;
};

// アップロードに成功した場合のコールバック関数です。(申し送りデータ)
TenkenData.MsgEvent.cbPostSuccess = function(_result)
{
	if ( null != TenkenData.MsgEvent.onPostSuccess ) TenkenData.MsgEvent.onPostSuccess(TenkenData.MsgEvent.cbPostValue);
};

// アップロードに失敗した場合のコールバック関数です。(申し送りデータ)
TenkenData.MsgEvent.cbPostError = function(_result)
{
	try {
		var message = "申し送りデータのアップロードに失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
		var detail="";
		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr(message, detail);

		alert("申し送りデータのアップロードに失敗しました。\n\n動作モードとネットワーク状況を確認して再度お試しください。\n\nネットワークがオンライン状態の場合には、AR重畳表示アプリケーションを再起動してください。\n\n" + detail);

		Tenken.Util.logerr("POST_MSGEVENT_RESPONSE:ERROR:" + message + ":" + detail);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.cbPostError \n" + e);
	}
	if ( null != TenkenData.MsgEvent.onPostError ) TenkenData.MsgEvent.onPostError(TenkenData.MsgEvent.cbPostValue);
};

// 申し送りデータの送信
TenkenData.MsgEvent.submitMsgEvent = function(_markerids, _onSuccess, _onError, _value)
{
	try
	{
		if ( null != _onSuccess ) TenkenData.MsgEvent.onPostSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.MsgEvent.onPostError = _onError;
		if ( null != _value ) TenkenData.MsgEvent.cbPostValue = _value;

		// 登録時間は、送信日時に設定しなおして送信します。
		var nowdatetime=new Date().getTime();

		// 申し送り（新規登録)
		// １件も登録されてない場合は送信なし。
		if ( TenkenData.MsgEvent.Current.length <= 0 )
		{
			// 成功時コールバックを呼ぶ
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

			// 送信対象のマーカーID配列が指定されていれば
			// 送信対象かチェックし、送信対象でない場合には送信しない。
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
					// 送信対象の対象のマーカーIDでないため、
					// 送信せず次ぎのデータへ
					continue;
				}
			}

			// 登録時間は、送信日時に設定しなおして送信します。
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
		alert("申し送りデータのアップロード中にエラーが発生しました。\n" + e);
		return false;
	}
}

//============================================================================
// データ送信(完了報告:messageevent)
//============================================================================

// 完了報告送信時のコールバックおよびコールバックに渡すシーケンス値
TenkenData.MsgEvent.arCompleteMessageEvent=null;
TenkenData.MsgEvent.onCompletePostSuccess = null;
TenkenData.MsgEvent.onCompletePostError = null;
TenkenData.MsgEvent.cbCompletePostValue = null;

// アップロードに成功した場合のコールバック関数です。(完了報告)
TenkenData.MsgEvent.completeMsgEventSuccess = function(_result)
{
	if ( null != TenkenData.MsgEvent.onCompletePostSuccess ) TenkenData.MsgEvent.onCompletePostSuccess(TenkenData.MsgEvent.cbCompletePostValue);
};

// アップロードに失敗した場合のコールバック関数です。(完了報告)
TenkenData.MsgEvent.completeMsgEventError = function(_result)
{
	try
	{
		var message = "申し送り(完了報告)データのアップロードに失敗しました。\n\n動作モードとネットワーク状況を確認して再度お試しください。\n\nネットワークがオンライン状態の場合には、AR重畳表示アプリケーションを再起動してください。";
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

// 申し送りの完了報告データを送信します。(既存申し送りデータの更新)
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

			// 削除リストに元の申し送りのversionとQentityIdを追加する
			var deleteMsg=new Object();
			deleteMsg.version=msgevent.version;
			deleteMsg.qentityId=msgevent.qentityId;
			TenkenData.MsgEvent.deleteMsgEventDatas.push(deleteMsg);

		}
	}

	if ( 0 == TenkenData.MsgEvent.deleteMsgEventDatas.length )
	{
		// 完了報告が０件のため、正常終了コールバックを呼び終了する
		if ( null != _onSuccess ) _onSuccess(_value);
		return;
	}

	TenkenData.MsgEvent.arCompleteMessageEvent.postArData(
		TenkenData.MsgEvent.completeMsgEventSuccess,
		TenkenData.MsgEvent.completeMsgEventError);

}

//============================================================================
// データ削除(完了報告完了分の旧データ:messageevent)
//============================================================================

// 完了報告削除時のコールバックおよびコールバックに渡すシーケンス値
TenkenData.MsgEvent.arDeleteteMessageEvent=null;
TenkenData.MsgEvent.onDeleteSuccess = null;
TenkenData.MsgEvent.onDeleteError = null;
TenkenData.MsgEvent.cbDeleteValue = null;

// 完了報告リストを削除するためのリスト
TenkenData.MsgEvent.deleteMsgEventDatas = [];

// 完了報告の登録が完了した申し送りデータの削除に成功した場合の
// コールバック関数です。
TenkenData.MsgEvent.deleteMsgEventSuccess = function(_result)
{
	try
	{
		// 送信データをクリア
		TenkenData.MsgEvent.deleteMsgEventDatas.length=0;

		// 完了報告が設定されてる申し送りデータを削除
		TenkenData.MsgEvent.deleteMsgEventDisable();

		if ( null != TenkenData.MsgEvent.onDeleteSuccess ) TenkenData.MsgEvent.onDeleteSuccess(TenkenData.MsgEvent.cbDeleteValue);
	}
	catch (e)
	{
		alert("Exception : TenkenData.MsgEvent.deleteMsgEventSuccess\n" + e);
	}
};

// 完了報告の登録が完了した申し送りデータの削除に失敗した場合の
// コールバック関数です。
TenkenData.MsgEvent.deleteMsgEventError = function(_result)
{
	try
	{
		var message = "申し送り(完了報告更新)データのアップロードに失敗しました。\n\n動作モードとネットワーク状況を確認して再度お試しください。\n\nネットワークがオンライン状態の場合には、AR重畳表示アプリケーションを再起動してください。";
		var detail="";

		var ErrorStatus=0;
		if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
			detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
			ErrorStatus=_result.getValue().status;
		} else {
			detail += _result.getStatus() + "\n"+ _result.getValue();
		}

		Tenken.Util.logerr(message, detail);

		// 送信データをクリア
		TenkenData.MsgEvent.deleteMsgEventDatas.length=0;

		// deleteが404 Not Foundになる場合があるため、
		// 404で終了時は正常時と同じ処理を行う。
		if ( 404 == ErrorStatus )
		{
			// 正常アップロードコールバックを呼ぶ
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

// 完了報告した申し送りデータの元のデータの削除
TenkenData.MsgEvent.deleteMsgEvent = function(_onSuccess, _onError, _value)
{
	try {
		if ( null != _onSuccess ) TenkenData.MsgEvent.onDeleteSuccess = _onSuccess;
		if ( null != _onError ) TenkenData.MsgEvent.onDeleteError = _onError;
		if ( null != _value ) TenkenData.MsgEvent.cbDeleteValue = _value;

		// 完了報告後の削除データがあるかチェック
		var lenDeleteMsg=TenkenData.MsgEvent.deleteMsgEventDatas.length;
		if ( lenDeleteMsg <= 0 )
		{
			// データが無いため、正常終了コールバックを呼ぶ
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
