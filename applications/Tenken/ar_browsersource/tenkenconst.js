/**
 * @overview Configuration parameters for Tenken
 * @copyright Copyright 2014 FUJITSU LIMITED
 */

var TenkenConst = {};

// HTML file name for each pages in Tenken

TenkenConst.PageName =
{
	top				:"index.html",     // Initial screen
	pre				:"pre.html",       // Selection of operators screen
	main			:"main.html"       // Main screen
}

// Table name of AR Server for operator information
// (Includes Scenario, Scene, and AR overlay data)
TenkenConst.TableName =
{
	asset				:"asset",             // Equipment definition table
	tenkenevent			:"tenkenevent",       // Check result table
	tenkentable			:"tenkentable",       // Check list definition table
	messageevent		:"messageevent",      // Messages table
	userdata			:"userdata",          // operator management table
	scenario			:"arscn_scenario",    // Scenario management table
	scene				:"arsen_scene",       // Scene management table
	SuperimposedGraphic	:"arpoiarmk_default"  // AR overlay data table 
};

// Name of the Web Storage (local storage) to store data
TenkenConst.StorageName =
{
	// table
	asset				: "ARtenken_asset",           // Equipment definition table
	tenkentable			: "ARtenken_tenkentable",     // Check result table
	username			: "ARtenken_userdata",        // operator management table
	scenario			: "ARtenken_scenario",        // Scenario management table
	scene				: "ARtenken_scene",           // Scene management table
	SuperimposedGraphic	: "ARtenken_arcontens",       // AR overlay data table 
	lastTenkenEvent		: "ARtenken_tenkeneventlast", // Check result table (previous)
	lastMessageEvent	: "ARtenken_messageeventlast",// Check result table (current)
	currentTenkenEevnt	: "ARtenken_tenkeneventcurrent",  // Messages table (previous)
	currentMessageEvent	: "ARtenken_messageeventcurrent", // Messages table (current)

	// outside table
	startDatatime		: "ARtenken_STARTDATETIME",   // Date and Time when check started
	operator			: "ARtenken_OPERATOR",        // operator name
	OperationMode		: "ARtenken_OPERATIONMODE",   // AR server communication mode
	DownloadScenario	: "ARtenken_DOWNLOADSCENARIO",// Date and Time of scenario download
	DownloadDate		: "ARtenken_DOWNLOADDATE",    // Date and time of data download (except for scenario)
	ScenarioName		: "ARtenken_SCENARIO_NAME",   // Selected Scenario name
	ScenarioId			: "ARtenken_SCENARIOID",      // Selected Scenario ID
	SceneNames			: "ARtenken_SCENE_NAMES",     // Scene list of selected scenario
};

