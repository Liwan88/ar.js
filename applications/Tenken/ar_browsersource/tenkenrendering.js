/**
 * @overview JavaScript API (AR rendering) for Tenken Application
 * @copyright Copyright 2014 FUJITSU LIMITED
 */

/**
 * Namespace to supplement AR.Renderer
 */
Tenken.ARRendering = new function() {
	// Standard polygon (Square) and size (Scale) to display assets and messages.
	// Size changes per devices screen resolution. Default value is 0.5.
	var sizeX = 0.5;
	var sizeY = 0.5;
	var sizeZ = 0.5;

	/**
	 * Set attributes for AR.Renderer.AbstractElement.
	 * Refer to AR.Renderer.AbstractElement api document for parameters
	 * @param {AR.Renderer.AbstractElement} _elm Target AR.Renderer.AbstractElement
	 */
	function setAbstractElementProps(_elm, _id) {
		_elm.setId(_id);
	}

	/**
	 * Set attributes for AR.Renderer.AbstractNameElement.
	 * Refer to AR.Renderer.AbstractNameElement api document for parameters
	 * @param {AR.Renderer.AbstractNamedElement} _elm Target AR.Renderer.AbstractNamedElement
	 */
	function setAbstractNamedElementProps(_elm, _id, _name) {
		setAbstractElementProps(_elm, _id);
		_elm.setName(_name);
	}

	/**
	 * Set attributes for AR.Renderer.AbstractCoordinateSystem.
	 * Refer to AR.Renderer.AbstractCoordinateSystem api document for parameters
	 * @param {AR.Renderer.AbstractCoordinateSystem} _elm Target AR.Renderer.AbstractCoordinateSystem
	 */
	function setAbstractCoordinateSystemProps(_elm, _id, _name, _disabled, _detectAction) {
		setAbstractNamedElementProps(_elm, _id, _name, _disabled);
	}

	/**
	 * Set attributes for AR.Renderer.AbstractMarkerCoordinateSystem.
	 * Refer to AR.Renderer.AbstractMarkerCoordinateSystem api document for parameters
	 * @param {AR.Renderer.AbstractMarkerCoordinateSystem} _elm Target AR.Renderer.AbstractMarkerCoordinateSystem
	 */
	function setAbstractMarkerCoordinateSystemProps(_elm, _id, _name, _disabled, _detectAction) {
		setAbstractCoordinateSystemProps(_elm, _id, _name, _disabled, _detectAction);
	}

	/**
	 * Create and return AR.Render.Point object
 	 * Refer to AR.Renderer.Point api document for parameters
	 */
	function createPoint(_id, _x, _y, _z) {
		var elm = new AR.Renderer.Point();
		setAbstractElementProps(elm, _id);
		elm.setX(_x);
		elm.setY(_y);
		elm.setZ(_z);
		return elm;
	}

	/**
	 * Create and return AR.Render.Size object
 	 * Refer to AR.Renderer.Size api document for parameters
	 */
	function createSize(_id, _x, _y, _z) {
		var elm = new AR.Renderer.Size();
		setAbstractElementProps(elm, _id);
		elm.setWidth(_x);
		elm.setHeight(_y);
		elm.setDepth(_z);
		return elm;
	}

	/**
	 * Create and return AR.Render.URLAction object
 	 * Refer to AR.Renderer.URLAction api document for parameters
	 */
	function createURLAction(_id, _url) {
		var elm = new AR.Renderer.URLAction();
		setAbstractElementProps(elm, _id);
		elm.setSrc(_url);
		return elm;
	}

	/**
	 * Create and return AR.Render.DirectorAction object
 	 * Refer to AR.Renderer.DirectorAction api document for parameters
	 */

	function createDirectorAction(_id, _expression) {
		var elm = new AR.Renderer.ScriptAction();
		setAbstractElementProps(elm, _id);
		elm.setExpression(_expression);
		return elm;
	}

	/**
	 * Create and return AR.Render.FJARMarkerCoordinateSystem object
 	 * Refer to AR.Renderer.FJARMarkerCoordinateSystem api document for parameters
	 */
	function createFJARMarkerCoordinateSystem(_id, _name, _disabled, _detectAction, _value) {
		var elm = new AR.Renderer.FJARMarkerCoordinateSystem();
		setAbstractMarkerCoordinateSystemProps(elm, _id, _name, _disabled, _detectAction);
		elm.setValue(_value);
		return elm;
	}

	/**
	 * Create and return AR.Render.SuperimposedGraphic object
 	 * Refer to AR.Renderer.SuperimposedGraphic api document for parameters
	 */
	function createSuperimposedGraphic(_id, _name, _disabled, _translation, _rotation, _projectionType, _clickAction, _graphic, _line) {
		var elm = new AR.Renderer.SuperimposedGraphic();
		setAbstractNamedElementProps(elm, _id, _name, _disabled);
		elm.setTranslation(_translation);
		elm.setRotation(_rotation);
		elm.setProjectionType(_projectionType);
		elm.setTapAction(_clickAction);
		elm.setGraphic(_graphic);
		return elm;
	}

	function createSquare(_id, _scale, _color, _texture) {
		var elm = new AR.Renderer.SquareModelGraphic();
		elm.setScale(_scale);
		elm.setTexture(_texture);
		return elm;
	}

	/**
	 * Create and return AR.Render.Image object
 	 * Refer to AR.Renderer.Image api document for parameters
	 */
	function createImage(_id, _url, _size) {
		var elm = new AR.Renderer.ImageTexture();
		elm.setSrc(_url);
		return elm;
	}

	/**
	 * Create and return AR.Render.Text object
 	 * Refer to AR.Renderer.Text api document for parameters
	 */
	function createText(_id, _value, _fontSize, _color, _backgroundcolor, _wordWrap, _size) {
		var elm = new AR.Renderer.TextTexture();
		setAbstractElementProps(elm, _id);
		elm.setText(_value);
		elm.setFontSize(_fontSize);
		elm.setColor(_color);
		elm.setBackgroundColor(_backgroundcolor);
		elm.setWordWrap(_wordWrap);
//      Default charactor size
//		if ( true == _wordWrap && null != _size)
//		{
//			/* If word wrap is enabled, set size */
//			elm.setSize(_size);
//		}
		return elm;
	}

	var TRANSPARENT = 0x00000000;
	var RED = 0xFFCC0000;
	var BLUE = 0xFF1E90FF;
	var GREEN = 0xFF009900;
	var GRAY = 0xFF7A7D80;
	var DARKGRAY = 0xFF333333;
	var WHITE = 0xFFFFFFFF;
	var ORANGERED = 0xFFFF4500;
	var BORDERWIDTH = 3;
	var PADDING = 3;
	var FONTSIZE = 70;
	var SMALLFONTSIZE = 40;
	var BIGFONTSIZE = 100;

	function truncateString(_str, _len) {
		var str = "";
		if(null != _str) {
			str = _str.substr(0, _len); // Truncate by specified length...
			if(_len < _str.length) str = str.substr(0, _len -1) + "..."; // If shorter than original lengeth, append "..."
		}
		return str;
	}

	function createEZFJARMarkerCoordinateSystem(_markerId) {
		return createFJARMarkerCoordinateSystem(
			null/*_id*/,
			null/*_name*/,
			false/*_disabled*/,
			null/*_detectAction*/,
			_markerId/*_value*/);
	};

	function createEZSuperimposedGraphic(_name, _translation, _clickAction, _graphic) {
		return createSuperimposedGraphic(
			null/*_id*/,
			_name/*_name*/,
			false/*_disabled*/,
			_translation/*_translation*/,
			null/*_rotation*/,
			AR.Renderer.SuperimposedGraphic.ProjectionType.ORTHO2D/*_projectionType*/,
			_clickAction/*_clickAction*/,
			_graphic/*_graphic*/
			);
	};

	function createAssetNameGraphic(_name) {
		return createSquare(
			null,   /*_id*/
			createPoint(null,sizeX, sizeY, sizeZ),   /*_scale*/
            TRANSPARENT,   /*_color*/
				createText(
					null/*_id*/,
					truncateString(_name, 20)/*_value*/,
					75/*_fontSize*/,
					ORANGERED/*_color*/,
					TRANSPARENT/*_backgroundcolor*/,
					false/*_wordWrap*//*_graphic*/)/*_layouter*/,
					null /*_size*/
            );
	};

	function createMessageGraphic(_datetime, _operator, _message) {
		return createSquare(
			null,   /*_id*/
			createPoint(null, sizeX, sizeY, sizeZ),   /*_scale*/
            TRANSPARENT,   /*_color*/
					createText(
						null/*_id*/,
						truncateString(_message, 10)/*_value*/,
						FONTSIZE/*_fontSize*/,
						WHITE/*_color*/,
						GREEN/*_backgroundcolor*/,
						true/*_wordWrap*/,
						new AR.Renderer.Size() /*_size*/
						)
            )
	};

	function createCautionGraphic(_datetime, _operator, _message) {
		return createSquare(
			null,   /*_id*/
			createPoint(null, sizeX, sizeY, sizeZ),   /*_scale*/
            TRANSPARENT,   /*_color*/
					createText(
						null/*_id*/,
						truncateString(_message, 10)/*_value*/,
						FONTSIZE/*_fontSize*/,
						WHITE/*_color*/,
						RED/*_backgroundcolor*/,
						true/*_wordWrap*/,
						new AR.Renderer.Size() /*_size*/
						)
            )
	};

	/** Callback method for onError when deleting AR contents */
	contentsRemoveError = function(_result){
		var message = "ARコンテンツの削除に失敗しました。\n";
		var detail = _result.getStatus() + "\n"+ _result.getValue();
		Tenken.Util.logerr(message, detail);
	};

	/** Callback method for onError when appending AR overlay data */
	contenstPutError = function(_result){
		var message = "AR重畳表示定義データの追加に失敗しました。\n";
		var detail = _result.getStatus() + "\n"+ _result.getValue();
		Tenken.Util.logerr(message, detail);
	};

	/** Set scene ID and AR overlay data of selected marker ID to native device's view layer */
	this.createSuperimposedGraphics = function(_superimposedgraphics, _sceneId, _markerId){
		if(_superimposedgraphics[_sceneId] != null){ // If AR content data exists for selected scene ID
			if(_markerId == null){ // Set every AR overlay data if marker ID is not specified.
				for(marker in _superimposedgraphics[_sceneId]){
					// Set Marker ID after creating coordinate system of AR Marker
					var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
					coordinateSystem.setValue(parseInt(marker));
					try{
						// Delete AR contents of target Marker ID.
						// Set AR overlay data to native device's AR rendering layer
						AR.Renderer.put(coordinateSystem, _superimposedgraphics[_sceneId][parseInt(marker)], Tenken.Util.noop, contenstPutError);
					} catch (e){
						Tenken.Util.logerr(e);
					}
				}
			} else if(_superimposedgraphics[_sceneId][_markerId] != null) { // If AR overlay data exists for selected marker ID
				// Set Marker ID after creating coordinate system of AR Marker
				var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
				coordinateSystem.setValue(_markerId);
				try{
					// Delete AR contents of target Marker ID.
					// Set AR overlay data to native device's AR rendering layer
					AR.Renderer.put(coordinateSystem, _superimposedgraphics[_sceneId][_markerId], Tenken.Util.noop, contenstPutError);
				} catch (e){
					Tenken.Util.logerr(e);
				}
			}
		}
	};

  /**
   * Append Scene ID, AR overlay data of the marker ID, Asset name, and 
   * Messages to AR rendering layer.
   * @param {Object} _superimposedgraphics AR overlay data.
   * @param {Number} _sceneId Scene ID to register AR overlay data.
   * @param {Number} _markerId Marker ID to register AR overlay data.
   *                           Register entire marker ID if null is specified.
   * @param {Array} _assetlist Array to hold asset data.
   *                           Do not register any if null or array size is 0.
   * @param {Array} _msglists  Array to hold messages.
   *                           Do not register any if null or array size is 0.
   * @param {function} _funcTapActionAsset Triggered function when asset name is tapped.
   * @param {function} _funcTapActionMsg   Triggered function when message is tapped.
   * @return なし
   */
	this.createSuperimposedGraphicsAssetAndMsg = function(_superimposedgraphics, _sceneId, _markerId, _assetlist, _msglists, _funcTapActionAsset, _funcTapActionMsg)
	{
	try
	{
		// Get size of Message and Asset Name to overlay from screen resolution.
		// The range must be in 0.2 to 1.0
		var sX = window.screen.width;
		var sY = window.screen.height;
		sizeX = sX / 5120;
		sizeY = sY / 3200;
		if ( sizeX < 0.2 || sizeX > 1.0 ) sizeX = 0.5;
		if ( sizeY < 0.2 || sizeY > 1.0 ) sizeY = 0.5;
		sizeZ = sizeX;

		var coordsSyss = []; // Prepare variable to hold data. Scene#setCoordinateSystems() must be called after graphic content is created. If not empty coordinateSystem will be created.
		var graphicsS = [];

		// Overlay data of scenario and scene
		if ( null != _superimposedgraphics )
		{
			if(_superimposedgraphics[_sceneId] != null){ // If AR overlay data exists for selected scene ID
				if(_markerId == null){ // Set every AR overlay data if marker ID is not specified.
					for(marker in _superimposedgraphics[_sceneId]){
						// Set Marker ID after creating coordinate system of AR Marker
						var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
						coordinateSystem.setValue(parseInt(marker));
						graphicsS.push({markerid:parseInt(marker), graphics:_superimposedgraphics[_sceneId][parseInt(marker)]});
					}
				} else if(_superimposedgraphics[_sceneId][_markerId] != null) { // If AR overlay data exists for selected marker ID
					// Set Marker ID after creating coordinate system of AR Marker
					var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
					coordinateSystem.setValue(_markerId);
					graphicsS.push({markerid:_markerId, graphics:_superimposedgraphics[_sceneId][_markerId]});

				}
			}
		}

		// Assets
		if ( null != _assetlist )
		{
			for(var j = (_assetlist.length - 1); j >= 0; j--)
			{
				var asset = _assetlist[j];
				if( null == asset.markerid || 1 > asset.markerid) continue; // Do not show for invalid markerid

				var tmpgraphics = [];
				var found = 0;
				for(var k = 0; k < graphicsS.length; k++)
				{
					tmpgraphics = graphicsS[k].graphics;
					if ( asset.markerid == graphicsS[k].markerid )
					{
						found  = 1;
						break;
					}
				}
				if ( 0 != found )
				{
					var graphics = tmpgraphics;
				}
				else
				{
					var graphics = []; // This also. Placeholder.
					graphicsS.push({markerid:asset.markerid, graphics:graphics});
				}
				var funcAsset = _funcTapActionAsset + "(" + asset.markerid + ")";

				// graphic for asset name
				graphics.push(
					createEZSuperimposedGraphic(
						"asset"/*_name*/,
						createPoint(null/*_id*/, 0/*_x*/, -0.5/*_y*/, 0/*_z*/)/*_translation*/,
						createDirectorAction(/*_clickAction*/
								null/*_id*/,
								funcAsset/*_expression*/),
								createAssetNameGraphic(/*_graphic*/
									asset.assetname/*_name*/)
					)
				);
			}
		}

		// Messages
		if ( null != _msglists )
		{
			// Write from oldest so the newest is rendered on top.
			for(var i = (_msglists.length - 1); i >= 0; i--)
			{
				var msgs = _msglists[i];
				if(null == msgs) continue;
				// Write from oldest so the newest is rendered on top.
				for(var j = (msgs.length - 1); j >= 0; j--)
				{
					var msg = msgs[j];

					var tmpgraphics = [];
					var found = 0;
					for(var k = 0; k < graphicsS.length; k++)
					{
						tmpgraphics = graphicsS[k].graphics;
						if ( msg.markerid == graphicsS[k].markerid )
						{
							found  = 1;
							break;
						}
					}
					if ( 0 != found )
					{
						var graphics = tmpgraphics;
					}
					else
					{
						var graphics = []; // This also. Placeholder.
						graphicsS.push({markerid:msg.markerid, graphics:graphics});
					}

						var funcMsg = _funcTapActionMsg + "(" + ((null == msg.msgid) ? "null" : ("'" + msg.msgid + "'")) + ", " + msg.occurrencetime + ")";
					var level = msg.level;
					if(level < 9) {
						graphics.push(
							createEZSuperimposedGraphic(
								"message"/*_name*/,
								createPoint(null, msg.x, msg.y, msg.z)/*_translation*/,
								createDirectorAction(/*_clickAction*/
									null/*_id*/,
									funcMsg/*_expression*/), // 申し送り一覧を表示
								createMessageGraphic(/*_graphic*/
									new Tenken.DatetimeValue(msg.occurrencetime).toString()/*_datetime*/,
									msg.operator/*_operator*/,
									msg.title /*_message*/)
							)
						);
					}
					else {
						graphics.push(
							createEZSuperimposedGraphic(
								null,
								createPoint(null, msg.x, msg.y, msg.z)/*_translation*/,
								createDirectorAction(/*_clickAction*/
									null/*_id*/,
									funcMsg/*_expression*/), //Display message list
 								createCautionGraphic(/*_graphic*/
									new Tenken.DatetimeValue(msg.occurrencetime).toString()/*_datetime*/,
									msg.operator/*_operator*/,
									msg.title /*_message*/)
							)
						);
					}
				}
			}

		}

		var lenSG=0;
		for ( var i=0 ; i < graphicsS.length ; i++ )
		{
			if ( null != graphicsS[i].graphics )
			{
				lenSG += graphicsS[i].graphics.length
			}
		}
		if ( 100 < lenSG )
		{
			var strOver="Warning registering AR overlay data.\n\nYou can only display up to 100 AR overlay data in a single scene.\n";
		if ( null != _assetlist || null != _msglists )
		{
			strOver += "Also, asset name and message data per marker ID (Assets) is included for this count.\n";
		}
		strOver += "Please reduce diplay items by separating scenario or scene, reduce AR overlay data, hide asset names(Delete #TENKEN# from scene's detail column), or by sending comletion report to all messages\n";
		strOver += "\nRegisteration will proceed, but might not render correctly.\nCount=" + lenSG;

			alert(strOver);
		}

		// Registeration process
		for(var k = 0; k < graphicsS.length ; k++)
		{
			var graphics = graphicsS[k].graphics;

			var coordsSys = createEZFJARMarkerCoordinateSystem(graphicsS[k].markerid)
			if ( null != coordsSys )
			{
				var tmpGraphics = [];

				// Set AR overlay data into native device's AR rendering layer.
				AR.Renderer.put(coordsSys, Tenken.putEach(tmpGraphics, graphics, false), Tenken.Util.noop, contenstPutError );
			}
		}
	} catch (e){
		alert("Exception: createSuperimposedGraphicsAssetAndMsg \n" + e);
		Tenken.Util.logerr(e);
	}
	};

	/* Clear AR overlay display when pre-loading finishes successfully. */
	successPreload = function(_result)
	{
		// Clear AR overlay display
		AR.Renderer.clear(Tenken.Util.noop,Tenken.Util.noop);
	}

	/** Set pre-loading AR overlay data to native device's view layer */
	this.createSuperimposedGraphicsPreload = function(_superimposedgraphics)
	{
		if ( 0 < _superimposedgraphics.length )
		{
			// Set Marker ID (using hard coded 99 for dummy) after creating coordinate system of AR marker.
			var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
			coordinateSystem.setValue(99);
			try{
				// Set AR overlay data to native device's AR rendering layer.
				AR.Renderer.put(coordinateSystem, _superimposedgraphics, successPreload, contenstPutError);
			} catch (e){
				alert("Exception:createSuperimposedGraphicsPreload\n" + e);
				Tenken.Util.log(e);
			}
		}
	};

};
