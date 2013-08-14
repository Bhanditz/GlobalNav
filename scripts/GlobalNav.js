var globalNav = function(){
    
	var locale = window.location.href.match(/([?&])locale=[a-z]{2}/);
	locale = locale && locale.length ? locale[0].split('=')[1] : 'en';

    var topBar         = false;
    var topBarSections = [];

    // load all css
    var initCSS = function(config){
    	$.each(config.stylesheets, function(i, stylesheet){
        	$('head').append('<link rel="stylesheet" href="' + stylesheet + '"/>');    		
    	});
    };
    
    var initHtml = function(config){
    	var url = window.location.href.split('/').pop();
    	var nav = $('<nav class="eu-global-nav container">').prependTo('body');

    	var divider = function(){return '<li class="divider">&nbsp;</li>'};

	        
        var topBar      = $('<section class="top-bar-section">').appendTo(nav);
        
    	// Europeana logo
        /*
    	topBar.append(
             '<ul class="logo">'
          +    '<li class="hide-on-phones">'
          +      '<a href="#">a</a>'
          +    '</li>'
          +    '<li class="show-on-phones menu-icon"><a href="#"><span></span></a></li>'
          + '</ul>'
        );
        */
        
    	// Left - Right floats

        var topBarLeft  = $('<ul class="left">').appendTo(topBar);
        var topBarRight = $('<ul class="right">').appendTo(topBar);

        
        
       
        // TODO: remove type and use conf.type
        
		var buildMenu = function(cmp, conf, type, recursions){
			
			var menu = cmp;
			
	        menu = $('<li class="eu-global-menu ' + type + (recursions==0 ? '' : ' item submenu') + '">').appendTo(cmp);
			
	        if(type == "globalmenu"){
	      	 	menu.append(
      	 			'<span class="icon-logo" style="color:white;"></span>' +
      	 			'<ul title="Europeana"></ul>'
	      	 	);
	        }
	        else if(conf.title){
	      	 	menu.append('<span class="menu-label hide-on-phones"> ' + conf.title[locale] + '</span>'
	      	 			+	'<span class="icon-arrow-3 open-menu hide-on-phones"></span>'
	      	 			+	'<span id="mobile-menu" class="icon-mobilemenu show-on-phones"></span>'
	      	 			+	'<ul title="' + conf.title[locale] + '"></ul>');
	        }
        	else{
	      	 	menu.append('<ul></ul>');
	      	 	menu.addClass('active');
	        }
      	 	menu = menu.children('ul');
			
      	 	
        	$(conf.items).each(function(i, ob){

        		//console.log("compare " + val.href  + " with " +  url );
    			//linkClass = (val.href == url) ? ' class="active"' : '';
    	        //topBarLeft.append('<li><a ' + linkClass + ' href="' + val.href + '">' + val.label + '</a></li>');

        		
        		if(ob.type == "item"){
	        		menu.append('<li class="item"><a href="' + (ob.url ? ob.url : '#') + '" class="' + ob.value + '">' + ob.label[locale] + '</a></li>');
        		}
        		else if(ob.type == "submenu" || ob.type == "globalmenu" || ob.type == "submenu"){
        			
        			buildMenu(menu, ob, ob.type == "globalmenu" ? "globalmenu" : type, recursions +1 );
        		}
        		
        	});			
		};

		// Left
		
		$.each(config.row1.left, function(key, val) {
			
	        if(typeof val == 'object'){
	        	if(val.type == "hMenu"){
	        		buildMenu(topBarLeft, val, "hMenu", 0);
	        	}
	        	/*
	        	else{
	        		
	        		console.log("compare " + val.href  + " with " +  url );
	        		
	    			linkClass = (val.href == url) ? ' class="active"' : '';
	    	        topBarLeft.append('<li><a ' + linkClass + ' href="' + val.href + '">' + val.label + '</a></li>');

	        	}
	        	*/

	        }
	        
	    //    topBarLeft.append(divider());
		});

		// Right
		
		$.each(config.row1.right, function(key, val){
			
			topBarRight.append(divider());
			
	        if(typeof val == 'string'){
	        	topBarRight.append('<li><a href="#">' + val + '</a></li>');		        	
	        }
	        else if(typeof val == 'object'){
	        	buildMenu(topBarRight, val, "vMenu", 0);
	        }
		});
		
    };
    
    var initJS = function(config){
    	
    	var recursiveLoad = function(index){
    		    		
 		   if(config.scripts[index]){
 	          $.getScript(config.scripts[index], function(){
            	recursiveLoad(index + 1);        		   
 	          }).fail(function(jqxhr, settings, exception) {
 	        	console.log( "Error: " + exception );
 	          });
 		   }
       	   else{
       		   var menuConfig = {
       				/*
					"fn_init": function(self){
					}
					,"fn_item":function(self, selected){
						//alert("fn_item");
					}
					*/
				};
       		    $('.eu-global-menu').each(function(){
       		    	new EuGlobalMenu($(this), menuConfig).init();
       		    })
       	   }
    	};
    	recursiveLoad(0);   	
    }
    
    return {
    	init: function(data){
  		  initCSS(data.css);
          initHtml(data.html);
          initJS(data.js);
    	},
        load:function(configUrl){
        	$(document).ready(function(){

        		$.getJSON(configUrl + "?callback=?")
	        		.fail(
	        		    function(e){
	              		   // console.log( "Config error [" + configUrl + "]: " + e.statusText + "  " + JSON.stringify(e) );
	        		    }
	        		);
        	});
        }
    }
}();

