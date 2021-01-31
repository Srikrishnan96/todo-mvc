// APP CONSTANTS
var HOME = "HOME";
var COMPLETED_TASK_STATUS = "completed";
var INCOMPLETE_TASK_STATUS = "incomplete";


function TaskModel(name, superTaskID, status = INCOMPLETE_TASK_STATUS, ID) {
    var ID = ID || Date.now().toString();
    var name = name;
    var status = status;
    var superTaskID = superTaskID;

    this.setName = function(newTaskName) {
        name = newTaskName;
    };
    this.setStatus = function(newStatus) {
        status = newStatus;
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
}

function AppModel() {
    if(localStorage.getItem("HOME") === null ) localStorage.setItem("HOME", JSON.stringify([]));

    function deleteSubTaskRecursively(taskID) {
        var subTasks = localStorage.getItem(`${taskID}`);
        if(subTasks !== null) {
            var subTasksArr = JSON.parse(subTasks);
            for(var index = 0; index < subTasksArr.length; index++) {
                deleteSubTaskRecursively(subTasksArr[index].ID);
            }
        }
        localStorage.removeItem(taskID);
    }

    this.addTask = function(superTaskID, taskName) {
        var task = new TaskModel(taskName, superTaskID);
        var taskList = JSON.parse(localStorage.getItem(superTaskID));
        var ID = task.getID();
        var name = task.getName();
        var status = task.getStatus();
        var superTaskid = task.getSuperTaskID();
        var taskData = {ID: ID, name: name, status: status, superTaskID: superTaskid};

        if(!taskList) taskList = [];
        taskList.push(taskData);
        localStorage.setItem(`${superTaskID}`, JSON.stringify(taskList));

        return taskData;
    };
    this.updateTask = function(updatedTask) {
        var superTaskID = updatedTask.superTaskID;
        var taskContainerList = JSON.parse(localStorage.getItem(superTaskID));
        var taskIndex = taskContainerList.findIndex(function (task) {
            return task.ID === updatedTask.ID;
        });

        taskContainerList[taskIndex] = updatedTask;
        localStorage.setItem(superTaskID, JSON.stringify(taskContainerList));
    };
    this.deleteTask = function(superTaskID, taskID) {
        var taskContainerList = JSON.parse(localStorage.getItem(superTaskID));
        var newTaskContainerList = taskContainerList.filter(function(task) {
            return task.ID !== taskID;
        });

        if(newTaskContainerList.length <= 0) newTaskContainerList = null;
        localStorage.setItem(superTaskID, JSON.stringify(newTaskContainerList));
        deleteSubTaskRecursively(taskID);
    };
    this.getTasks = function(superTaskID) {
        return JSON.parse(localStorage.getItem(superTaskID));
    };
}