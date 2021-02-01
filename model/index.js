
function TaskModel(name, superTaskID, status = "incomplete", hasSubTasks = false, ID) {
    var ID = ID || Date.now().toString();
    var name = name;
    var status = status;
    var superTaskID = superTaskID;
    var hasSubTasks = hasSubTasks

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
    this.getHasSubTasks = function() {
        return hasSubTasks;
    }
}

function AppModel() {
    if(localStorage.getItem("HOME") === null ) {
        localStorage.setItem("HOME", JSON.stringify({subTasks: [], superTaskID: null}));
    }

    function deleteSubTaskRecursively(taskID) {
        var taskSubObj = JSON.parse(localStorage.getItem(taskID));

        if(!taskSubObj) return;

        var subTasks = taskSubObj.subTasks;

        if(subTasks !== null) {
            for(var index = 0; index < subTasks.length; index++) {
                deleteSubTaskRecursively(subTasks[index].ID);
            }
        }
        localStorage.removeItem(taskID);
    }

    this.addTask = function(superTaskID, taskName) {
        var task = new TaskModel(taskName, superTaskID);
        var superTaskSubObj = JSON.parse(localStorage.getItem(superTaskID));

        if(!superTaskSubObj.subTasks) superTaskSubObj.subTasks = [];
        var taskList = superTaskSubObj.subTasks;

        var ID = task.getID();
        var name = task.getName();
        var status = task.getStatus();
        var superTaskid = task.getSuperTaskID();
        var hasSubTasks = task.getHasSubTasks();
        var taskData = {ID: ID, name: name, status: status, superTaskID: superTaskid, hasSubTasks: hasSubTasks};

        if(!taskList) taskList = [];
        taskList.push(taskData);
        localStorage.setItem(`${superTaskID}`, JSON.stringify(superTaskSubObj));
        localStorage.setItem(ID, JSON.stringify({subTasks: null, superTaskID: superTaskID}));

        return taskData;
    };
    this.updateTask = function(updatedTask) {
        var superTaskID = updatedTask.superTaskID;
        var superTaskSubObj = JSON.parse(localStorage.getItem(superTaskID));
        var taskContainerList = superTaskSubObj.subTasks;
        var superSuperTaskID = superTaskSubObj.superTaskID;
        var superSuperTaskSubObj = JSON.parse(localStorage.getItem(superSuperTaskID));

        var taskIndex = taskContainerList.findIndex(function (task) {
            return task.ID === updatedTask.ID;
        });
        taskContainerList[taskIndex] = updatedTask;

        if(!!superSuperTaskSubObj) {
            var superTaskContainerList = superSuperTaskSubObj.subTasks;
            var superTaskIndex = superTaskContainerList.findIndex(function(task) {
                return task.ID === superTaskID;
            });
            var isAllSubCompleted = taskContainerList.every(function(task) {
                return task.status === "completed";
            });

            if(isAllSubCompleted) superTaskContainerList[superTaskIndex].status = "completed";
            else superTaskContainerList[superTaskIndex].status = "incomplete";
            localStorage.setItem(superSuperTaskID, JSON.stringify(superSuperTaskSubObj));
        }
        localStorage.setItem(superTaskID, JSON.stringify(superTaskSubObj));
    };
    this.deleteTask = function(superTaskID, taskID) {
        var superTaskSubObj = JSON.parse(localStorage.getItem(superTaskID));
        var taskContainerList = superTaskSubObj.subTasks;
        var newTaskContainerList = taskContainerList.filter(function(task) {
            return task.ID !== taskID;
        });

        superTaskSubObj.subTasks = newTaskContainerList.length > 0 ? newTaskContainerList : null;
        localStorage.setItem(superTaskID, JSON.stringify(superTaskSubObj));
        deleteSubTaskRecursively(taskID);
    };
    this.getTasks = function(superTaskID) {
        var superTaskSubObj = JSON.parse(localStorage.getItem(superTaskID));

        if(!superTaskSubObj) return null;
        return JSON.parse(localStorage.getItem(superTaskID)).subTasks;
    };
}