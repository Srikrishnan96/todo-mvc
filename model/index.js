// APP CONSTANTS
var HOME = "HOME";
var COMPLETED_TASK_STATUS = "completed";
var INCOMPLETE_TASK_STATUS = "incomplete";


function TaskModel(name, status, superTaskID = null, subTaskList = null, ID = null) {
    var ID = ID || Date.now();
    var name = name;
    var status = status;
    var superTaskID = superTaskID;
    var subTaskList = subTaskList;

    this.setTaskName = function(newTaskName) {
        name = newTaskName;
    };
    this.setTaskStatus = function(newStatus) {
        status = newStatus;
    };
    this.addToSubTaskList = function(task) {
        subTaskList.addTask(task.getID());
        localStorageManager.addTask(task);
    };

    this.getID = function() {
        return ID;
    };
    this.getName = function() {
        return name;
    };
    this.getStatus = function() {
        return status;
    };
    this.getSuperTaskID = function() {
        return superTaskID;
    };
    this.getSubTaskList = function() {
        return
    };

    this.intiSubTaskList = function(listOfSubTasks = null) {
        var taskList = new TaskList(ID);
        if(listOfSubTasks !== null) listOfSubTasks.forEach(function(task) { taskList.addTask(task.ID) });

        subTaskList = taskList;
    }
}
Task.makeObjectForExistingTask = function(ID, name, status, superTask, subTasks) {

}

function TaskListModel(superTaskID) {
    var tasks = [];
    var superTaskID = superTaskID;

    this.addTask = function(taskID) {
        tasks.push(taskID);
    }
    this.removeTask = function() {

    }
}

var localStorageManager = {
        addTask: function(task) {
            var superTaskID = task.getSuperTaskID();
            var taskList = superTaskID === null ? JSON.parse(localStorage.getItem("HOME")) :
                JSON.parse(localStorage.getItem(`${superTaskID}`));
            var ID = task.getID();
            var name = task.getName();
            var status = task.getStatus();

            taskList.push({ID: ID, name: name, status: status, superTaskID: superTaskID});
            localStorage.setItem(`${superTaskID}`, JSON.stringify(taskList));
        },
        updateTask: function(task) {
            var superTaskID = task.getSuperTaskID();
            var taskContainerList = superTaskID === null ? JSON.parse("HOME") :
                JSON.parse(`${superTaskID}`);
            var ID = task.getID();
            var name = task.getName();
            var status = task.getStatus();
            var taskIndex = taskContainerList.findIndex(function(task) {
                return task.ID === ID;
            });

            taskContainerList[taskIndex] = {ID: ID, name: name, status: status, superTaskID: superTaskID};
            localStorage.setItem(`${superTaskID}`, taskContainerList);
        },
        removeTask: function(task) {
            var superTaskID = task.getSuperTaskID() !== null ? task.getSuperTaskID() : "HOME";
            var taskContainerList = JSON.parse(`${superTaskID}`);
            var ID = task.ID;
            var newTaskContainerList = taskContainerList.filter(function(task) {
                return task.ID !== ID;
            });

            localStorage.setItem(`${superTaskID}`, newTaskContainerList);
            localStorage.removeItem(`${ID}`);
        },
    };