/**
 * @overview 点検業務向けJavaScript API群(点検GUI部)です。
 * @copyright Copyright 2014 FUJITSU LIMITED
 */


/**
 * GUIのライブラリ空間です。
 */
Tenken.GUI = {};

// Upload中フラグ
Tenken.GUI.Uploading = false;

Tenken.GUI.UploadingSelectMode = false;
Tenken.GUI.UploadingSelectTenken = false;
Tenken.GUI.UploadingSelectMsg = false;

// 選択したマーカーのみ点検結果項目を表示するための領域
Tenken.GUI.selectMarker = [];

// 結果送信時選択テーブルリスト(点検項目)
Tenken.GUI.submitAssetLists = null;

// 結果送信時選申し送り存在フラグ
Tenken.GUI.submitMsgFlag = false;

//Tenken.GUI.Scene_main    = 1; // メイン：申し送り表示
// シーン表示部に表示する文字列の定義(初期値のダミー)
Tenken.GUI.Scenes=[
  {"sceneid":0, "name":"シーン切り替え", "dispMSG":false, "dispASSET":false},
  {"sceneid":1, "name":"メイン", "dispMSG":false, "dispASSET":false}
  ];

Tenken.GUI.selectScene = 1;  // 選択中のシーンID。1は初期のダミー値。

/**
 * 点検値群を表現するクラスです。
 * @param _name 点検名
 * @param _datetime 点検開始日時
 * @param _operator 点検作業者
 */
Tenken.GUI.TenkenValue = function(_name, _datetime, _operator) {
	this.name = _name;
	this.datetime = _datetime;
	this.operator = _operator;
};

// 点検完了処理
// ストレージとデータをクリアし初画面に戻ります。
Tenken.GUI.FinishTenkenGoTop = function()
{
	Tenken.Storage.clear();

	//カレント点検結果データのクリア
	TenkenData.TenkenEvent.clearCurrentTenkenEvent();

	// カレント申し送りデータのクリア
	TenkenData.MsgEvent.clearCurrentMsgEvent();

	AR.Data.clearResourceStorage(Tenken.Util.noop, Tenken.Util.noop);

	location.replace(TenkenConst.PageName.top);
}

// 正常アップロード完了後の処理
Tenken.GUI.AfterUpload = function()
{
	try
	{
		Tenken.GUI.Uploading = false;

		// 一括送信と選択送信で終了処理を分ける
		if ( true == Tenken.GUI.UploadingSelectMode )
		{
			if (true == Tenken.GUI.UploadingSelectTenken ||
				true == Tenken.GUI.UploadingSelectMsg )
			{
				// 送信中のため継続する。
				return;
			}

			alert("Data was uploaded.");

			// 選択されたマーカーＩＤのみの送信の場合、
			// 初画面に戻らずに処理を続行します。

			// 送信対象テーブルの点検結果データ値(画面設定値とPOI)を削除
			for ( assetid in Tenken.GUI.submitAssetLists )
			{
				var tableid = TenkenData.TenkenTable.getTableIdFromAssetId(assetid);
				if ( tableid )
				{
					// 点検項目一覧の今回値をクリアする。
					Tenken.GUI.ChecklistPage.clearTable(tableid, null, false);

					// 点検結果の今回値をクリアする。
					TenkenData.TenkenEvent.resetCurrentTenkenEventTableTableId(tableid);

				}

			}

			// 送信済みの点検結果を保存しなおす
			TenkenData.TenkenEvent.saveStorage();

			Tenken.GUI.submitAssetLists=null;

			// 申し送りデータを送信した場合は、送信したカレントの申し送りデータを
			// クリアする
			if ( true == Tenken.GUI.submitMsgFlag )
			{
				TenkenData.MsgEvent.moveCurrentDataToLastData();
				Tenken.GUI.submitMsgFlag = false;
			}

			// 重畳データのリロード(完了報告した申し送りを除外)
			Tenken.GUI.setARcontents(Tenken.GUI.selectScene, true);

			Tenken.GUI.Uploading = false;

			Tenken.GUI.Page.changePage(0);
		}
		else
		{
			Tenken.GUI.UploadingSelectMode=false;
			alert("データのアップロードが完了しました。\n\n初期画面に戻ります。");

			Tenken.GUI.FinishTenkenGoTop();
		}
	}
	catch (e)
	{
		alert("exception : Tenken.GUI.AfterUpload \n" + e);
	}
}

/**
 * 現在の点検結果をサーバに送信します。
 * @return サーバ送信が成功した場合はtrue、それ以外はfalse
 */
Tenken.GUI.TenkenValue.prototype.submit = function(_submitall)
{
	if ( true == Tenken.GUI.Uploading )
	{
		alert("結果送信中です。");
		return;
	}

	Tenken.GUI.Uploading = true;
	Tenken.GUI.submitMsgFlag = false;

	//点検結果データの送信
	TenkenData.TenkenEvent.submitTenkenEvent(null, _submitall, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 1);

};

// 送信が成功した場合に呼ばれます(点検結果、申し送り、完了報告共通)
Tenken.GUI.onPostSuccess = function(_value)
{
	var finFlag=false;

	switch ( _value )
	{
	case 1:
		// 点検結果送信が完了したため、申し送りを送信する
		// 申し送りデータの送信
		Tenken.GUI.UploadingSelectTenken = false;
		Tenken.GUI.SubmitPage.submitMsg();
		break;
	case 2:
		// 申し送り送信が完了したため、完了報告を送信する
		Tenken.GUI.UploadingSelectMsg = false;
		TenkenData.MsgEvent.completeMsg(Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 3);
		break;
	case 3:
		// 完了報告旧データ削除
		TenkenData.MsgEvent.deleteMsgEvent(Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 4);
		break;
	case 4:
		// 全データ送信完了
		finFlag=true;
		break;
	}

	if ( true == finFlag )
	{
		Tenken.GUI.AfterUpload();
	}
}

// 送信が失敗した場合に呼ばれます(点検結果、申し送り、完了報告共通)
Tenken.GUI.onPostError = function(_value)
{
// エラーメッセージが多重に表示されるため、ここでは表示しません。
//	switch ( _value )
//	{
//	case 1:
//		alert("データのアップロードに失敗しました。(点検結果)");
//		break;
//	case 2:
//		alert("データのアップロードに失敗しました。(申し送り)");
//		break;
//	case 3:
//	case 4:
//		alert("データのアップロードに失敗しました。(完了報告)");
//		break;
//	}
	Tenken.GUI.Uploading = false;
	Tenken.GUI.UploadingSelectMode=false;
	Tenken.GUI.UploadingSelectTenken = false;
	Tenken.GUI.UploadingSelectMsg = false;
	Tenken.GUI.submitMsgFlag = false;
}

/** 点検値群オブジェクト。*/
Tenken.GUI.TenkenValue.instance = new Tenken.GUI.TenkenValue("点検シナリオ", new Tenken.DatetimeValue(Tenken.Storage.startDatetime.get()), Tenken.Storage.operator.get());


/**
 * 指定文字列に含まれるHTML制御文字をエスケープして返します。
 * <a href="javascript:...">等でも使用できるよう、JavaScriptを狂わせるクォート類もエンコードします。
 * @param {String} _text 対象文字列
 * @return {String} エスケープした対象文字列
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
				return ""; // IE9で"undefined"になる対応
		});
};
/** HTML制御文字エスケープ用正規表現。*/
Tenken.GUI.escapeHTML._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(&)|(<)|(>)|( |\t)|(\\\")|(\\\')", "img");
	return re;
})();

/**
 * 指定文字列に含まれるJavaScript制御文字をエスケープして返します。
 * @param {String} _text 対象文字列
 * @return {String} エスケープした対象文字列
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
				return ""; // IE9で"undefined"になる対応
		});
};
/** JavaScript制御文字エスケープ用正規表現。*/
Tenken.GUI.escapeScript._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(\\\")|(\\\')|(\\\\)", "img");
	return re;
})();


/**
 * 指定URL文字列をエンコードして返します。
 * 通常のURLエンコードでは対象にならないJavaScriptを狂わせるクォート類もエンコードします。
 * 本関数は、encodeURIComponent()でなく、encodeURI()を使用し、URI全体をエンコーディングします。
 * クエリパラメータに予約語が含まれないことを前提としているので、注意してください。
 * @param {String} _text 対象文字列
 * @return {String} エンコードした対象文字列
 */
Tenken.GUI.encodeURL = function(_text) {
	if(null == _text) return null;
	var text = encodeURI(_text);
	return text.replace(
		Tenken.GUI.encodeURL._REGEXP,
		function($0, $1) {
			if($1)
				return "%27"; // encodeURIはシングルクォートをエスケープしないため、自力で行う
			else
				return ""; // IE9で"undefined"になる対応
		});
};
/** URL制御文字エスケープ用正規表現。*/
Tenken.GUI.encodeURL._REGEXP = (function() {
	var re = new RegExp();
	re.compile("(\\\')", "img");
	return re;
})();


/**
 * 指定エレメントが見えるようにbodyをスクロールさせます。
 * @param _targetElm 表示対象エレメント。対象がなく、先頭を表示したい場合はnull
 */
Tenken.GUI.scrollBodyIntoView = function(_targetElm) {
	document.body.scrollTop = (null == _targetElm) ? 0 : (_targetElm.offsetTop - 70);
};


/**
 * GUI部品生成の基底クラスです。
 * @param {String} _id 部品ID
 */
Tenken.GUI.AbstractWidgetCreator = function() {};
/**
 * 部品のHTMLを返します。
 * @param _id 部品ID
 * @return HTML文字列
 */
Tenken.GUI.AbstractWidgetCreator.prototype.getHTML = function(_id) { return ""; }


/**
 * 数値入力部品生成クラスです。
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

	// 下限値と上限値の範囲チェック
	var numValue= parseFloat(_value);
	if ( null != _base && "" != _base)
	{
		if ( Tenken.ChecklistForm.checkValue("NUMBER", _base) == true )
		{
			// ベース値(数値)あり、下限上限あり。
			// 下限と上限はベース値からの差
			var numBase=parseFloat(_base);
			var numLow=( null == _low ) ? null : numBase - _low;
			var numHigh=( null == _high ) ? null : numBase + _high;
		}
		else
		{
			// ベース値(RowId指定)あり、下限上限あり
			// ベースはRowIdの値を取得。下限と上限はベース値からの差
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
		// ベース値なしの下限、上限のみ
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
		// 下限値や上限値の設定が無いので何もしない
		return;
	}

	var invalid = false;
	if ( false == _elm.validity.valueMissing &&
		 true == _elm.validity.valid )
	{
		// 下限値と上限値の範囲チェック
		invalid = Tenken.GUI.NumberWidgetCreator._checkLimit(_elm.value, row.LimitBase, row.LimitLow, row.LimitHigh);

		// ２つ目以降の下限値と上限値チェック
		// (１つ目で既に範囲外の場合はチェックしない)
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
 * 文字列入力部品生成クラスです。
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
	var invalid = _elm.validity.valueMissing ? false // 値がなければ非invalid
		: ((_elm.validity.valid && ( "" != _elm.value)) ? false : true);
	_elm.style.backgroundColor = invalid ? "red" : "";
	_elm.style.color = invalid ? "white" : "";
};


/**
 * トグルボタン部品生成クラスです。
 * ボタンが押される度に、valueを変更します。
 * @param _enums トグル値の配列。先頭は初期値
 * @param _instanceName 本クラスのインスタンス名
 * @param _function クリック時に呼ぶfunction。function(this, _elm, _currentEnum, _nextEnum){ return (トグルするか否か。通常動作はtrue); }
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
 * ボタンの選択状態をトグルします。
 * @param _elm 部品エレメント
 * @param _nextEnum 次に表示してほしい列挙値。nullの場合は、次のEnum値を表示
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


/** 点検スキップトグルボタン部品生成インスタンス。*/
Tenken.GUI.skipornotButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(
	["Running. Inspection is required.", "Stopping. Inspection is not required."],
	"Tenken.GUI.skipornotButtonWidgetCreator",
	function(_this, _elm, _current, _next) {
		_elm.parentElement.nextSibling.setAttribute("data-ar-skip", (_this.enums[1] == _next) ? "skip" : null); // style.display="none"で消すと、再度トグル表示した際に、tableのボーダーが太くなった感じの見た目になってしまった(Windows7 Chrome21.0.1180.89)。CSSの属性セレクタでコントロールする
		return true;
	}
);
/** 天気入力トグルボタンWidgetインスタンス。*/
Tenken.GUI.weatherButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.WEATHERTYPE.enum.enums, false), "Tenken.GUI.weatherButtonWidgetCreator");
/** OK/NGトグルボタンWidgetインスタンス。*/
Tenken.GUI.okngButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.OKNGTYPE.enum.enums, false), "Tenken.GUI.okngButtonWidgetCreator");
/** ○×トグルボタンWidgetインスタンス。*/
Tenken.GUI.marubatsuButtonWidgetCreator = new Tenken.GUI.ToggleButtonWidgetCreator(Tenken.putEach(["No input"], Tenken.ChecklistForm.MARUBATSUTYPE.enum.enums, false), "Tenken.GUI.marubatsuButtonWidgetCreator");
/** 数値入力Widgetインスタンス。*/
Tenken.GUI.numberWidgetCreator = new Tenken.GUI.NumberWidgetCreator();
/** 文字列入力Widgetインスタンス。*/
Tenken.GUI.stringWidgetCreator = new Tenken.GUI.StringWidgetCreator();

/**
 * ページを処理するクラスです。
 * 利用方法は以下のとおりです。
 * (1)main.htmlの#header_menu, #content配下にHTMLを追加
 * (2)tenkengui.cssのbody[data-ar-content="*"], #content配下にCSSを追加
 * (3)Tenken.GUI.Page.pages配列に、本クラスを継承したページクラスインスタンスを登録。pages配列インデックスと(1)のcontent_Xとを揃える必要がある。0番目はメインページ(閉じるボタンで戻るページ)インスタンスでなければならない。
 *
 * @param _arEnabled ARの重畳表示/操作等を有効にする場合はtrue、それ以外はfalse
 */
Tenken.GUI.Page = function(_arEnabled) {
	this._arEnabled = _arEnabled;
};
/**
 * ページ表示前の処理をします。
 */
Tenken.GUI.Page.prototype.handleBeforeShow = function() {};
/**
 * ページ消去前の処理をします。
 */
Tenken.GUI.Page.prototype.handleBeforeHide = function() {};
/** ページ配列。*/
Tenken.GUI.Page.pages = [];
/**
 * ページを切り替えます。
 * @param _pageIndex Tenken.GUI.Page.pages配列のインデックス
 */
Tenken.GUI.Page.changePage = function(_pageIndex) {
try
{
	var currentActivePageIndex = Tenken.GUI.Page._getShowingPageIndex();
	var currentActivePage = (0 > currentActivePageIndex) ? null : Tenken.GUI.Page.pages[currentActivePageIndex];


	var newActivePage = Tenken.GUI.Page.pages[_pageIndex];
	if(null != currentActivePage) { // 初回表示時はcurrentがない
		currentActivePage.handleBeforeHide();
		Tenken.GUI.stopCamera(); // カメラ停止
	}

	newActivePage.handleBeforeShow();

	Tenken.GUI.Page._show(_pageIndex);
}
catch (e)
{
  Tenken.Util.logerr("ページの表示に失敗しました。", e);
  alert("ページの表示に失敗しました。" +  e);
}
};
/**
 * 現在表示中のページインデックスを返します。
 * @return 現在表示中のページ。表示中のページがない場合は-1
 */
Tenken.GUI.Page._getShowingPageIndex = function() {
	var index = document.body.getAttribute("data-ar-content");
	return isNaN(index) ? -1 : parseInt(index);
};
/**
 * 指定ページを表示します。
 * @param _pageIndex 対象ページインデックス
 */
Tenken.GUI.Page._show = function(_pageIndex) {
	document.body.setAttribute("data-ar-content", _pageIndex);
	document.body.className = "tmp";
	Tenken.GUI.scrollBodyIntoView(null);
};

/** ウィンドウロードイベントリスナの登録。*/
window.addEventListener("load", function() {
try {
	// 各データのロード
	TenkenData.AllGet.loadStorage();

	// マーカー検知イベント
	Tenken.Util.addMarkerListener(onDetectMarker);
Tenken.Util.loginfo("addMarkerListener");

	if (window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i))
	{
		// タッチイベントを登録(iOS)
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
		// クリックイベントを登録(Android/Win)
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

	// 全点検項目のPOIを作成
	Tenken.GUI.LoadPOI();

	// 重畳データの登録
	Tenken.GUI.setARcontents(Tenken.GUI.selectScene, false);

	// タイトル部に表示するシナリオをダウンロードしたシナリオ名に変更
	var ScenarioName=TenkenData.Scenario.getScenarioName();
	if ( null != ScenarioName )
	{
		var elm = document.getElementById("header_title_1");
		if ( elm ) elm.innerHTML=ScenarioName;
	}

	// 差分計算自動表示用
	// input要素のchangeイベントを登録
	document.body.addEventListener("change", Tenken.GUI.onChange);

	// 初期ページを表示(メインページ)
	Tenken.GUI.Page.changePage(0);

	// ネイティブカメラを起動
	Tenken.GUI.startCamera(); // カメラ起動

	// トグルを１つ進めて表示する(メインの次のシーン名を表示)
	var elmToggle = document.getElementById("changescene");
	if ( elmToggle ) Tenken.GUI.changeSceneButtonWidgetCreator.toggle(elmToggle, null);

}
catch (e)
{
  alert("Exception:window.addEventListener load:" + e);
}

}
);

/** ウィンドウアンロード前イベントリスナの登録。*/
window.addEventListener("beforeunload", function() {
	if ( true == TenkenData.AllGet.getPhase() )
	{
		return("ダウンロード中のデータがあります。\nダウンロード中にアプリケーションを終了した場合、アプリケーションが正常に動作しなくなる可能性があります。");
	}
	if ( true == Tenken.GUI.Uploading )
	{
		return("アップロード中のデータがあります。\nアップロード中にアプリケーションを終了した場合、アプリケーションが正常に動作しなくなる可能性があります。");
	}

	// 入力中にOSの戻るボタンで戻ってしまうと、入力中の点検データが
	// クリアされてしまうため、一度メイン画面に戻し入力値を保存する。
	Tenken.GUI.Page.changePage(0); // ページ切替
});


/** ウィンドウアンロードイベントリスナの登録。*/
window.addEventListener("unload", function() {
	// マーカー検知イベントリスナ削除
    Tenken.Util.removeMarkerListener();
});

// 指定の親(Parent)配下内の入力可能なHTMLのタグのElementを
// 指定された配列に格納して返す。
Tenken.GUI.getInputTag = function(_parent, _listInputs )
{
	try
	{
		// 親配下のINPUTタグを抽出
		if ( null == _parent ) return;
		var lenchildCount=_parent.childElementCount;
		for ( var i=0 ; i < lenchildCount ; i++ )
		{
			if ( _parent.children )
			{
				var child=_parent.children[i];
				// INPUTタグ。
				if ( child && "INPUT" == child.nodeName.toUpperCase() )
				{
					// typeを絞り込む。対象以外は除外する。
					//	除外: BUTTON RADIO CHECKBOX FILE HIDDEN SUBMIT
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

// カレントElementから親をたどり、TABLEタグを探した後、
// そのTABLEタグの中に含まれるINPUTタグのリスト配列を作成して返します。
// 指定した要素の親をたどり、属性名に"input-ar-group"が登録されている
// 要素トップの親とします。
// そのトップの親の配下にあるINPUT要素を配列で返します。
Tenken.GUI.findInputTagOfTables = function(_current)
{
	try
	{
		var parentElm = _current;

		// 親をたどり、TABLEタグを探し出す。
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


/** Keydownイベントリスナの登録。*/
window.addEventListener("keydown", function(event) {

try {
	if ( !event ) return;

	// Enterが押された場合
	if ( event.keyCode == 13 )
	{

		var inputs=Tenken.GUI.findInputTagOfTables(event.target);

		// INPUTタグが２個以上存在した場合はフォーカスを移動する
		if ( inputs && 1 < inputs.length )
		{
			var lenInput=inputs.length;
			var focusIndex=0;
			for ( var i=0 ; i < lenInput ; i++ )
			{
				// 現在フォーカスをチェック
				if ( document.activeElement == inputs[i] )
				{
					// 次のInput要素の配列を求める。最後の場合は先頭(0)に戻す。
					focusIndex = (i+1) % lenInput;

					// 次のInput要素へフォーカスを移動する
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
 * ARメインページクラスです。
 */
Tenken.GUI.ARPage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.ARPage, Tenken.GUI.Page);
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
Tenken.GUI.ARPage.prototype.handleBeforeShow = function() {
	Tenken.traceEvent(Tenken.GUI.TenkenValue.instance.operator, Tenken.traceEvent.Type.AR_SHOW, null, null, null);
};
/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.ARPage());
/**
 * マーカー検知状態変更時に呼ばれる関数です。
 * @param {Number} _markerId マーカーID
 * @param {Boolean} _status 当該ID新規検出の場合はtrue、当該ID消失の場合はfalse
 */
function onDetectMarker(_result){
	// 引数に検知したマーカ情報が含まれています。
	var markval = _result.getValue();

		if(markval.status == true){ //検出した場合
			//マーカー検知通知領域の表示を変更します。
Tenken.Util.loginfo("onDetectMarker:" + markval.markerId);

			// 選択されたマーカーの情報をサマリウィンドウに表示します。
			Tenken.GUI.Page.Summary.showByMarkerId(markval.markerId);

		} else if(markval.status == false){ //消失した場合

Tenken.Util.loginfo("onDetectMarker:" + 0);

			// サマリウィンドウの情報を空にして表示にします。
			Tenken.GUI.Page.Summary.showByMarkerId(0);
		}
};

/**
 * サマリウィンドウを処理するライブラリ空間です。
 */
Tenken.GUI.Page.Summary = {};
/**
 * マーカーIDに紐付いた情報を表示します。
 * @param _markerId マーカーID
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
			str += "マーカーID[" + _markerId + "]の設備データはありません。";
			str += "</dt></dl>";
		}

	}
Tenken.Util.loginfo("Tenken.GUI.Page.Summary.showByMarkerId");
	elm.innerHTML = str;
};
/**
 * 申し送りEVENT POI IDに紐付いた情報を表示します。
 * @param _poiId 申し送りEVENT POI ID
 * @param _occurrenceTime 発生日時。未登録POIはidを持っていないため、この値で特定する TODO 本来はどうすべき? たまたま同じ時間のPOIってことがある??
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

// AR.OS.openUrl失敗時のコールバックです。
Tenken.GUI.Page.Summary.openUrlError = function(_result)
{
	// URLのオープン失敗。
	var message = "AR.OS.openUrl:error:";
	var detail = _result.getStatus() + "\n"+ _result.getValue();

	Tenken.Util.logerr(message, detail);
}

// サマリ画面で追加アイコン(点検入力、申送追加以外)がタップされた
// 場合のファイルオープン処理
Tenken.GUI.Page.Summary.openUrl = function(_url)
{
	if ( null != _url )
	{
		AR.OS.openUrl(_url,Tenken.Util.noop, Tenken.GUI.Page.Summary.openUrlError);
	}
}

// サマリ画面のサムネイルグラフを表示しているiframeのロード完了後に
// 再度マーカー検知イベントリスナーを登録
// Windows版のみです。iframeを利用した場合、画面遷移され、
// リスナーが消えるためです。
Tenken.GUI.Page.Summary.onLoadIframe = function() {
	// マーカー検知イベント
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
 * ASSET POIのHTMLを返します。
 * @param _poi ASSET POI
 * @return HTML文字列
 */
Tenken.GUI.Page.Summary._getAssetPOIHTML = function(_asset) {
	var elm = document.getElementById("summary");
	var graphWidth = elm.offsetWidth - 40;
	var graphHeight = Math.min(100, Math.floor(elm.offsetHeight / 2));
	var poiidHS = Tenken.GUI.escapeHTML(Tenken.GUI.escapeScript(_asset.assetid));
	var poinameH = Tenken.GUI.escapeHTML(_asset.assetname);
	var pointid = _asset.markerid; // escape不要

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

	// 点検グラフアイコン
	// 指定が無い場合はデフォルトを表示
	var strGraph="";
	if ( null != _asset.graphURL )
	{
		var iconInfo=_asset.graphURL[0];
		var nameTenken=( null == iconInfo[0] ) ? "点検グラフ" : iconInfo[0];
		var graphURL=( null == iconInfo[1] ) ? "" : iconInfo[1];
		if ( "none" != nameTenken.toLowerCase() )
		{
			strGraph += ((null == graphURL) ? "" : "<a href='javascript:Tenken.GUI.Page.Summary.openUrl(\"" + graphURL + "\")' data-ar-eventtype='SUMMARY_MAINTENANCEGRAPH'><img src='image/icon-dark/xdpi/graph-reference.png'><br>" + nameTenken + "</a>");
		}
	}

	// 点検入力アイコン
	// 指定が無い場合はデフォルトを表示
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

	// 申し送りアイコン
	// 指定が無い場合はデフォルトを表示
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

	// イメージ表示(グラフ)
	if ( null != _asset.imageURL && "none" != _asset.imageURL.toLowerCase() )
	{
		var imageUrlU = Tenken.GUI.encodeURL(_asset.imageURL);

		// Windows版のみです。iframeを利用した場合、画面遷移され、
		// ARマーカー検知リスナーが消えるため、iframeのロード完了後に、
		// 再度リスナーを登録する関数を呼びます。
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
 * 申し送りEVENT POIのHTMLを返します。
 * @param _poi 申し送りEVENT POI
 * @param _highlight ハイライトする場合はtrue、それ以外はfalse
 * @return HTML文字列
 */
Tenken.GUI.Page.Summary._getMessageEventPOIHTML = function(_poi, _highlight) {

	var poioccurrencetimeSTR = new Tenken.DatetimeValue(_poi.occurrencetime).toString();
	var poioperatorH = Tenken.GUI.escapeHTML(_poi.operator);
	var level = _poi.level;
	var className = ((9 > level) ? "messageeventinfo" : "cautioneventinfo") + (_highlight ? " highlightinfo" : "");
	var udtitleH = Tenken.GUI.escapeHTML(_poi.title);
	var udvalueH = Tenken.GUI.escapeHTML(_poi.value);

	// サーバからダウンロードした申し送りの場合は、完了報告ボタンを表示する
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
 * Submitページクラスです。
 */
Tenken.GUI.SubmitPage = function() {
	Tenken.GUI.Page.call(this, false);
};
Tenken.inherit(Tenken.GUI.SubmitPage, Tenken.GUI.Page);

// 選択された結果のみ送信します。
// 送信対象のcheckboxのチェックがONになっている項目のみ送信します。
Tenken.GUI.SubmitPage.submitTable = function()
{
	try
	{
		if ( true == Tenken.GUI.Uploading )
		{
			alert("結果送信中です。");
			return;
		}

		Tenken.GUI.UploadingSelectMode=false;
		Tenken.GUI.submitMsgFlag = false;

		var elmCheck=null;

		var arrayTables = new Array();
		var arrayAssetId = new Array();

		Tenken.GUI.submitAssetLists = new Object();

		// チェックされている設備のテーブルIDを取得
		var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
		{
			if ( null ==_table ) return;

			elmCheck =document.getElementById(Tenken.GUI.SubmitPage._createSubmitTableId(_table.TableId));
			if (  null != elmCheck && true == elmCheck.checked )
			{
				if ( arrayTables.indexOf(_table.TableId) < 0 )
				{
					//	まだ未登録なら
					arrayTables.push(_table.TableId);
				}
				if ( arrayAssetId.indexOf(_row.AssetId) < 0 )
				{
					//	まだ未登録なら
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
				// 基本情報は、マーカーIDがない場合があるため、
				// nullの場合はＩＤ=0として扱う
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

			//点検結果データの送信(指定設備に含まれるマーカーＩＤの分のみ送信）
			TenkenData.TenkenEvent.submitTenkenEvent(listMarkerIds, true, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 1);
		}
		else
		{
			// 点検項目が送信対象に選択されていない、かつ、申し送りが
			// 送信対象として選択されている場合は、点検項目の送信のあとに
			// 送信されないため、ここで申し送りを送信する。
			// 申し送りのテーブルIDを取得
			elmCheck =document.getElementById("content_1_submit_msg");
			if (  null != elmCheck && true == elmCheck.checked )
			{
				// 指定されていれば、申し送りを送信
				Tenken.GUI.UploadingSelectMode=true;
				Tenken.GUI.submitMsgFlag = true;
				Tenken.GUI.SubmitPage.submitMsg();
			}
			else
			{
				alert("送信対象が選択されていません");
			}
		}
	}
	catch (e)
	{
		alert("exception : Tenken.GUI.SubmitPage.submitTable\n" + e);
	}

}

// 申し送りを送信します。
Tenken.GUI.SubmitPage.submitMsg = function()
{
	Tenken.GUI.Uploading = true;
	Tenken.GUI.submitMsgFlag = true;
	Tenken.GUI.UploadingSelectMsg = true;

	// 申し送りデータの送信
	TenkenData.MsgEvent.submitMsgEvent(null, Tenken.GUI.onPostSuccess, Tenken.GUI.onPostError, 2);

}

// 指定テーブルＩＤの入力値に未入力項目/書式誤りがないかチェック
//   _tableid   : 設備テーブルのIDを指定します。
//   _noinputok : 未入力項目の取り扱いモードを指定します。
//                true: 未入力項目も完了として使いカンントしません。
//                その他の値: 未入力項目をカウントして戻り値として返します。
// 戻り値
//   -1    : 設備停止
//    0    : 未入力項目/書式誤り項目なし。
//   1以上 : 未入力項目/書式誤り項目数。
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

// 点検値未入力送信の許可チェックボックスのクリックイベント
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
	// 結果送信画面の再描画
	if ( true == reloadPage ) Tenken.GUI.Page.changePage(1);
}

/**
 * ページコンテンツHTMLを返します。
 * @return コンテンツHTML文字列
 */

Tenken.GUI.SubmitPage.getContentHTML = function() {
try {
	var str = '';

	// main.htmlの描画時にデータが空になるため、ここでロードします。
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

	// 点検項目の値未入力がある場合の送信の可否のチェックボックス表示の有無
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

			// 入力未完了項目が存在しても送信可能の場合は値未設定でも完了にする
			// 未入力項目はinvalidにしない。
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
		// 入力未完了項目が存在しても送信可能の場合は値未設定でも送信可能
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


	// 申し送りデータの表示
	var str = "";
	var messageStr = "";

	var msgevent = null;

	// 申し送り(新規登録)
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

	// 申し送り(完了報告)
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
 * Tenken.ChecklistForm.Tableの部品IDを生成して返します。
 * @param _table Tenken.ChecklistForm.Tableオブジェクト
 * @return 部品ID
 */
Tenken.GUI.SubmitPage._createTableWidgetId = function(_tableid) {
	return "content_1_" + _tableid;
};
Tenken.GUI.SubmitPage._createSubmitTableId = function(_tableid) {
	return "content_1_submit_" + _tableid;
};
/**
 * 結果を送信します。
 * @param _submitall
 *           true   :全設備の点検結果送信。(停止設備も送信）
 *           false  :停止している設備の結果は送信しない。
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
/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.SubmitPage());


/**
 * Checklistページクラスです。
 */
Tenken.GUI.ChecklistPage = function() {
	Tenken.GUI.Page.call(this, false);
};
Tenken.inherit(Tenken.GUI.ChecklistPage, Tenken.GUI.Page);

// 条件判定欄に上限値、下限値の文字列を組み立てます。
Tenken.GUI.ChecklistPage.setLimitString = function(_limitLow, _limitHigh, _limitBase)
{
	var str="";
	// 上限値、下限値を条件判定欄に追記する
	if ( null != _limitLow || null != _limitHigh )
	{
		str += " ";
		if ( null == _limitBase || "" == _limitBase)
		{
			// ベース値なし、下限上限あり
			if ( null != _limitLow && null != _limitHigh ) str += "[" + _limitLow  + " - " + _limitHigh + "]";
			else if ( null != _limitLow ) str += "[more than " + _limitLow  + "]";
			else str += "[less than " + _limitHigh  + "]";
		}
		else if ( Tenken.ChecklistForm.checkValue("NUMBER", _limitBase) == true )
		{
			var fBase = parseFloat(_limitBase );

			// ベース値(数値)あり、下限上限あり
			if ( _limitLow == _limitHigh ) str += "[" + fBase  + "±" + _limitLow + "]";
			else if ( _limitLow && _limitHigh ) str += "[" + (fBase - _limitLow)  + " - " + (fBase + _limitHigh) + "]";
			else if ( null != _limitLow ) str += "[more than" + (fBase  - _limitLow)  + "]";
			else str += "[less than" + (fBase + _limitHigh)  + "]";
		}
	}
	return(str);
}

/**
 * ページコンテンツHTMLを返します。
 * @return コンテンツHTML文字列
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

	// テーブル表示(設備)
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
			// グループ設定あり
			for ( var j=0 ; j < table.listRowGroups.length ; j++ )
			{
				var group=table.listRowGroups[j];

				groupTd = '<td rowspan="' + group.listRows.length + '">' + group.RowGroupName + '</td>';
				firstRow = true;

				// 点検項目(Row)表示
				for ( var k=0 ; k < group.listRows.length ; k++ )
				{
					row=group.listRows[k];
					str += '<tr>';
					if(firstRow) str += groupTd;
					str += '<td>' + row.RowName + '</td>';
					str += '<td>' + Tenken.GUI.ChecklistPage._createCurrentRowWidgetHTML(row) +  '</td>';
					str += '<td id="' + Tenken.GUI.ChecklistPage._createLastRowWidgetId(row.RowId) + '"></td>';
					var strDesc=((null == row.Description) ? "" : row.Description);
					// 上限値、下限値を条件判定欄に追記する
					strDesc += Tenken.GUI.ChecklistPage.setLimitString(row.LimitLow, row.LimitHigh, row.LimitBase);
					// 2つ目以降の上限値、下限値を追記する
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
			// グループ設定なし
			// 点検項目(Row)表示
			for ( var k=0 ; k < table.listRowsTable.length ; k++ )
			{
				row=table.listRowsTable[k];
				str += '<tr>';
				str += '<td colspan="2">' + row.RowName + '</td>';
				str += '<td>' + Tenken.GUI.ChecklistPage._createCurrentRowWidgetHTML(row) + '</td>';
				str += '<td id="' + Tenken.GUI.ChecklistPage._createLastRowWidgetId(row.RowId) + '"></td>';
				var strDesc=((null == row.Description) ? "" : row.Description);
				// 上限値、下限値を条件判定欄に追記する
				strDesc += Tenken.GUI.ChecklistPage.setLimitString(row.LimitLow, row.LimitHigh, row.LimitBase);
				// 2つ目以降の上限値、下限値を追記する
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
 * Tenken.ChecklistForm.Tableの処理スキップ部品IDを生成して返します。
 */
Tenken.GUI.ChecklistPage._createTableSkipWidgetId = function(_tableid) {
	return "content_2_table_skip_" + _tableid;
};
/**
 * 現在のTenken.ChecklistForm.Rowの部品IDを生成して返します。
 */
Tenken.GUI.ChecklistPage._createCurrentRowWidgetId = function(_rowid) {
	return "content_2_row_current_" + _rowid;
};
/**
 * 過去のTenken.ChecklistForm.Rowの部品IDを生成して返します。
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
 * 入力用WidgetのHTML文字列を返します。
 * @return 入力用WidgetのHTML文字列
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
			alert("ValutTypeが正しくない項目があります。\nRowId=" + _row.RowId + "\nRowName=" + _row.RowName + "\nValueType=" + _row.ValueType);
			break;
	}

	return (null == widget) ? "" : widget.getHTML(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId));
};

// クリアボタンが押下された設備の今回値をクリアします。
// _tableidがnullの場合は、全点検項目値をクリアします。
Tenken.GUI.ChecklistPage.clearTable = function(_tableid, _assetid, _confirm)
{
	if ( true == _confirm && confirm("Do you clear?") != true )
	{
		return;
	}

	// 点検項目一覧の今回値のクリア
	var tableid=null;
	var elm=null;
	if ( null != _tableid )
	{
		var elmid = Tenken.GUI.ChecklistPage._createClearButtonId(_tableid)
		elm = document.getElementById(elmid);
		if ( elm )
		{
			// クリアボタンのIDからTableIdを求める
			tableid=Tenken.GUI.ChecklistPage._createTableIdFromClearButtonElm(elm);
		}
	}

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		// 指定tableidまたはassetiと一致する点検項目(rowid)の
		// 値をクリア・初期化する。
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
						// トグルは、値配列の１個目(初期表示値)に設定します。
						widget.toggle(elmValue, widget.enums[0]);
					}
					else
					{
						// トグル以外のフィールドは、nullクリアします。
						elmValue.value=null;
					}
					// 値チェックが有効なフィールドは、値チェックします。
					// クリア対象の点検項目を参照している点検項目がある
					// 場合は、再チェックの必要があるため。
					if ( validate )
					{
						validate(elmValue);
					}
				}
				else
				{
					// widgetが取得できないValutTypeのフィールドは、
					// nullクリアします。
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

	// 表示するマーカーＩＤが指定されている場合には、該当テーブルのみ表示する
	// ここでは、該当するテーブル配列を作成する
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

	// 表示対象が１つのマーカー、または対象設備が０個の場合は、
	// "全点検項目値クリア"ボタンは表示しない
	if ( 1 == selectTableId.length || 0 == TenkenData.TenkenEvent.Current.length )
	{
		var elmClearAll = document.getElementById("content_2_clear_button_allclear");
		//hidden=trueは有効にならないエンジンもあるため、style.visibilityを
		//使用する。
		//ただし、ボタンが見えないだけで領域も確保されたままになります。
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
			// 今回値の設定
			if(null != _value) document.getElementById(Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId)).value = _value;
			if(null != _assetstatus)
			{
				var skipWidget = document.getElementById(Tenken.GUI.ChecklistPage._createTableSkipWidgetId(_table.TableId));
				if ( skipWidget )
				{
					Tenken.GUI.skipornotButtonWidgetCreator.toggle(skipWidget, ("STOP" == _assetstatus) ? Tenken.GUI.skipornotButtonWidgetCreator.enums[1] : Tenken.GUI.skipornotButtonWidgetCreator.enums[0]);
				}

				// 下限値、上限値のチェック
				// 数字項目の場合のみチェックする
				if ( "NUMBER" == _row.ValueType )
				{
					// チェックする点検項目の今回値の<td>のid値とエレメント取得
					var idRow=Tenken.GUI.ChecklistPage._createCurrentRowWidgetId(_row.RowId);
					if ( idRow )
					{
						var elm=document.getElementById(idRow);
						if ( elm )
						{
							// 点検項目の下限、上限値をチェックする
							Tenken.GUI.NumberWidgetCreator._validate(elm);
						}
					}
				}
			}

			// マーカーＩＤ指定がある場合、指定マーカー以外の項目を
			// 非表示にする。基本法目である天気、室温も表示しない。
			var idHeader=Tenken.GUI.ChecklistPage._createHeaderId(_table.TableId);
			var idTable=Tenken.GUI.ChecklistPage._createTableId(_table.TableId);
			var hdname="hr_" + Tenken.GUI.ChecklistPage._createTableId(_table.TableId);
			var skipHeader = document.getElementById(idHeader);
			var tableWidget = document.getElementById(idTable);
			var hrWidget = document.getElementById(hdname);

			// hiddenが有効にならない場合があるためstyle.displayを利用する
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
			// テーブル、スキップトグル、横罫線を非表示にする。
			if ( tableWidget ) tableWidget.style.display=hiddenDisp;
			if ( skipHeader ) skipHeader.style.display=hiddenDisp;
			if ( hrWidget )	hrWidget.style.display=hiddenDisp;
		}
		else
		{
			// 前回値の設定
			var statused = (null == _assetstatus) ? _value : (("START" == _assetstatus) ? _value : _assetstatus);
			document.getElementById(Tenken.GUI.ChecklistPage._createLastRowWidgetId(_row.RowId)).innerHTML = (null == statused) ? "" : statused;

			// 前回値の設定時間設定
			var idLast=Tenken.GUI.ChecklistPage._createLastData(_table.TableId);
			var elmLast=document.getElementById(idLast);
			if ( elmLast )
			{
				elmLast.innerHTML=(null == _poi2.occDatetimeStr ? "" : _poi2.occDatetimeStr) + '</font>';
			}
		}
	}

	// 今回値の設定
	current = true;
	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

	// 前回値の設定
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

		// 設定されている今回値にPOI2に設定
		_poi2[_valueEntryName] = ("" == fieldValue) ? null : fieldValue;

		// 設備の稼動状態(稼動/停止)を設定
		var skipWidget = document.getElementById(Tenken.GUI.ChecklistPage._createTableSkipWidgetId(_table.TableId));
		if ( skipWidget )
		{
			_poi2.assetstatus = (Tenken.GUI.skipornotButtonWidgetCreator.enums[1] == skipWidget.value) ? "STOP" : "START";
		}
		else
		{
			// 停止できない設備は"START"を設定
			_poi2.assetstatus = "START";
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

	// 画面からPOI2に設定した点検結果データをローカルストレージに保存
	TenkenData.TenkenEvent.saveStorage();

	// 入力画面を固定に戻す。
	Tenken.GUI.ChecklistPage.changeMode(false);

}
catch (e)
{
	alert("Exception : Tenken.GUI.ChecklistPage.prototype.handleBeforeHide\n" + e);
}
};
/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.ChecklistPage());
/**
 * 自ページを表示し、指定のpoiが見えるようにスクロールします。
 * @param {String} _poiId poi.id
 */
Tenken.GUI.ChecklistPage.showPageAndTargetContent = function(_targetassetid) {
	Tenken.GUI.selectMarker=[TenkenData.Asset.getMarkerIdfromAssetId(_targetassetid)];
	Tenken.GUI.Page.changePage(2);
};

// 未完了(未入力または書式誤りがある)の設備の点検項目入力画面に切り替えます。
Tenken.GUI.ChecklistPage.showPageAndTargetContentMarkerId = function(_markerid) {
	Tenken.GUI.selectMarker=[_markerid];
	Tenken.GUI.Page.changePage(2);
};

/**
 * Messagelistページクラスです。
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
		var level = msg.level; // escape不要
		var valueH = Tenken.GUI.escapeHTML(msg.value);

		// サーバからダウンロードした申し送りの場合は、完了報告ボタンを表示する
		var strCompBtn = ( null == msg.qentityId ) ? "" : '<input type="button" + value="Completion report" class="completeMsg" onClick="Tenken.GUI.completeMessagePage.completeMsg(' +  msg.msgid  + ')" >';
		var strComplete = (null == msg.Answer) ? "" : "[Completion report]" + msg.Answer;
		// 新規申し送りの場合は、申送取消しボタンを表示する
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

	// 申し送り入力ダイアログを表示するボタンを表示
	str += '<hr>';
	str += '<button id="content_3_inputmsg" onclick="Tenken.GUI.AddingMessagePage.InputMsgByMarkerId(-1);" data-ar-eventtype="MESSAGELIST_INPUT_MSG">Input message</button><br><br>';

	document.getElementById("content_3").innerHTML = str;
};
/**
 * 申し送りの部品IDを生成して返します。
 * @param _poiId poiのid
 * @return 部品ID
 */
Tenken.GUI.MessagelistPage._createRecordWidgetId = function(_poiId) {
	return "content_3_" + _poiId;
};
/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.MessagelistPage());
/**
 * 自ページを表示し、指定のpoiが見えるようにスクロールします。
 * @param {String} _poiId poi.id
 */
Tenken.GUI.MessagelistPage.showPageAndTargetContent = function(_poiId) {
	Tenken.GUI.Page.changePage(3);
	var elm = document.getElementById(Tenken.GUI.MessagelistPage._createRecordWidgetId(_poiId));
	if(null != elm) Tenken.GUI.scrollBodyIntoView(elm);
};


/**
 * AR重畳データを登録、表示します。
 */
Tenken.GUI.setARcontents = function(_sceneid, _reset)
{
	// シーンID毎のAR重畳表示定義データを表示。

	if ( null == _sceneid || _sceneid < 0 )
	{
		return;
	}
	// シーンIDからシーン情報の取得
	var scene=Tenken.GUI.getSceneFromSceneId(_sceneid);
	if ( null == scene )
	{
		return;
	}

	// AR重畳表示をクリア
	AR.Renderer.clear(Tenken.Util.noop,Tenken.Util.noop);

	// 変更がある可能性のある申し送りデータ、削除された項目を
	// リセットするため、AR重畳定義データをストレージから
	// ロードしなおす。
	if ( true == _reset )
	{
		TenkenData.MsgEvent.loadStorage();
		TenkenData.SuperimposedGraphic.loadStorage();
	}

	var SceneName=null;

	// 選択シーンIDの保存
	Tenken.GUI.selectScene=_sceneid;

	// シーン定義が無い場合も表示する
	// 申し送りおよび設備名は、表示設定が設定されているシーンのみ表示する。
	// ただし、シーンが１つも定義されていない場合には両方とも表示する。
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

	// 表示するシーン名を取得
	SceneName=TenkenData.Scene.getSceneName(_sceneid);

	// シーン名を変更
	if ( null != SceneName )
	{
		var elm = document.getElementById("header_title_2");
		if ( elm ) elm.innerHTML=SceneName;
	}
}

// 指定された申し送り(新規登録)を取り消します。
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

				// ストレージに申し送りデータを保存しなおす。
				TenkenData.MsgEvent.saveStorage();

				// 重畳データのリロード
				Tenken.GUI.setARcontents(Tenken.GUI.selectScene, true);

				// ページのリロード
				Tenken.GUI.Page.changePage(3);
			}
		}
	}
}

/**
 * AddingMessageページクラスです。
 */
Tenken.GUI.AddingMessagePage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.AddingMessagePage, Tenken.GUI.Page);

/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.AddingMessagePage());

// 申し送り入力ダイアログの初期化
Tenken.GUI.AddingMessagePage.getContentHTML = function() {
	var str = '';
	return str;
};
/** @extends Tenken.GUI.Page.prototype.handleBeforeShow */
// 申し送り入力ダイアログが表示される前の前処理
Tenken.GUI.AddingMessagePage.prototype.handleBeforeShow = function() {
	// 画面を初期化して表示します。
	var message = document.getElementById("content_4");
	message.innerHTML = "";
};

/**
 * 申し送り入力ダイアログを起動します。
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

	// マーカーID指定がある場合には、指定マーカーのみ表示・処理
	if ( -1 != _markerid )
	{
		// 指定マーカーIDの設備名を取得
		var assetname = TenkenData.Asset.getAssetNamefromMarkerId(_markerid);
	}
	else
	{
		// 全設備名表示
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
 * 申し送り入力ダイアログで登録ボタンが押下された場合の
 * 申し送り登録処理を行います。
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

	// マーカーID指定の場合は、指定マーカーIDを設定
	var markerid=_markerid;
	if ( -1 == _markerid )
	{
		// 選択している設備名のvalue(=マーカーID)を取得する
		var elm = document.getElementById("assetselect");
		if ( null != elm && "" != elm.value )
		{
			markerid=parseInt(elm.value);
		}
		else
		{
			alert("選択した対象機器が正しくありません");
			return;
		}
	}

	var nowDateTime = new Date().getTime();
	var assetdata = TenkenData.Asset.getDatafromMarkerId(markerid);
	var markername = ( null != assetdata ) ? assetdata.markername : "";
	var targetassetid = ( null != assetdata ) ? assetdata.assetid : "";

	// msgidは、本来自動採番されたユニークなIDを利用するなどしてください。
	// ここでは、日付時間を代用しています。
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

	// 重畳データのリロード(新規に登録した申し送りを表示)
	Tenken.GUI.setARcontents(Tenken.GUI.selectScene, false);

	// ストレージに申し送りデータを保存しなおす。
	TenkenData.MsgEvent.saveStorage();

	Tenken.GUI.Page.changePage(0); // ページ切替
}
catch (e)
{
	alert("Exception : Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog\n" + e);
}

}

/**
 * 申し送り入力ダイアログでキャンセルボタンが押下された場合に
 * メインページに切り替える処理を行います。
 */
Tenken.GUI.AddingMessagePage.ShowMessageInputDialogCancel = function()
{
	Tenken.GUI.Page.changePage(0); // ページ切替
}



/**
 * completeMessagePageページクラスです。
 */
Tenken.GUI.completeMessagePage = function() {
	Tenken.GUI.Page.call(this, true);
};
Tenken.inherit(Tenken.GUI.completeMessagePage, Tenken.GUI.Page);

/** ページクラスインスタンスの登録。*/
Tenken.GUI.Page.pages.push(new Tenken.GUI.completeMessagePage());



// 申し送り完了報告入力ダイアログの初期化
Tenken.GUI.completeMessagePage.getContentHTML = function() {
	var str = '';
	return str;
};

// 申し送り完了報告入力ダイアログが表示される前の前処理
Tenken.GUI.completeMessagePage.prototype.handleBeforeShow = function() {

	// 画面を初期化して表示します。
	var message = document.getElementById("content_5");
	message.innerHTML = "";
};

/**
 * 申し送り完了報告入力ダイアログを起動します。
 */
Tenken.GUI.completeMessagePage.completeMsg = function(_id)
{
	if ( null == _id ) return;

	// 申し送りデータをリスト内から取得
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

	// 設備名を取得
	var assetname = TenkenData.Asset.getAssetNamefromMarkerId(msg.markerid);

	// 既に完了報告が入力されていた場合にはその内容を設定
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
 * 完了報告ダイアログで登録ボタンが押下された場合の
 * 完了報告登録処理を行います。
 */

Tenken.GUI.completeMessagePage.performAfterShowMessageInputDialog = function(_id)
{
try {

	var elmValue=document.getElementById("completemsg_value");
	if ( null == elmValue || elmValue.value == "" )
	{
		alert("完了報告の内容が入力されていません");
		return;
	}

	// msgidから該当の申し送りデータを取得する
	var msg = TenkenData.MsgEvent.getMsgEventFromMsgIdLast(_id);

	// 完了報告を格納し、完了フラグを"TRUE"に変更します。
	msg.Enable="false";
	msg.Answer=elmValue.value;

	// ストレージに申し送りデータを保存しなおす。
	TenkenData.MsgEvent.saveStorage();

	Tenken.GUI.Page.changePage(0); // ページ切替
}
catch (e)
{
	alert("Exception : Tenken.GUI.AddingMessagePage.performAfterShowMessageInputDialog\n" + e);
}

}

/**
 * 完了報告入力ダイアログでキャンセルボタンが押下された場合に
 * メインページに切り替える処理を行います。
 */
Tenken.GUI.completeMessagePage.ShowMessageInputDialogCancel = function()
{
	Tenken.GUI.Page.changePage(0); // ページ切替
}

/**
 * 完了報告入力ダイアログで取り消しボタンが押下された場合に
 * 完了報告をクリアし、メインページに切り替える処理を行います。
 */
Tenken.GUI.completeMessagePage.ShowMessageInputDialogReject = function(_id)
{
	// 申し送りデータをリスト内から取得
	var msg = TenkenData.MsgEvent.getMsgEventFromMsgIdLast(_id)
	if ( null != msg )
	{
		msg.Enable = "true";
		msg.Answer = null;

		// ストレージに申し送りデータを保存しなおす。
		TenkenData.MsgEvent.saveStorage();
	}

	Tenken.GUI.Page.changePage(0); // ページ切替
}



/** タップイベント通知のonErrorに設定するコールバック関数です。 */
Tenken.GUI.Page.onBodyClickError = function(_result){
	var message = "タップイベントの通知に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	alert(message + ":" + detail);
};

// 全点検項目のPOIを作成
Tenken.GUI.LoadPOI = function()
{
	try
	{
		// POI2が存在しない点検項目(前回値、今回値のPOI2を作成する)
		if ( !Tenken.Storage.currentTenkenEventData.isExist() )
		{
			var current;
			var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
			{
				// 既にPOI2が登録済みの場合は登録必要なし。
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

				// POI2の登録
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

			// 前回値のPOI作成
			current = false;
			TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Last, null, null, rowFunc);

			// 今回値のPOI作成
			current = true;
			TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

			// 点検項目の前回値に今回値に設定する (rowのSetLastDataがtrueの項目のみ)
			TenkenData.TenkenEvent.copyCurrentDataFromLastData();
		}

	}
	catch (e)
	{
		alert("Exception :Tenken.GUI.DataMapping \n" + e);
	}

	return;
}

// 表示するシーン名および切り替えトグルの作成
Tenken.GUI.createSceneToggle = function()
{
	// シーン名リストを作成
	var listSceneName=[];
	var lenScene=TenkenData.Scene.ListAll.length;

	if ( 0 < lenScene )
	{
		Tenken.GUI.Scenes.length=lenScene;
		for ( var i=0 ; i < lenScene ; i++ )
		{
			listSceneName.push(TenkenData.Scene.ListAll[i].name);

			// シーン名とIDをダミーからダウンロードしたシーン情報に書き換える
			var scene=new Object();
			scene.name=TenkenData.Scene.ListAll[i].name;
			scene.sceneid=TenkenData.Scene.ListAll[i].sceneid;
			scene.dispMSG=TenkenData.Scene.ListAll[i].dispMSG;
			scene.dispASSET=TenkenData.Scene.ListAll[i].dispASSET;
			Tenken.GUI.Scenes[i]=scene;
		}
		// １つめのシーンIDを設定
		Tenken.GUI.selectScene=TenkenData.Scene.ListAll[0].sceneid;
	}
	else
	{
		// 表示するシーンがないためダミーを表示する
		listSceneName.push("(シーンなし)");
	}

	// シーン切り替えトグルボタンを作成
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

// 表示するシーンの変更
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

	// 表示中のシーンと異なるシーンの場合は、
	// AR重畳表示定義データを登録しなおして表示する
	if ( selectScene != Tenken.GUI.selectScene )
	{
		//AR重畳表示定義データをネイティブAR表示層に設定します。
		Tenken.GUI.setARcontents(selectScene, false);
	}
}

// 表示するシーン情報の取得
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

// 点検結果項目の差分計算・表示を行います。
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
		// 少数点第３桁は四捨五入
		value=(Math.round(_value1 / _value2 * 1000)) / 1000;
		break;
	case "*":
		value=(Math.round(_value1 * _value2 * 1000)) / 1000;
		break;
	}
	return(value);
}

// 入力値が変更された点検項目の上限値、下限値をチェック
Tenken.GUI.changeDiffValue = function(_id)
{
	var lenPrefix="content_2_row_current_".length;
	var rowId=_id.slice(lenPrefix);

	var rowFunc = function(_table, _group, _row, _poi2, _valueEntryName, _value, _assetstatus)
	{
		// 数字項目以外は差分計算は行わない
		if ( null == _row  || "NUMBER" != _row.ValueType) return;

		var foundRow=false;

		// 上限、下限計算反映(LimitBaseがRowId指定のRowの場合)
		if ( rowId == _row.LimitBase ) foundRow=true;

		// 2つ目以降の条件以降のRowIdに指定がある場合もチェックする。
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
				Tenken.GUI.NumberWidgetCreator._validate(elmValue);
			}
		}

		// 差分計算
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
				if ( null != value )
				{
					elmValue.value=value;
					Tenken.GUI.NumberWidgetCreator._validate(elmValue);
				}
			}
			else
			{
				// 値１か２が表示できない場合は自動計算結果を値なしに設定
				elmValue.value=null;
			}
		}
	}

	TenkenData.TenkenTable.foreachTables(TenkenData.TenkenEvent.Current, null, null, rowFunc);

}

// input要素の値が変更された場合に呼び出されるイベントハンドラです。
// 値の変更が無い場合は呼ばれません。
Tenken.GUI.onChange = function(event)
{
	// 点検結果差分計算・表示
	if ( event && event.target )
	{
		Tenken.GUI.changeDiffValue(event.target.id);
	}
}

// 結果送信画面で、送信対象のチェックを全選択または全解除します。
// _check : true -> 全選択、false -> 全解除
Tenken.GUI.submitCheckAll = function(_check)
{
	var elmCheck=null;

	// 点検設備の各チェックをON(true)またはOFF(false)
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

	// 申し送りのチェックをON(true)またはOFF(false)
	elmCheck =document.getElementById("content_1_submit_msg");
	if ( null != elmCheck )
	{
		elmCheck.checked = _check;
	}

}

// カメラ起動
Tenken.GUI.startCamera = function()
{
	Tenken.Util.startCameraView();
}
// カメラ停止
Tenken.GUI.stopCamera = function()
{
	Tenken.Util.stopCameraView();
}

Tenken.GUI.ChecklistPage.dispMove=0;

// 点検項目一覧画面の固定／可変モードの切り替え。
Tenken.GUI.ChecklistPage.changeMode = function(_mode)
{
	var elm = document.getElementById("content_2");
	if ( elm )
	{
		var setAttr=0;
		if ( true == _mode || ( null == _mode && Tenken.GUI.ChecklistPage.dispMove == 0 ))
		{
			// 可動ウィンドウへ変更
			setAttr=1;
		}
		else
		{
			// 固定ウィンドウへ戻す
			setAttr=0;
		}

		document.body.setAttribute("data-ar-floating", setAttr);
		elm.setAttribute("data-ar-floating", setAttr);

		// カメラボタン
		var elmCam1 = document.getElementById("startcamera2");
		if ( elmCam1 ) elmCam1.setAttribute("data-ar-floating", setAttr);

		var elmCam2 = document.getElementById("stopcamera2");
		if ( elmCam2 ) elmCam2.setAttribute("data-ar-floating", setAttr);

		Tenken.GUI.ChecklistPage.dispMove=setAttr;
	}
}

// 点検を完了します。
// 未送信のデータがないかチェックし、なければデータとストレージを
// クリア後、初画面に戻ります。
Tenken.GUI.checkFinishTenken = function()
{
	// 未入力項目の送信許可のチェックボックスがチェックされている
	// 場合は、チェック解除の警告を表示
	var elmCheck=document.getElementById("content_1_noinput_check");
	if ( true == elmCheck.checked )
	{
		alert("「点検値未入力項目がある場合も送信許可」のチェックを解除後、再度実行してください。");
		return;
	}

	// 点検結果(各設備の項目全入力完了)が残っていないかチェック
	var submitButton = document.getElementById("content_1_submit");
	if(0 < submitButton["data-ar-inputcount"])
	{
		alert("未送信の点検結果が残っているため完了できません。\n(点検項目一部未入力も含みます)\n\n結果送信を行うか、入力済の点検項目値を全てクリアしてから再度実行してください。");
		return;
	}

	// 申し送り（新規登録)が残っていないかチェック
	if ( 0 < TenkenData.MsgEvent.Current.length )
	{
		alert("未送信の申し送り項目があります。\n\n申し送りの送信を行ってください。");
		return;
	}

	// 完了報告が残っていないかチェック
	var foundComp=0;
	for ( var i = 0 ; i < TenkenData.MsgEvent.Last.length ; i++ )
	{
		var msgevent=TenkenData.MsgEvent.Last[i];

		if ( "true" != msgevent.Enable && null != msgevent.Answer)
		{
			// １件でも完了報告が残っていれば中断する。
			foundComp=1;
			break;
		}
	}

	if ( 0 < foundComp )
	{
		alert("未送信の完了報告があります。\n\n完了報告の送信を行うか、完了報告の取り消しを行ってください。");
		return;
	}

	if( confirm("Finish inspection\n\nReturn initial screen?") == false)
	{
		return;
	}

	Tenken.GUI.FinishTenkenGoTop();

}

// Tenken.GUIの初期化処理
Tenken.GUI.initMainGUI = function()
{
	try {
	// ローカルストレージからデータを取得
	TenkenData.AllGet.loadStorage();

	// 選択シナリオID・シナリオ名を設定
	Tenken.config.ScenarioId=Tenken.Storage.ScenarioId.get();

	if ( null != Tenken.config.ScenarioId )
	{
		TenkenData.Scenario.setScenarioName(TenkenData.Scenario.getScenarioNameFromId(Tenken.config.ScenarioId));
	}

	// シーン名およびシーン名切り替えトグルの作成
	Tenken.GUI.createSceneToggle();

	}
	catch (e)
	{
		alert("Exception : Tenken.GUI.initMainGUI\n" + e);
	}
}
