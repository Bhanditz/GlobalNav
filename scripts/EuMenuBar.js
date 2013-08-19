		var MenuItem = function (elIn, parentIn, indexIn) {
			var self          = this;
			self.a            = elIn;
			self.el           = elIn.next('.section');
			self.index        = indexIn;
			self.parent       = parentIn;

			self.doOpen = function () {
				
				var alreadyOpen = self.a.hasClass('active');
				
				self.parent.el.find('.menu-item').removeClass('active');
				self.parent.el.find('.section').removeClass('active');

				if(alreadyOpen && self.a.css('display')=='block'){ // only allow hide on mobile view
					self.parent.selectionMade(false, false, false);
				}
				else{
					self.a .addClass('active');
					self.el.addClass('active');
					self.parent.selectionMade(self.index, self.el.attr('id'), self.a.attr('href') );
				}
			};

			self.a.on('click', function (e) {
				e.preventDefault();
				self.doOpen();
			});

			return {
				openTab : function (){
					self.doOpen();
				},
				getTabContent : function(){
					return self.el;
				}
			};
		};
			

		var MenuBar = function(elIn, callbackIn, hash){
			var self		= this;
			var allTabs		= [];
			
			self.el			 = elIn;
			self.activeId	 = '';
			self.activeIndex = '';
			self.activeHash	 = '';
			self.callback	 = callbackIn;
			self.subMenus    = [];	
			self.el.addClass('global-nav-menu-bar');
			
			// functions

			self.selectionMade = function(index, id, hash){
				self.activeId      = id;
				self.activeIndex   = index;
				self.activeHash    = hash;
				if(self.callback){
					self.callback(index, id, hash);
				}
			};
			
			self.openTab = function(hash){
					
				// programmatic open
				if(hash != self.activeHash){
					self.el.find('.menu-item').each(function (i, ob) {
						ob = $(ob);
						if( ob.attr('href') == hash ){
							allTabs[i].openTab();
							return;
						}
					});					
				}				
			};
			
			self.rowFits = function(){
				// get ref to active section
				var result       = true;
				var menuBar      = self.el;// $('.global-nav-menu-bar');
				
				//alert(self.el.html())
				
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
				console.log("result " + result );//+ ", active. = " + active.html());
				return result;
			}
			
			self.getItems = function(){
				var res = self.el.children('.menu-bar-inner').children('.menu-item');
				return res;
			}
			
			self.getMoreItem = function(){
				var res = self.el.children('.menu-bar-inner').children('.more-item');
				return res
			}

			self.getSections = function(){
				var res = self.el.children('.menu-bar-inner').children('.section');
				return res;
			}
			
			self.getWidestItem = function(items){
				var max = 0;
				$.each(items, function(i, ob){
					var w = $(ob).width();
					w > max ? max = w : false;
				})
				console.log('widest item is ' + max);
				return max;
			}
			
			self.clickMore = function(e){
				self.buildMore();
			}
			
			// returns the re-usable div for more menu
			self.getMoreMenu = function(){
				var res = self.el.children('.menu-bar-inner').children('.more');
				return res;
			}
			
			self.buildMore = function(){
				var maxRows  = 3;
				var items    = self.getItems();
				var colW     = self.getWidestItem(items); // should include more button in this test
				var cmpW     = $('body').width();
				var cols     = parseInt(cmpW / colW);
				var rows     = Math.ceil(items.length / cols); 
				var evenMore = rows > maxRows;
				
				console.log("Make " + rows + " rows / " + cols + " cols from " + items.length + " items,  evenMore = " + evenMore);
				
				self.getMoreMenu().css('display', 'block');
				
				//self.items.css('display', 'none');
				
			}

			self.openTabAtIndex = function(i){
				if(allTabs[i]){
					allTabs[i].openTab();			
				}
				else{
					console.log("no such tab: " + i);
				}
			};
			
			// end functions

			self.getMoreItem().click(self.clickMore);

			self.getItems().each(function (i, ob) {
				allTabs[allTabs.length] = new MenuItem($(ob), self, i);
			});

			self.getSections().each(function (i, ob) {
				var subMenu = $(ob).children('.global-nav-menu-bar');
				if(subMenu.length){
					//alert("create child");
					self.subMenus.push(new MenuBar(subMenu));
					console.log('pushed sub');
				}
			});

			
			if (allTabs.length>0) {
				setTimeout(function(){
					if(hash){
						self.openTab(hash);
					}
					else{
						self.openTabAtIndex(0);				
					}
				}, 1);
			}
			
			self.resize = function(){
				var menuBar      = self.el;;
				//var menuBar      = $(rootMenu[0]);
			
				var menuBarMore  = self.getMoreItem();
				var menuBarItems = self.getItems();
				
				menuBarMore.css('display', 'none');
				menuBarItems.css('display', 'inline-block');
				//alert("call fits()");
				var fits = self.rowFits();
		
				console.log("Row fits? " + fits);
		
				if(!fits){
					menuBarMore.css('display', 'inline-block');
					console.log("show menuBarMore   " +  menuBarMore.html() );
		
					menuBarItems.css('display', 'none');
					
					$.each(menuBarItems, function(i, ob){
						$(ob).css('display', 'inline-block');
						
						if(!self.rowFits()){
							$(ob).css('display', 'none');
							console.log('hide ' + $(ob).html() );
							return false;
						}
						
					});
				}

				console.log("self.subMenus.length =  " + self.subMenus.length);

				$.each(self.subMenus, function(i, ob){
					console.log("we have a submenu to resize....");
					ob.resize();
				});	
			}
			setTimeout(self.resize, 1);
				
			return {
				getOpenTabId : function () {
					return self.activeId;
				},
				getOpenTabIndex : function () {
					return self.activeIndex;
				},
				openTab : function(hash){
					console.log("exposed openTab");
					self.openTab(hash);
				},
				openTabAtIndex : function(i){
					self.openTabAtIndex(i);
				},
				getTabs : function(){
					return allTabs;
				},
				resize : function(){
					self.resize();
				}
			};
		};		