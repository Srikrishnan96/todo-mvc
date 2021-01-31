function TaskController() {
    var appModel = new AppModel();
    var appView = new AppView(this);

    this.fetchTasks = function(taskID) {
        return appModel.getTasks(taskID);
    }
    this.deleteTask = function(superTaskID, taskID) {
        appModel.deleteTask(superTaskID, taskID);
    }
    this.putNewTask = function(superTaskID, taskName) {
        return appModel.addTask(superTaskID, taskName);
    }
    this.updateTask = function(updatedTask) {
        appModel.updateTask(updatedTask);
    }

    this.run = function() {
        appView.initAppView();
    }
}

(new TaskController()).run();