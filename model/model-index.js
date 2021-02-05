var RESPOND_SUCCESS = "SUCCESS";
var RESPOND_FAILURE = "FAILURE";
var COMPLETED = "completed";
var INCOMPLETE = "incomplete";


function TaskModel(name, superTaskID, status = "incomplete", hasSubTasks = false, ID) {
    var ID = ID || Date.now().toString();
    var name = name;
    var status = status;
    var superTaskID = superTaskID;
    var hasSubTasks = hasSubTasks;

    this.setName = function(newTaskName) {
        name = newTaskName;
    };
    this.setStatus = function(newStatus) {
        status = newStatus;
    };

    this.getStorableTaskData = function() {
        return {
            ID: ID, name: name, status: status, superTaskID: superTaskID, hasSubTasks: hasSubTasks
        }
    }
}
Object.assign(TaskModel, (function() {
    function getTask(ID) {
        var task = JSON.parse(localStorage.getItem("TASKS"))[ID];

        if(!task) return null;
        return task;
    }
    function saveTask(updatedTask) {
        var all_tasks = JSON.parse(localStorage.getItem("TASKS"));

        all_tasks[updatedTask.ID] = updatedTask;
        localStorage.setItem("TASKS", JSON.stringify(all_tasks));
    }

    return  {
        getTasks: function(IDs) {
            var tasks = JSON.parse(localStorage.getItem("TASKS"));
            var tasksData = [];

            IDs.forEach(function(id) {
                tasksData.push(tasks[id]);
            });

            return tasksData;
        },
        createNewTask: function(name, superTaskID) {
            var taskObj = new TaskModel(name, superTaskID);
            var taskData = taskObj.getStorableTaskData();

            saveTask(taskData.ID, taskData);
            return taskData;
        },
        updateTask: function(property, newValue, ID) {
            var taskData = getTask(ID);

            function bubbleUpStatusChange(newTaskData) {
                if(newTaskData.superTaskID === "HOME") return;

                var taskList = TaskListModel.getTasksList(newTaskData.superTaskID);
                var isAllCompleted = (taskList).every(function(taskID) {
                    return getTask(taskID).status === COMPLETED;
                });
                var superTask = getTask(newTaskData.superTaskID);

                if(isAllCompleted) superTask.status = COMPLETED;
                else if(superTask.status === COMPLETED) superTask.status = INCOMPLETE;

                saveTask(superTask);
                bubbleUpStatusChange(superTask);
            }

            if(!taskData) return RESPOND_FAILURE;

            taskData[property] = newValue;
            saveTask(taskData);
            Object.keys(taskData).forEach(function(property) {
                if(property === "status") {
                    bubbleUpStatusChange(taskData);
                };
            });
            return taskData;
        },
        deleteTask: function(ID) {
            var all_tasks = JSON.parse(localStorage.getItem("TASKS"));
            var lowerHierarchyTasksIDArr = null;

            if(all_tasks[ID].hasSubTasks) {
                lowerHierarchyTasksIDArr = TaskListModel.removeLowerHierarchyTasks(ID);
                lowerHierarchyTasksIDArr.forEach(function(taskID) {
                    delete all_tasks[taskID];
                });
            }
            // if(all_tasks[ID].superTaskID)
            delete all_tasks[ID];

            localStorage.setItem("TASKS", JSON.stringify(all_tasks));
            return RESPOND_SUCCESS;
        }
    }
})());




function TaskListModel(superTaskID, subTaskList) {
    this.superTaskID = superTaskID;
    this.subTaskList = subTaskList;
}
Object.assign(TaskListModel, (function() {
    function saveTaskList(superTaskID, updatedTaskList) {
        var all_tasks_lists = JSON.parse(localStorage.getItem("TASKSLISTS"));

        all_tasks_lists[superTaskID] = updatedTaskList;
        localStorage.setItem("TASKSLISTS", JSON.stringify(all_tasks_lists));
    }
    function getSubTasks(superTaskID) {
        var taskList = JSON.parse(localStorage.getItem("TASKSLISTS"))[superTaskID];

        if(!taskList) return null;
        return taskList;
    }

    return {
        getTasksList: getSubTasks,
        addTaskToList: function(superTaskID, idOfTaskToAdd) {
                var getSubTaskResponse = getSubTasks(superTaskID);
                var taskList = !!getSubTaskResponse ? getSubTaskResponse : [];

                taskList.push(subTaskID);
                saveTaskList(superTaskID, taskList);
                return idOfTaskToAdd;
            },
        removeTaskFromList: function(superTaskID, idOfTaskToDelete) {
                var taskList = getSubTasks(superTaskID);
                var newTaskList = taskList.filter(function(taskID) {
                    return taskID !== idOfTaskToDelete;
                });
                if(taskList.length === newTaskList) return RESPOND_FAILURE;
                saveTaskList(superTaskID, newTaskList.length ? newTaskList : null);
                return RESPOND_SUCCESS;
            },
        removeLowerHierarchyTasks: function(IDofTask) {
                var all_tasks_lists = JSON.parse(localStorage.getItem("TASKSLISTS"));
                var IDofTasksToDelete = [];

                function removeListsRecursively(ID, deleteIDs) {
                    if(!!all_tasks_lists[ID]) {
                        all_tasks_lists[ID].forEach(function(taskID) {
                            deleteIDs.push(taskID);
                            removeListsRecursively(ID, deleteIDs);
                        });
                    }
                }
                removeListsRecursively(IDofTask, IDofTasksToDelete);
                IDofTasksToDelete.push(IDofTask);
                return IDofTasksToDelete;
            },
        }
})());



function AppModel() {
    this.initAppDataBase = function() {
        localStorage.setItem("TASKS", JSON.stringify({}));
        localStorage.setItem("TASKSLISTS", JSON.stringify({HOME: null}));
    }
}