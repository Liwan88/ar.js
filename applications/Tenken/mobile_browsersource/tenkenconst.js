/**
 * @overview 点検業務向け定数定義群です。
 * @copyright Copyright 2014 FUJITSU LIMITED
 */

var TenkenConst = {};

// AR点検アプリケーションの各画面HTML名

TenkenConst.PageName =
{
	top				:"index.html",     // 初画面
	pre				:"pre.html",       // 作業者選択画面
	main			:"main.html"       // メイン画面
}

// ARサーバの利用者定義テーブル名定義
// (シナリオ、シーン、AR重畳表示定義を含みます)
TenkenConst.TableName =
{
	asset				:"asset",             // 設備情報テーブル
	tenkenevent			:"tenkenevent",       // 点検結果テーブル
	tenkentable			:"tenkentable",       // 点検項目定義テーブル
	messageevent		:"messageevent",      // 申し送りテーブル
	userdata			:"userdata",          // 作業者管理テーブル
	scenario			:"arscn_scenario",    // シナリオ管理テーブル
	scene				:"arsen_scene",       // シーン管理テーブル
	SuperimposedGraphic	:"arpoiarmk_default"  // AR重畳表示定義テーブル
};

// 保存するWebストレージ(ローカルストレージ)の名前
TenkenConst.StorageName =
{
	// テーブル
	asset				: "ARtenken_asset",           // 設備情報テーブル
	tenkentable			: "ARtenken_tenkentable",     // 点検結果テーブル
	username			: "ARtenken_userdata",        // 作業者管理テーブル
	scenario			: "ARtenken_scenario",        // シナリオ管理テーブル
	scene				: "ARtenken_scene",           // シーン管理テーブル
	SuperimposedGraphic	: "ARtenken_arcontens",       // AR重畳表示定義テーブル
	lastTenkenEvent		: "ARtenken_tenkeneventlast", // 点検結果テーブル(前回)
	lastMessageEvent	: "ARtenken_messageeventlast",// 点検結果テーブル(今回)
	currentTenkenEevnt	: "ARtenken_tenkeneventcurrent",  // 申し送りテーブル(前回)
	currentMessageEvent	: "ARtenken_messageeventcurrent", // 申し送りテーブル(今回)

	// テーブル外
	startDatatime		: "ARtenken_STARTDATETIME",   // 点検開始日時
	operator			: "ARtenken_OPERATOR",        // 作業中の作業者名
	OperationMode		: "ARtenken_OPERATIONMODE",   // ARの通信モード
	DownloadScenario	: "ARtenken_DOWNLOADSCENARIO",// ダウンロード日時(シナリオ)
	DownloadDate		: "ARtenken_DOWNLOADDATE",    // ダウンロード日時(シナリオ以外)
	ScenarioName		: "ARtenken_SCENARIO_NAME",   // 選択したシナリオ名
	ScenarioId			: "ARtenken_SCENARIOID",      // 選択したシナリオID
	SceneNames			: "ARtenken_SCENE_NAMES",     // 選択したシナリオのシーン名一覧
};

