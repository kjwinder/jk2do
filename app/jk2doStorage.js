angular.module('jk2do').service('jk2doStorage', function($q) {
	var self = this;
	this.tasks = [];
	this.categories = [];
	this.alarms = [];
	this.projects = [];
	this.todoGroups = [];
	
	this.findAll = function(callback) {
		chrome.storage.sync.get('jk2do', function(keys) {
			console.log('Sync keys:', keys);
			
			if (keys.hasOwnProperty("jk2do") === false) {
				//No data found - Initialize App data
				self.initAppData();
			} else {
				//Walk each stored item - a JSON object containing (only) tasks, categories, etc per object
				//var objCfg;
				for (var i = 0; i < keys.jk2do.length; i++) {
					var obj = keys.jk2do[i];
					var objCfg; //_defaultConfig variables in jk2do.js
					var cat;
					if (obj.hasOwnProperty('tasks')) {
						self.tasks = obj.tasks;
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
				/*
				//Load Categories
				for (var i=0; i < self.categories.length; i++) {
					var category = self.categories[i];
					console.log('Category ' + i + ': ', category);
				}
				
				//Load Tasks
				for (var i=0; i < self.tasks.length; i++) {
					var task = self.tasks[i];
					console.log('Task ' + i + ': ', task);
				}
				
				//Load Alarms
				if ( angular.isArray(self.alarms) === false) // || (angular.isArray(self.alarms) === true && self.alarms.length === 0) 
					self.alarms = [];
				
				for (var i=0; i < self.alarms.length; i++) {
					var alarm = self.alarms[i];
					console.log('Alarm ' + i + ': ' , alarm);
					//alarm['id'] = i + 1;
					//angular.merge(alarm, objCfg);
				}
				
				//Load Projects
				if (self.projects && angular.isArray(self.projects) && self.projects.length > 0) {
					for (var i=0; i < self.projects.length; i++) {
						var project = self.projects[i];
						console.log('Project ' + i + ': ', project);
						//project['id'] = i + 1;
					}
				}
				*/
			}
			
			if (typeof callback == "function")
				callback(self.tasks, self.categories, self.alarms, self.projects, self.todoGroups); //Return data to Ctrl
			
		});
		this.dbg();
	}
	
	this.saveAll = function() {
		//Save data to chrome.storage
		
		//Remove _jkCfg property from all objects
		var tasks = angular.copy(this.tasks);
		var categories = angular.copy(this.categories);
		var alarms = angular.copy(this.alarms);
		var projects = angular.copy(this.projects);
		var todoGroups = angular.copy(this.todoGroups);
		angular.forEach([tasks, categories, alarms, projects, todoGroups], function(objs) {
			angular.forEach(objs, function(obj) {
				if (obj.hasOwnProperty('_jkCfg')) {
					delete obj['_jkCfg'];
				}
			});
		});
		
		//console.log('Storage.sync SAVE, final vals:');
		console.log(tasks);
		console.log(categories);
		console.log(alarms);
		console.log(projects);
		console.log(todoGroups);
		
		chrome.storage.sync.set({jk2do: [{tasks: tasks}, {categories: categories}, {alarms: alarms}, {projects: projects}, {todoGroups: todoGroups}]}, function() {
		//chrome.storage.sync.set({jk2do: [{tasks: this.data}, {categories: this.categories}, {alarms: this.alarms}]}, function() {
			console.log('...data saved in local storage at' + new Date().toTimeString());
		});
		
	}
	
	this.addTodo = function(newData) {
		var newId = this.tasks.length + 1;
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
		var newTask = {}, newTask2 = {}, newCategory = {}, newAlarm = {}, newTodoGroup = {};
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
		
		angular.copy(_defaultModels.todoGroup, newTodoGroup);
		newTodoGroup.id = 1;
		newTodoGroup.name = 'Morning Routine';
		newTodoGroup.notes = 'Stuff to do first thing in the morning';
		newTodoGroup.todos = [ 1, 2 ];
		
		this.tasks = [ newTask, newTask2 ];
		this.categories = [ newCategory ];
		//this.alarms = [ newAlarm ];
		this.alarms = [];
		this.todoGroups = [ newTodoGroup ];
		
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
	
	this.dbg = function() {
		console.log('Tasks:', this.tasks);
		console.log('Categories:', this.categories);
		console.log('Alarms:', this.alarms);
		console.log('Projects:', this.projects);
		console.log('TodoGroups:', this.todoGroups);
	}
});