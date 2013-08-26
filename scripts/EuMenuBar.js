var MenuItem = function (elIn, parentIn) {
	var self          = this;
	self.a            = elIn;
	self.el           = elIn.next('.section');
	//self.index        = indexIn;
	self.parent       = parentIn;
	
	self.doOpen = function () {
		alert("doOpen " + self.a.html() );
		var alreadyOpen = self.a.hasClass('active');
		
		self.parent.el.find('.menu-item').removeClass('active');
		self.parent.el.find('.section')  .removeClass('active');

		if(alreadyOpen){
			self.a .removeClass('active');
			self.el.removeClass('active');		
		}
		//if(alreadyOpen && self.a.css('display')=='block'){ // only allow hide on mobile view
		//	self.parent.selectionMade(false, false, false);
		//}
		else{
			self.a .addClass('active');
			self.el.addClass('active');
			self.parent.selectionMade(self.el.attr('id'), self.a.attr('href') );
		}
		//self.parent.resize();
	};

	self.doClose = function () {
		self.a .removeClass('active');
		self.el.removeClass('active');	
	}
	
	self.a.on('click', function (e) {
		if(typeof self.a.attr('href') == 'undefined'){
			e.preventDefault();
			self.doOpen();
		}
	});

	return {
		open : function (){
			self.doOpen();
		},
		setActive : function (){
			self.doOpen();
		},
		close :  function (){
			self.doClose();
		},
		getLabel : function(){
			return self.a.html();
		},
		getHref : function(){
			var href =  self.a.attr('href');
			return typeof href == 'undefined' ? false : href;
		},
		getSelf : function(){
			return self;
		},
		click : function(){
			console.log("expose the click");
			self.doOpen();
		}
	};
};
	

var EuMenuBar = function(elIn, recLevel, parent, callbackIn, hash){
	
	var self		 = this;
	self.parent      = parent;
	self.recLevel    = recLevel ? recLevel : 0;
	self.isRoot      = self.recLevel == 0;
	self.itemObjects = [];
	self.el			 = elIn;
	self.activeId	 = '';
	//self.activeIndex = '';
	self.activeHash	 = '';
	self.callback	 = callbackIn;
	self.subMenus    = [];	
	self.el.addClass('global-nav-menu-bar');
	
	// functions

	self.selectionMade = function(id, hash){
		
		self.activeId      = id;
		self.activeHash    = hash;

		self.showLess();
		
		if(self.callback){
			self.callback(id, hash);
		}
	};
	
	self.openItem = function(hash){
		alert("openItem");
		// programmatic open
		if(hash != self.activeHash){
			self.el.find('.menu-item').each(function (i, ob) {
				ob = $(ob);
				if( ob.attr('href') == hash ){
					self.itemObjects[i].open();
					return;
				}
			});					
		}
	};
	
	self.isPhone = function(){
		var phoneDiv = $('#phone-detect').length ? $('#phone-detect') : $('<div id="phone-detect" style="position:absolute;top:-1000px">').appendTo('body');
		var res = phoneDiv.width() == 1;
		console.log('isPhone = ' + res);
		return res;		
	};

	self.rowFits = function(){
		// get ref to active section
		var result       = true;
		var menuBar      = self.el;		
		var menuBarInner = menuBar.children('.menu-bar-inner');
		var active       = menuBarInner.children('.section.active');
		var borderHeight = 2;

		// limit row height to one 
		menuBar.addClass('measure-mode');
		active.removeClass('active');

		if(	menuBarInner[0].offsetHeight > menuBar.height() + borderHeight ){
			result = false;
		}
		
		// restore active and remove row height limit
		active.addClass('active');
		menuBar.removeClass('measure-mode');
		
		return result;
	};
	
	self.getItems = function(){
		return self.el.children('.menu-bar-inner').children('.menu-item');
	};
	
	self.getMoreItem = function(){
		return self.el.children('.menu-bar-inner').children('.more-item');
	};

	self.getBackItem = function(){
		return self.el.children('.menu-bar-inner').children('.back-item');
	};

	self.getMoreMenu = function(){
		return self.el.children('.menu-bar-inner').children('.more');
	};
	
	self.getSections = function(){
		return self.el.children('.menu-bar-inner').children('.section');
	};
	
	self.getParent = function(){
		return self.parent;			
	};
	
	self.getWidestItem = function(items){
		var max = 0;
		$.each(items, function(i, ob){
			var w = self.isRoot ? $(ob).width() : $(ob).outerWidth();
			w > max ? max = w : false;
		})
		console.log('widest item is ' + max);
		return max;
	}
	
	self.closeItems = function(){

		$.each(self.itemObjects, function(i, ob){
			ob.close();
		});
		
		$.each(self.subMenus, function(i, ob){
			ob.closeItems();
		});
	};
	
	self.showMore = function(e){
		// close other open menus
		self.closeItems();
		
		var holdWidth = self.el.width();
		
		self.getBackItem().css('display', self.isPhone() ? 'block' : 'none');
		self.getMoreItem().css('display', 'none');

		self.buildMore();
		self.getItems().css('display', 'none');
		
		self.el.css('width', holdWidth + 'px');
	};

	self.showLess = function(){
		// called on selectionMade as well as on click
		var displayClassItems = self.isPhone() ? 'block' : 'inline-block';
		
		self.getMoreMenu().css('display', 'none');
		self.getBackItem().css('display', 'none');
		//self.getMoreItem().css('display', 'none');
		self.getItems()   .css('display', displayClassItems);
		self.resize();
		$.each(self.subMenus, function(i, ob){
			ob.showLess();
		});
	};
	
	self.goBack = function(e){
		$(e.target).closest('.section').prev('a').click();
		var menuBar = self;
		while(typeof menuBar != 'undefined'){
			menuBar.resize();
			menuBar = menuBar.getParent();
		}
	};
	
	self.buildMore = function(){
		var maxRows     = 3;
		var items       = self.getItems();
		var colW        = self.getWidestItem(items) + 24 ; // should include more button in this test
		var cmpW        = self.el.width()           - 24;
		
		console.log("will build more menu assuming width of " + cmpW + " px, widest is " + colW );
		
		var cols        = Math.max(parseInt(cmpW / colW), 1);
		var rows        = Math.ceil(items.length / cols); 
		var evenMore    = rows > maxRows;
		
		console.log("Make " + rows + " rows / " + cols + " cols from " + items.length + " items,  evenMore = " + evenMore);
		
		var moreMenu = self.getMoreMenu();
		
		moreMenu.css('display', 'block').empty();
		
		var itemsAdded = 0;
		
		var spacersNeeded  = cols-1;
		var spacerPct      = 5;
		var spacerTotalPct = spacersNeeded * spacerPct;
		var maxOnRow       = rows; 
		    
		/**
		 * maxOnRow: used to avoid the situation where 6 items over 4 cols appears like this:
		 * 
		 * [x][x][x][ ]
		 * [x][x][x][ ]
		 * 
		 * instead of this:
		 * 
 		 * [x][x][x][x]
		 * [x][x][ ][ ]
		 * 
		 * */
		
		for(var i=0; i<cols; i++){
			
			var col = $('<div class="more-col" style="' + (((i+1)<cols) ? 'margin-right:' + spacerPct + '%; ' : '') + 'width:' + parseInt(  (100 - spacerTotalPct) /cols) + '%">').appendTo(moreMenu);
			
			for(var j=0; j<rows; j++){
				if(j < maxOnRow){
					if(itemsAdded<items.length){
						var proxyItem = $('<a class="more-menu-item">' + self.itemObjects[itemsAdded].getLabel() + '</a>').appendTo(col);
						var context = function(){
							var index = itemsAdded;
							proxyItem.click(function(e){
								//moreMenu.css('display', 'none');
								self.itemObjects[index].click(e);
							});						
						}();		
						itemsAdded++;
					}
				}
				else{
					// TODO: set aria hidden for these non-functional spacer links
					$('<a class="more-menu-item">&nbsp;</a>').appendTo(col);				
				}
			}
			
			if(i<cols-1){
				maxOnRow = Math.ceil((items.length - itemsAdded) / (cols - (i+1)));				
			}
		}
	};

	/*
	self.openTabAtIndex = function(i){
		alert("openTabAtIndex");
		if(self.itemObjects[i]){
			self.itemObjects[i].openTab();			
		}
		else{
			console.log("no such tab: " + i);
		}
	};*/
	
	// end functions

	self.getMoreItem().click(self.showMore);
	self.getBackItem().click(self.goBack);
	
	
	self.getItems().each(function (i, ob) {
		self.itemObjects[self.itemObjects.length] = new MenuItem($(ob), self);
	});

	self.getSections().each(function (i, ob) {
		var subMenu = $(ob).children('.global-nav-menu-bar');
		if(subMenu.length){
			self.subMenus.push(new EuMenuBar(subMenu, self.recLevel + 1, self));
			console.log('pushed sub');
		}
	});

	/*
	if (self.itemObjects.length>0) {
		setTimeout(function(){
			if(hash){
				self.openTab(hash);
			}
			else{
				self.openTabAtIndex(0);				
			}
		}, 1);
	}
	*/
	self.hideInactive = function(){
			
		var show = ( self.isRoot || self.el.closest('.section').hasClass('active') ) && self.el.find('.section.active').length == 0;
		if(!show){
			self.getItems().css('display', 'none');
		}
		$.each(self.subMenus, function(i, ob){
			ob.hideInactive();
		});
	};

	self.findActiveLeaf = function(href, topScore, matches){
		
		var url      = href.split('/').pop();
		var topScore = topScore ? topScore : 0;
		var matches  = matches ? matches : [];

		var compareUrls = function(url1, url2){
			
			url1 = url1.replace('../', '');
			url2 = url2.replace('../', '');
			
			if(url2.replace('../', '').split('/').length==1){
				var stem = url1.split('/');
				//stem = stem.pop();
				stem.pop();
				if(url2.indexOf('../')>-1){
					stem.pop();					
				}
				
				stem = stem.join('/');
				url2 = stem + '/' + url2;//url2.split('/')[0];
			}
			console.log("compareUrls " + url1 + " and " + url2);
			
			
			var score = 0;
			var segments1 = url1.split('/');
			var segments2 = url2.split('/');
			
			while(segments1.length && segments2.length && segments1.pop() == segments2.pop()){
				score++;
			}
			return score;
		};

/*
		var test = compareUrls("http://am/test/the/url/equivalence.html", "http://andy/test/the/url/equivalence.html");

		var x1 = "http://am/test/the/url/equivalence.html";
		var x2 = x1.split('/');
		x2.pop();
		
	//	alert(x1 + " -> " + x2.join('/')  );

		if(test > topScore){
			topScore = test;
			matches = ["yp"];
			console.log("set matches (1) to " + JSON.stringify(matches) + ", score was " + test)
		}
		else if(test == topScore){
			matches.push("x");
		}
	*/	
		var getMatch = function(ob, href, itemHref, isMenu){
			var test = compareUrls(href, itemHref);
			
			console.log("test: " + test);

			if(test > topScore){
				
				console.log("test: " + test + " > " + topScore);

				topScore = test;
				matches = [isMenu ? ob : ob.getSelf()];// [itemHref];
				console.log("set matches (2) to " + JSON.stringify(matches) + ", score was " + test)

			}
			else if(test == topScore){
				matches.push(isMenu ? ob : ob.getSelf());
			} 			
		};
		
		var getMatches = function(menu){
			var menuHref = self.el.attr('href');
			if(typeof menuHref != 'undefined'){
				getMatch(self, href, menuHref, true);
			}
			$.each(menu.getItemObjects(), function(i, ob){
				var itemHref = ob.getHref();
				if(itemHref){
					getMatch(ob, href, itemHref);
				}
			});			
			$.each(self.subMenus, function(i, ob){
				ob.findActiveLeaf(href, topScore, matches);
			});
			
		};
		
		getMatches(self);
		
		//$.each(self.subMenus, function(i, ob){
		//	getMatches(ob);
		//});
		
		if(self.isRoot){
			alert("top score " + topScore + ", winner count = " + matches.length);
		    	
//			matches[0].setActive();
			matches[0].doOpen();
	   // 	$.each(matches, function(){
   		    	//alert( activeLeaf.doOpen  );   		    		
	    //	});
		}
		//else{			
		//	return matches;
		//}
		
	},
	
	self.getItemObjects = function(){
		return self.itemObjects;
	},

	self.resize = function(){
		
		if(!self.el.is(':visible')){
			return;
		}
		
		var isPhone      = self.isPhone();
		var displayClass = isPhone ? 'block' : 'inline-block';
		var menuBack     = self.getBackItem();
		var menuBarMore  = self.getMoreItem();
		var menuBarItems = self.getItems();
		var moreMenu     = self.getMoreMenu()
		
		self.el.css('width', 'auto');

		var showingMore = isPhone ? false : moreMenu.is(":visible");
		
		console.log("showingMore = " + showingMore + ", isPhone = " + isPhone);
		
		var naturalWidth = 0;

		if(isPhone){
		
			var showBack = !self.isRoot && self.el.find('.section.active').length == 0;
			if(showBack){
				menuBack.css('display', 'block');
			}			

			menuBarItems.css('display', displayClass);
			moreMenu    .css('display', 'none');
			menuBarMore .css('display', 'none');

			// hide everything that isn't at the bottom of the active chain
			self.hideInactive();
		}
		else{
			moreMenu    .css('display', 'none');
			menuBarMore .css('display', 'none');
			menuBack    .css('display', 'none');			
			menuBarItems.css('display', displayClass);

			
			if(!self.rowFits()){
				
				menuBarMore.css('display', displayClass);
				menuBarItems.css('display', 'none');
				
				$.each(menuBarItems, function(i, ob){
					$(ob).css('display', displayClass);
					
					if(!self.rowFits()){
						$(ob).css('display', 'none');
						console.log('hide ' + $(ob).html() );
						return false;
					}
				});
				
				naturalWidth = self.el.width();
				console.log("naturalWidth = " + naturalWidth);
				
				if(showingMore){
					self.showMore();
				}
				else{
					menuBarMore.css('display', displayClass);
					menuBack   .css('display', 'none');
				}
			}
		}
		
		$.each(self.subMenus, function(i, ob){
			ob.resize();
		});	
	};
	
	setTimeout(self.resize, 1);
		
	return {
		//getOpenTabId : function () {
		//	return self.activeId;
		//},
		//getOpenTabIndex : function () {
		//	return self.activeIndex;
		//},
		openItem : function(hash){
			console.log("exposed openTab");
			self.openItem(hash);
		},
		//openTabAtIndex : function(i){
		//	self.openTabAtIndex(i);
		//},
		
		getItemObjects : function(){
			return self.itemObjects;
		},
		closeItems : function(){
			self.closeItems();
		},
		showLess : function(){
			self.showLess();
		},
		hideInactive : function(){
			self.hideInactive();
		},
		getParent : function(){
			// TODO: delete - not needed as the resize-on-parent can be used on self.parent without recurse
			return self.getParent();
		},
		findActiveLeaf : function(href, topScore, matches){
			return self.findActiveLeaf(href, topScore, matches);
	    },
		getSelf : function(){
			return self;
	    },
		setActive : function(){
			alert("active!");
	    },
		resize : function(){
			self.resize();
		}
	};
};		