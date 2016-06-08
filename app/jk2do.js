var _defaultModels = { //"Prototype" Data objects stored in chrome.local.storage
	'todo': {
		id: 0,
		pid: 0,
		content: '',
		category_id: 0,
		category: false,
		completed: false,
		createdAt: new Date(),
		alarmName: false,
		project_id: 0,
		isRecurringTask: false,
		recurrenceType: 'none',
		hasCompletionTime: false,
		minCompletionTime: 0,
		minCompletionTimeMetric: false,
		minCompletionTimeResult: 0,
		maxCompletionTime: 0,
		maxCompletionTimeMetric: false,
		maxCompletionTimeResult: 0,
		hasDueDate: false,
		minDueDate: false,
		maxDueDate: false
	},
	'category': {
		id: 0,
		pid: 0,
		name: '',
		shorthand: ''
	},
	'alarm': {
		id: 0,
		name: 'Alarm 1',
		task_id: 0,
		delayInMinutes: 1,
		periodInMinutes: 0,
		isRecurringAlarm: false
	},
	'project': {
		id: 0,
		pid: 0,
		name: '<<New Project>>'
	},
	'todoGroup': {
		id: 0,
		name: 'New TodoGroup',
		notes: 'TodoGroup notes',
		todos: [],
		createdAt: new Date().toISOString(),
		lastTodoIdCompleted: false,
		lastTodoIdCompletedAt: false,
		groupNotes: [],
		todosCompletedAt: [],
		lastGroupCompletionAt: false,
		lastGroupCompletionNotes: '',
		
	}
};

var _defaultConfig = { //Parameters used in the UI related to each Data object - May not need this? Model._jkCfg.$parameter can be created via ng-model binding?
	'todo': {
		editable: false
	},
	'category': {
		editable: false
	},
	'alarm': {
		editable: false
	},
	'project': {
		editable: false
	}
}

var cs; //debug Controller $scope

angular.module('jk2do', []);

console.log('... Done with jk2do.js');