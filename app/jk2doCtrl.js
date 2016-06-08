angular.module('jk2do').controller('jk2doCtrl', function($scope, jk2doStorage, jk2doAlarm) {
	$scope.jk2doStorage = jk2doStorage; //Storage 
	$scope.jk2doAlarm = jk2doAlarm;
	
	cs = $scope; //debug
	
	/* Data Models (from jk2doStorage) */
	$scope.jk2doList = [];
	$scope.jk2doCategories = [];
	$scope.jk2doAlarms = [];
	$scope.jk2doProjects = [];
	$scope.jk2doTodoGroups = [];
	/* End Data Models */
	
	/* Model References */
	$scope.ref = {
		todos: {},
		categories: {},
		alarms: {},
		projects: {},
		todoGroups: {},
		selectTimeMetrics: {}
	};
	/* End Model References */
	
	/* Empty Objects ready to be added */
	$scope.new2do = angular.copy(_defaultModels.todo);
	$scope.newCategory = angular.copy(_defaultModels.category);
	$scope.newAlarm = angular.copy(_defaultModels.alarm);
	$scope.newProject = angular.copy(_defaultModels.project);
	$scope.newTodoGroup = angular.copy(_defaultModels.todoGroup);
	/* End Empty Objects */
	
	/* UI Controls*/
	$scope.addingNewTask = false;
	$scope.addingNewCategory = false;
	$scope.addingNewAlarm = false;
	$scope.addingNewProject = false;
	$scope.addingNewTodoGroup = false;
	
	$scope.new2doHasAlarm = false;
	
	$scope.showAllPanes = false; //tabGroup/tabPane control
	
	$scope.selectTimeMetrics = [
		{ id: 1, name: 'Seconds', shorthand: 's', mod: function(x) { return x * 1000; } },
		{ id: 2, name: 'Minutes', shorthand: 'm', mod: function(x) { return x * 1000 * 60; } },
		{ id: 3, name: 'Hours', shorthand: 'h', mod: function(x) { return x * 1000 * 60 * 60; } },
		{ id: 4, name: 'Days', shorthand: 'd', mod: function(x) { return x * 1000 * 60 * 60 * 24; } },
		{ id: 5, name: 'Weeks', shorthand: 'w', mod: function(x) { return x * 1000 * 60 * 60 * 24 * 7; } },
		{ id: 6, name: 'Months', shorthand: 'mo', mod: function(x) { return x * 1000 * 60 * 60 * 24 * 30; } },
		{ id: 7, name: 'Years', shorthand: 'y', mod: function(x) { return x * 1000 * 60 * 60 * 24 * 365; } }
	];
	
	$scope.recurrenceTypes = [ //Objects with isRecurringX
		{id: 1, name: 'none'},
		{id: 2, name: 'schedule'},
		{id: 3, name: 'range'},
		{id: 4, name: 'any'}
	];
	/* End UI Controls*/

	/* Language/i18n support */
	$scope.languages = [
		{name:"Deutsch",dict:"/lang/en-de.txt",shorthand:"de"}
	];
	
	$scope.languageReference = {
		"de": {
			"refs": langRef_de_en, //Key-value JSON pairs for each word entry
			"randomWord": "flight",
			"randomLetterIndex": 5,
			"randomWordIndex": 1,
			"searchForWord": "",
			"searchWord": false,
			"searchWordReference": false
		}
	};
	
	/* End Language/i18n support */
	
	$scope.jk2doStorage.findAll(function(tasks, categories, alarms, projects, todoGroups) { 	//Pull data from the Storage service
		if (angular.isArray(tasks)) {
			$scope.jk2doList = tasks;
		} else {
			console.log('TASKS NOT ARRAY');
			$scope.jk2doList = [];
		}
		if (angular.isArray(categories)) {
			$scope.jk2doCategories = categories;
		} else {
			console.log('CATEGORIES NOT ARRAY');
			$scope.k2doCategories = [];
		}
		if (angular.isArray(alarms)) {
			$scope.jk2doAlarms = alarms;
		} else {
			console.log('ALARMS NOT ARRAY');
			$scope.jk2doAlarms = [];
		}
		if (angular.isArray(projects)) {
			$scope.jk2doProjects = projects;
		} else {
			console.log('PROJECTS NOT ARRAY');
			$scope.jk2doProjects = [];
		}
		$scope.jk2doTodoGroups = todoGroups;
		console.log('Ctrl.jkStorage.findAll alarms:', alarms);
		console.log('Ctrl.jkStorage.findAll tasks:', tasks);
		console.log('Ctrl.jkStorage.findAll categories:', categories);
		console.log('Ctrl.jkStorage.findAll todoGroups:', todoGroups);
		console.log('Pre-apply on jk2doStorage.findAll');
		
		$scope.buildReferences(tasks, 'todos', 'id');
		$scope.buildReferences(alarms, 'alarms', 'id');
		$scope.buildReferences(categories, 'categories', 'id');
		$scope.buildReferences(projects, 'projects', 'id');
		$scope.buildReferences(todoGroups, 'todoGroups', 'id');
		
		$scope.buildReferences($scope.selectTimeMetrics, 'selectTimeMetrics', 'id');
		
		/* Disable Language tab for now
		//Language - build reference for random word selection
		$scope.buildLanguageReference($scope.languageReference['de']);
		*/
		$scope.$apply(); //Show loaded data in View
		
		console.log('... Data loaded via jk2doStorage.findAll!');
	});

	
	$scope.$watch('jk2doStorage.data', function() { //Track Tasks data
		$scope.jk2doList = $scope.jk2doStorage.tasks;
		console.log('Tasks watch...' + new Date().toTimeString());
	});

	$scope.$watch('jk2doStorage.categories', function() { //Track Categories data
		$scope.jk2doCategories = $scope.jk2doStorage.categories;
		console.log('Categories watch...' + new Date().toTimeString());
	});
	
	$scope.$watch('jk2doAlarm.alarms', function() { //Track Alarms data
		$scope.jk2doAlarms = $scope.jk2doAlarm.alarms;
		console.log('Alarms watch...' + new Date().toTimeString());
	});
	
	$scope.$watch('jk2doStorage.projects', function() { //Track Projects data
		$scope.jk2doProjects = $scope.jk2doStorage.projects;
		console.log('Projects watch...' + new Date().toTimeString());
	});
	
	$scope.$watch('jk2doStorage.todoGroups', function() {
		$scope.jk2doTodoGroups = $scope.jk2doStorage.todoGroups;
		console.log('TodoGroups watch...' + new Date().toTimeString());
	});

	
	$scope.addTodo = function() {
		var newObject, newAlarm = {}, emptyObject = {};
		var dbgObj = angular.copy($scope.new2do);
		console.log('Before Ctrl.add, dbgObj :', dbgObj);
		newObject = jk2doStorage.addTodo($scope.new2do);
		/* FIXME add alarm
		if ($scope.new2doHasAlarm === true) {
			//angular.copy($scope.newAlarm, newAlarm);
			//newAlarm['task_id'] = $scope.new2do.id;
			$scope.newAlarm['task_id'] = $scope.new2do['id'];
			newAlarm = $scope.addAlarm();
			
			newObject['alarmName'] = newAlarm['name'];
			
			console.log('Added Alarm (with todo): ', newAlarm);
			
		}
		*/
		console.log('Add todo:', newObject);
		
		//Reset new Todo object
		angular.copy(_defaultModels.todo, emptyObject);
		$scope.new2do = emptyObject;
		$scope.new2doHasAlarm = false;
		$scope.addingNewTask = false;
	}
	
	$scope.removeTodo = function(todo) {
		jk2doStorage.removeTodo(todo);
		console.log('Remove todo:', todo);
	}
	
	$scope.removeAll = function() {
		jk2doStorage.removeAll();
	}
	
	$scope.saveAll = function() {
		jk2doStorage.sync();
	}
	
	$scope.addCategory = function() {
		var newObject = {};
		console.log('Add category:', $scope.newCategory);
		jk2doStorage.addCategory($scope.newCategory);
		angular.copy(_defaultModels.category, newObject);
		$scope.newCategory = newObject;
		$scope.addingNewCategory = false;
	}
	
	$scope.removeCategory = function(category) {
		console.log('Remove category: ', category);
		$scope.jk2doStorage.removeCategory(category);
	}
	
	$scope.addAlarm = function() {
		//Add a chrome.alarm via jk2doAlarm Service
		var newAlarm = angular.copy(_defaultModels.alarm, {});
		var thisAlarm = jk2doAlarm.add($scope.newAlarm);
		jk2doStorage.addAlarm($scope.newAlarm);
		console.log('addAlarm: ', $scope.newAlarm);
		$scope.newAlarm = newAlarm;
		$scope.addingNewAlarm = false;
		return thisAlarm;
	}
	
	$scope.removeAlarm = function(alarm) {
		//Remove a chrome.alarm
		jk2doAlarm.remove(alarm);
		jk2doStorage.removeAlarm(alarm);
		console.log('Remove alarm: ', alarm);
	}
	
	$scope.addProject = function() {
		var newProject, emptyProject = {};
		newProject = jk2doStorage.addProject($scope.newProject);
		console.log('Ctrl.addProject: ', $scope.newProject);
		angular.copy(_defaultModels.project, emptyProject);
		$scope.newProject = emptyProject;
		$scope.addingNewProject = false;
	}
	
	$scope.removeProject = function(project) {
		console.log('Ctrl.removeProject: ', project);
		jk2doStorage.remove(project);
	}
	
	$scope.toggleBoolean = function(property) {
		//Toggle a true/false property on an object - THIS MAY BE DANGEROUS AND STUPID kjw
		if (property === true) {
			property = false;
		} else {
			property = true;
		}
	}
	
	$scope.calculateTimeMetric = function(object, index, property, result) {
		var x;
		var metric = $scope.selectTimeMetrics[index];
		console.log('calculateTimeMetric $index:',index);
		console.log(metric);
		if (metric && typeof metric.mod == "function") {
			x = metric.mod(property);
		} else {
			console.log('Cannot calculate for metric: ', metric);
		}
		//result = x;
		object[result] = x;
		//$scope.$apply(); //THROWS ERROR - '$apply already in progress'
		console.log('calculateTimeMetric x:', x);
		console.log('prop: ', property);
		console.log('object: ', object);
	}
	
	$scope.toggleParent = function(child, childType, parent, parentType) {
		var parentArray;
		var childIndex;
		switch(childType) {
			case 'todo':
			default:
				console.log('empty switch for childType: ', childType);
		}
		switch (parentType) {
			case 'todoGroup':
			default:
				parentArray = parent.todos;
				childIndex = parentArray.indexOf(child.id);
				console.log('todoGroup index: ', childIndex);

				
		}
		console.log('parentArray: ', parentArray);
		if (childIndex === -1) {
			//parent.todos.push(child)
			parentArray.push(child.id);
		} else {
			//parent.todos.splice(i, 1);
			parentArray.splice(childIndex, 1);
		}
	}
	
	$scope.addTodoGroup = function() {
		var emptyToDoGroup = angular.copy(_defaultModels.todoGroup);
		var newTodoGroup = jk2doStorage.addTodoGroup($scope.newTodoGroup);
		console.log('Ctrl.addTodoGroup: ', newTodoGroup);
		$scope.newTodoGroup = emptyToDoGroup;
		$scope.addingNewTodoGroup = false;		
	}
	
	$scope.removeTodoGroup = function(todoGroup) {
		console.log('Remove todoGroup:', todoGroup);
		jk2doStorage.removeTodoGroup(todoGroup);
	}
	
	$scope.buildReferences = function(refs, type, key) {
		var thisRef = {};
		if (!$scope.ref.hasOwnProperty(type)) {
			console.log('Ctrl.buildReferences ERROR: cannot find $scope.ref[type], type=', type);
			return false;
		}
		angular.forEach(refs, function(ref, _i) {
			thisRef[ref[key]] = _i;
		});
		console.log('Final ref of type ' + type + ' built:', thisRef);
		$scope.ref[type] = thisRef;
	}
	
	$scope.buildLanguageReference = function(lang) {
		var wordByIndex = [];
		var wordByIndexCharacters = [];
		angular.forEach(lang.refs, function(alpha, _i) {
			var thisBucket = [];
			var thisCharacter = String.fromCharCode(_i + 65);
			wordByIndexCharacters.push(thisCharacter);
			console.log('alpha/_i' + _i, alpha);
			angular.forEach(alpha, function(words, word) {
				thisBucket.push(word);
			});
			wordByIndex.push(thisBucket);
		});
		lang['wordByIndex'] = wordByIndex;
		lang['wordByIndexCharacters'] = wordByIndexCharacters;
		lang['selectedIndexCharacter'] = 0;
	}
	
	$scope.getRandomInt = function(min, max) {
		var i = Math.floor(Math.random() * (max - min + 1) + min);
		return i;
	}
	
	$scope.randomLanguageSelection = function() {
		var newLetterI = $scope.getRandomInt(0, 25);
		var newWordI = $scope.getRandomInt(0, $scope.languageReference.de.wordByIndex[newLetterI].length - 1);
		//var newWord = $scope.languageReference.de.refs[newLetter]
		console.log('lang word: ' + newLetterI + '/' + newWordI);
		var newWord = $scope.languageReference.de.wordByIndex[newLetterI][newWordI];
		var newWordRef = $scope.languageReference.de.refs[newLetterI][newWord];
		console.log(newWord + ', ref:', newWordRef);
		$scope.languageReference.de.randomWordIndex = newWordI;
		$scope.languageReference.de.randomLetterIndex = newLetterI;
		$scope.languageReference.de.randomWord = newWord;
		$scope.languageReference.de.randomWordReference = newWordRef;
	}
	
	$scope.findWordInReference = function() {
		var firstCharCode, searchWordReference, searchForWord = $scope.languageReference.de.searchForWord;
		var firstLetter = searchForWord.toLowerCase()[0];
		//var firstCharCode = firstLetter.charCodeAt(0) - 97;
		if (searchForWord.length === 0) {
			searchWordReference = false;
			console.log('empty search string');
			return;
		}
		firstCharCode = firstLetter.charCodeAt(0) - 97; // Subtract ascii offset to get array index
		console.log('firstLetter/firstCharCode/searchForWord: ' + firstLetter + '/' + firstCharCode, searchForWord);
		if (firstCharCode >= 0 && firstCharCode <= 25 && $scope.languageReference.de.refs[firstCharCode].hasOwnProperty(searchForWord)) {
			searchWordReference = $scope.languageReference.de.refs[firstCharCode][searchForWord];
			console.log(searchWordReference);
		} else {
			console.log('bad first letter?');
			$scope.languageReference.de.searchWordReference = false;
		}
		if (searchWordReference) {
			$scope.languageReference.de.searchWord = searchForWord;
			$scope.languageReference.de.searchWordReference = searchWordReference;
		} else {
			console.log('No searchWord found...');
		}
	}
	
	$scope.selectWordByIndex = function(index) {
		console.log('selectWordByIndex index: ', index);
		if (index >= 0 && index < $scope.languageReference.de.wordByIndex.length) {
			$scope.languageReference.de.selectedIndexCharacter = index;
		} else {
			console.log('error selectWordByIndex index:', index);
		}
	}
	
	$scope.dbg = function() {
		$scope.jk2doStorage.dbg();
	}
	
	$scope.executeOrder66 = function() {
		//DANGEROUS FUNCTION - destroys all chrome.storage data (also Jedi)
		$scope.removeAll();
	}
	
	
});

angular.module('jk2do').filter('inArray', function($filter) {
	return function(list, arrayFilter, element) { 
		//FROM http://stackoverflow.com/questions/15454900/is-it-possible-to-filter-angular-js-by-containment-in-another-array
		if (arrayFilter) {
			return $filter('filter')(list, function(item) {
				return arrayFilter.indexOf(item[element]) != -1;
			});
		}
	};
});

angular.module('jk2do').directive('tabGroup', function() {
	return {
		restrict: 'E',
		transclude: true,
		controller: [ '$scope', function($scope) {
			var panes = $scope.panes = [];
			
			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});
				pane.selected = true;
			};
			
			this.addPane = function(pane) {
				if (panes.length === 0) {
					$scope.select(pane);
				}
				panes.push(pane);
			};
			
			this.showAll = function() {
				$scope.showAllPanes = true;
				angular.forEach(panes, function(pane) {
					pane.selected = true;
				});
				console.log('all panes shown');
			};
		}],
		templateUrl: 'tab-group.html'
	}
});

angular.module('jk2do').directive('tabPane', function() {
	return {
		require: '^^tabGroup',
		restrict: 'EA',
		transclude: true,
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, tabsGroupCtrl) {
			tabsGroupCtrl.addPane(scope);
		},
		templateUrl: 'tab-pane.html'
	}
});
