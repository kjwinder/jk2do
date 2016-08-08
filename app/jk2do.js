/*
***
***
Copyright (C) 2016 Kyle J Winder

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
***
***
*/

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