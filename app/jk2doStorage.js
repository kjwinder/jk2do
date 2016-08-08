angular.module('jk2do').service('jk2doStorage', function($q) {
	var self = this;
	this.tasks = [];
	this.categories = [];
	this.alarms = [];
	this.projects = [];
	this.todoGroups = [];
	
	this.cfg = { lastId: { } }; //App config options
	
	this.findAll = function(callback) {
		var newLoadingSuccess = false, firstRun = false, audit = {}, cfg = {}, lastIndex = {};
		chrome.storage.sync.get('jk2do_cfg', function(keys) {
			
			console.log('jk2do_cfg keys:',keys);
			if (keys.hasOwnProperty('jk2do_cfg') === false) {
				//No data found - Initialize App data
				firstRun = true;
				self.initAppData();
			} else {
				cfg = keys.jk2do_cfg;
				if (cfg.hasOwnProperty('localStorageContainers') === false) {
					cfg['localStorageContainers'] = { "Tasks": 1, "Projects": 1, "Alarms": 1, "Categories": 1, "TodoGroups": 1 };
				}
				self.cfg = cfg;				
			}
			//Verify unique indices across all Objects
			angular.forEach(cfg['localStorageContainers'], function(containerCnt, containerName) {
				var objects = [], finalName = containerName, partialName = 'jk2do_' + containerName;
				var firstChar = containerName.charCodeAt(0);
				if (firstChar <= 90 && firstChar >= 65) { //Convert capital first to lowercase
					finalName = String.fromCharCode(containerName.charCodeAt(0) + 32);
					finalName += containerName.substr(1);//  containerName.strtolower();
				}
				console.log('____________ STARTING PARTIALNAME='+partialName+',finalName='+finalName);
				lastIndex[finalName] = { first: 0, last: 0 };
				for (var i = 0; i < containerCnt; i++) {
					var fullName = partialName + (i > 0 ? ''+(i+1) : '');
					console.log('fetching localStorageContainer fullname='+fullName);
					chrome.storage.sync.get(fullName, function(keys) { //Fetch each data Storage 
						if (keys.hasOwnProperty(fullName) && angular.isArray(keys[fullName])) {
							console.log('auditing fullName='+fullName);
							audit[fullName] = self.duplicateIndexCheck(keys[fullName], 'id', true, objects);							
							console.log('done auditing fullName='+fullName+', new length='+ objects.length +' at '+ new Date().toISOString());
						} else {
							console.log('ERROR localStorageContainers: prop='+fullName+' not found in keys:',keys);
						}
					});
				}
				
				console.log('scope finalName='+finalName + ' at ' + new Date().toISOString());
				
				if (self.hasOwnProperty(finalName) === true) {
					self[finalName] = objects;
				}
				
			});
			
			console.log(audit);
			
		});
		
		if (firstRun === true) {
			if (typeof callback == "function") {
				console.log('FIRING CALLBACK!');
				callback(self.tasks, self.categories, self.alarms, self.projects, self.todoGroups); //Return data to main Ctrl
				this.dbg(); //dbg
			}
			return true;
		}
		

		
		/* Old manual key fetch/walk::DELENDA
		chrome.storage.sync.get('jk2do_Tasks', function(keys) {
			var tasksAudit = {};
			console.log('jk2do_Tasks keys:',keys);
			if (keys.hasOwnProperty('jk2do_Tasks')) {
				
				self.tasks = keys.jk2do_Tasks;
			} else {
				self.tasks = [];
			}
		});
		
		chrome.storage.sync.get('jk2do_Categories', function(keys) {
			console.log('jk2do_Categories keys:',keys);
			self.categories = keys.jk2do_Categories || [];
		});
		
		chrome.storage.sync.get('jk2do_Alarms', function(keys) {
			console.log('jk2do_Alarms keys:',keys);
			self.alarms = keys.jk2do_Alarms || [];
		});
		
		chrome.storage.sync.get('jk2do_Projects', function(keys) {
			console.log('jk2do_Projects keys:',keys);
			self.projects = keys.jk2do_Projects || [];
		});
		
		chrome.storage.sync.get('jk2do_TodoGroups', function(keys) {
			console.log('jk2do_TodoGroups keys:',keys);
			self.todoGroups = keys.jk2do_TodoGroups || [];
		});
		*/
		
		/*
		if (self.tasks.length > 0 || self.categories.length > 0 || self.projects.length > 0) {
			newLoadingSuccess = true;
		}
		
		if (newLoadingSuccess === true) {
			console.log('NEW LOADING SUCCESS! skipping old keys/loading...');
			if (typeof callback == "function") {
				console.log('FIRING CALLBACK!');
				callback(self.tasks, self.categories, self.alarms, self.projects, self.todoGroups); //Return data to main Ctrl
				this.dbg(); //dbg
			} else {
				console.log('no callback or not a function:', callback);
			}
			return true;
		} else {
			console.log('failed newLoadingSuccess');
			console.log('T:'+self.tasks.length +',C:'+self.categories.length + ',P:'+self.projects.length);
			
			if (typeof callback == "function") {
				console.log('FIRING CALLBACK!');
				callback(self.tasks, self.categories, self.alarms, self.projects, self.todoGroups); //Return data to main Ctrl
				this.dbg(); //dbg
			}
			return true;
			
		}
		*/
		
		
		/*
		chrome.storage.sync.get('jk2do', function(keys) {
			console.log('Sync keys:', keys);
			
			if (keys.hasOwnProperty("jk2do") === false) {
				//No data found - Initialize App data
				self.initAppData();
			} else {
				//Walk each stored item - a JSON object containing (only) tasks, categories, etc per object
				//var objCfg;
				var objIds, duplicateObjs, tasksParse, categoriesParse, projectsParse, alarmsParse, todoGroupsParse;
				for (var i = 0; i < keys.jk2do.length; i++) {
					var obj = keys.jk2do[i];
					var objCfg; //_defaultConfig variables in jk2do.js
					var cat;
					if (obj.hasOwnProperty('tasks')) {
						tasksParse = self.duplicateIndexCheck(obj.tasks, 'id', true);
						console.log('tasksParse FINAL:');
						console.log(tasksParse);
						if (tasksParse !== false && tasksParse.objIds.length === obj.tasks.length && tasksParse.duplicateObjs.length === 0) {
							self.tasks = obj.tasks;
						} else {
							//TODO resolve
							if (tasksParse.duplicateObjs.length > 0) {
								var lastId;
								duplicateObjs = tasksParse.duplicateObjs;
								objIds = tasksParse.objIds;
								lastId = objIds[objIds.length - 1] || 0;
								console.log('before duplicateObjs fix, lastId='+lastId);
								for (var i=0; i < duplicateObjs.length; i++) {
									var thisObj = duplicateObjs[i];
									console.log('FIXING ID on thisObj:',thisObj);
									lastId++;
									thisObj.id = lastId;
								}
								self.tasks = obj.tasks;
							}
						}
					}
					if (obj.hasOwnProperty('categories')) {
						self.categories = obj.categories;
					}
					if (obj.hasOwnProperty('alarms')) {
						self.alarms = obj.alarms;
					}
					if (obj.hasOwnProperty('projects')) {
						self.projects = obj.projects;
					}
					if (obj.hasOwnProperty('todoGroups')) {
						self.todoGroups = obj.todoGroups;
					}
				}
			}
			
			if (typeof callback == "function")
				callback(self.tasks, self.categories, self.alarms, self.projects, self.todoGroups); //Return data to Ctrl
			
		});
		this.dbg();
		*/
	}
	
	this.saveAll = function() {
		//Save data to chrome.storage
		
		//Remove _jkCfg property from all objects
		var tasks = angular.copy(this.tasks);
		var categories = angular.copy(this.categories);
		var alarms = angular.copy(this.alarms);
		var projects = angular.copy(this.projects);
		var todoGroups = angular.copy(this.todoGroups);
		var cfg = angular.copy(this.cfg);
		angular.forEach([tasks, categories, alarms, projects, todoGroups], function(objs) {
			angular.forEach(objs, function(obj) {
				if (obj.hasOwnProperty('_jkCfg')) {
					delete obj['_jkCfg'];
				}
			});
		});
		
		console.log('Storage.sync SAVE, final vals:');
		console.log(tasks);
		console.log(categories);
		console.log(alarms);
		console.log(projects);
		console.log(todoGroups);
		
		chrome.storage.sync.set({jk2do: [{tasks: tasks}, {categories: categories}, {alarms: alarms}, {projects: projects}, {todoGroups: todoGroups}]}, function() {
		//chrome.storage.sync.set({jk2do: [{tasks: this.data}, {categories: this.categories}, {alarms: this.alarms}]}, function() {
			console.log('...data saved in local storage at ' + new Date().toTimeString());
		});
		
		//Save each Object under its own storage key - Allows for more storage room with 8KB per storage key
		chrome.storage.sync.set({jk2do_cfg: cfg}, function() {
			console.log('CFG saved tasks to jk2do_cfg at ' + new Date().toTimeString());
		});
		
		chrome.storage.sync.set({jk2do_Tasks: tasks}, function() {
			console.log('saved tasks to jk2do_Tasks at ' + new Date().toTimeString());
		});
		
		chrome.storage.sync.set({jk2do_Categories: categories}, function() {
			console.log('saved to jk2do_Categories at ' + new Date().toTimeString());
		});

		chrome.storage.sync.set({jk2do_Alarms: alarms}, function() {
			console.log('saved to jk2do_Alarms at ' + new Date().toTimeString());
		});
		
		chrome.storage.sync.set({jk2do_Projects: projects}, function() {
			console.log('saved to jk2do_Projects at ' + new Date().toTimeString());
		});

		chrome.storage.sync.set({jk2do_TodoGroups: todoGroups}, function() {
			console.log('saved to jk2do_TodoGroups at ' + new Date().toTimeString());
		});
		

		
	}
	
	this.addTodo = function(newData) {
		var newId = self.cfg.lastId.todo++;
		var new2do = {};
		console.log('Storage.add(2do) :', newData);
		//angular.extend(new2do, _defaultModels.todo);
		//angular.copy(newData, new2do);
		angular.extend(new2do, _defaultModels.todo, newData);
		new2do.id = newId;
		new2do.createdAt = new Date();
		console.log('final Storage.add new2do:', new2do);
		this.tasks.push(new2do);
		this.saveAll();
		return new2do;
	}
	
	this.removeTodo = function(todo) {
		this.tasks.splice(this.tasks.indexOf(todo), 1);
		this.saveAll();
	}
	
	this.removeAll = function() {
		this.tasks = [];
		//KEEP CATEGORIES DURING DEBUGthis.categories = [];
		this.alarms = [];
		this.saveAll();
	}
	
	this.addCategory = function(newData) {
		var newId = self.categories.length + 1;
		var newCategory = angular.extend({}, newData);
		newCategory['id'] = newId;
		console.log('Storage.addCategory: ', newCategory);
		this.categories.push(newCategory);
		this.saveAll();
		return newCategory;
	}
	
	this.removeCategory = function(category) {
		this.categories.splice(this.categories.indexOf(category), 1);
		this.saveAll();
	}
	
	this.addAlarm = function(alarm) {
		var newId = this.alarms.length + 1;
		alarm['id'] = newId;
		this.alarms.push(alarm);
		this.saveAll();
		return alarm;
	}
	
	this.removeAlarm = function(alarm) {
		this.alarms.splice(this.alarms.indexOf(alarm), 1);
		this.saveAll();
	}
	
	this.addProject = function(project) {
		var newId = self.projects.length + 1;
		project['id'] = newId;
		this.projects.push(project);
		this.saveAll();
		return project;
	}
	
	this.removeProject = function(project) {
		this.projects.splice(this.projects.indexOf(project), 1);
		this.saveAll();
	}
	
	this.addTodoGroup = function(todoGroup) {
		var newId = self.todoGroups.length + 1;
		todoGroup['id'] = newId;
		this.todoGroups.push(todoGroup);
		this.saveAll();
		//this.saveObject('todoGroup', todoGroup);
		return todoGroup;
	}
	
	this.removeTodoGroup = function(todoGroup) {
		this.todoGroups.splice(this.todoGroups.indexOf(todoGroup), 1);
	}
	
	this.initAppData = function() {
		//Initialize app data - either first app run or Storage was cleared
		var newTask = {}, newTask2 = {}, newCategory = {}, newAlarm = {}, newProject = {}, newProject2 = {}, newTodoGroup = {}, cfg = {};
		//alert('No data found - initializing app for first time use!');
		
		angular.copy(_defaultModels.todo, newTask);
		console.log(newTask);
		newTask.id = 1;
		newTask.content = 'Eat';
		newTask.category_id = 1;
		
		angular.copy(_defaultModels.todo, newTask2);
		newTask2.id = 2;
		newTask2.content = 'Shower';
		newTask2.category_id = 1;
		
		angular.copy(_defaultModels.category, newCategory);
		newCategory.id = 1;
		newCategory.name = 'General';
		newCategory.shorthand = 'g';
		
		/*angular.copy(_defaultModels.alarm, newAlarm);
		newAlarm.id = 1;
		newAlarm.task_id = 1;*/
		
		angular.copy(_defaultModels.project, newProject);
		newProject.id = 1;
		newProject.name = 'Go to Mars';
		
		angular.copy(_defaultModels.project, newProject2);
		newProject2.id = 2;
		newProject2.pid = 1;
		newProject.name = 'Build a rocket';
		
		angular.copy(_defaultModels.todoGroup, newTodoGroup);
		newTodoGroup.id = 1;
		newTodoGroup.name = 'Morning Routine';
		newTodoGroup.notes = 'Stuff to do first thing in the morning';
		newTodoGroup.todos = [ 1, 2 ];
		
		cfg['lastId'] = { 'tasks': 2, 'categories': 1, 'projects': 2, 'alarms': 0, 'todoGroups': 1 };
		cfg['localStorageContainers'] = { "Tasks": 1, "Projects": 1, "Alarms": 1, "Categories": 1, "TodoGroups": 1 };
		
		this.tasks = [ newTask, newTask2 ];
		this.categories = [ newCategory ];
		//this.alarms = [ newAlarm ];
		this.alarms = [];
		this.todoGroups = [ newTodoGroup ];
		this.cfg = cfg;
		
		this.saveAll(); //Save initialized data
		
	}
	
	this.saveObject = function(type, object) {
		var keyName = 'jk2';
		var typeCode = 'x';
		var finalData;
		console.log(object);
		switch(type) {
		case 'task':
			typeCode = 't';
			break;
		case 'project':
			typeCode = 'p';
			break;
		case 'category':
			typeCode = 'c';
			break;
		case 'alarm':
			typeCode = 'a';
			break;
		case 'todoGroup':
			typeCode = 'tg';
			break;
		default:
			typeCode = 'x';
			console.log('storage.SaveObject: unknown type/obj: ' + type + ':', object);
			
		}
		
		keyName += typeCode + '_' + object.id;
		
		//Save object in localStorage
		finalData = JSON.stringify(object);
		localStorage[keyName] = finalData;
		
		console.log('storage.saveObject - keyName = ' + keyName);
		console.log(finalData);
		
	}
	
	this.duplicateIndexCheck = function(objs, uniqueField, isNumericField, dataContainer) {
		//Walk array of objects and check for duplicates in property obj[uniqueField]
		var objIds = [], validObjs = [], duplicateObjs = [], errorObjs = [];
		if (angular.isArray(objs)) {
			if (objs.length > 0) {
				var result = {};
				for (var i=0; i < objs.length; i++) {
					var obj = objs[i];
					if (obj.hasOwnProperty(uniqueField)) {
						var val = obj[uniqueField];
						if (objIds.indexOf(val) === -1) {
							objIds.push(val);
							validObjs.push(obj);
						} else {
							console.log('duplicateIndexCheck: uniqueField='+uniqueField+', duplicate found:', obj);
							duplicateObjs.push(obj);
						}
					} else {
						console.log('duplicateIndexCheck: uniqueField='+uniqueField+', property not found on obj:', obj);
						errorObjs.push(obj);
					}
					if (isNumericField) {
						objIds.sort(function(a, b) { return a - b; });
					} else {
						objIds.sort();
					}
					if (objIds.length > 0) {
						result['first'] = objIds[0];
						result['last'] = objIds[objIds.length - 1];
					}
				}
				result['objIds'] = objIds;
				result['validObjs'] = validObjs;
				result['duplicateObjs'] = duplicateObjs;
				result['errorObjs'] = errorObjs;
				
				if (duplicateObjs.length > 0) {
					
				}
				
				if (angular.isArray(dataContainer)) {
					//Array.prototype.push.apply(dataContainer, objs);
					Array.prototype.push.apply(dataContainer, validObjs);
				}
				//return { objIds: objIds, duplicateObjs: duplicateObjs, errorObjs: errorObjs };
				console.log(result);
				return result;
			} else {
				console.log('duplicateIndexCheck.warn: uniqueField='+uniqueField+', no objs in array:', objs);
				return { objIds: objIds, duplicateObjs: duplicateObjs, errorObjs: errorObjs };
			}
		} else {
			console.log('duplicateIndexCheck: uniqueField='+uniqueField+',cannot check invalid objs: ', objs);
			return false;
		}
	}
	
	this.fullIndexAudit = function(objects, objectNames, uniqueFields, isNumericFields) {
		if (angular.isArray(objects) && angular.isArray(uniqueFields) && angular.isArray(isNumericFields) && angular.isArray(objectNames)) {
			var ol = objects.length, on = objectNames.length, ul = uniqueFields.length, il = isNumericFields.length; 
			if (ol === ul && ol === il && ol === on) {
				//Begin audit
				var audit = {};
				angular.forEach(objects, function(objs, i) {
					var name = objectNames[i];
					var uniqF = uniqueFields[i];
					var isNumF = isNumericFields[i];
					var keys = [];
					var thisAudit;
					console.log('audit i='+i+', obj:', obj);
					//audit[name] = { 'first': false, 'last': false, 'all': [] };
					/*angular.forEach(objs, function(obj, j) {
						console.log('j='+j+', obj:', obj);
						var thisAudit = self.duplicateIndexCheck(objs, uniqF, isNumF);
					});*/
					thisAudit = self.duplicateIndexCheck(objs, uniqF, isNumF);
					audit['name'] = thisAudit;
				});
				console.log('audit:', audit);
			} else {
				//Data length mismatch
			}
		} else {
			//Bad data
		}
	}
	
	this.dbg = function() {
		console.log('Tasks:', this.tasks);
		console.log('Categories:', this.categories);
		console.log('Alarms:', this.alarms);
		console.log('Projects:', this.projects);
		console.log('TodoGroups:', this.todoGroups);
	}
});