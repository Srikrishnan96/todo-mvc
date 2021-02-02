(function() {
    var appModel = new AppModel();
    var appView = new AppView();
    var appController = new AppController(appModel.getTasks, appModel.addTask, appModel.deleteTask, appModel.updateTask);

    appView.initAppView({
        fetchTasks: appController.fetchTasks,
        putNewTask: appController.putNewTask,
        updateTask: appController.updateTask,
        deleteTask: appController.deleteTask,
    });

})();