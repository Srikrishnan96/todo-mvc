(function() {

    var appModelInitObject = new AppModel();

    var taskLayerBreadCrumbController = new TaskLayerBreadCrumbController();
    var addTaskContoller = new AddTaskController();
    var taskController = new TaskController();
    var taskListController = new TaskListController();
    var appController = new AppController();

    var taskLayerBreadCrumbView = new TaskLayerBreadCrumbView();
    var addTaskView = new AddTaskView();
    var taskView = new TaskView();
    var taskListView = new TaskListView();
    var appView = new AppView();

    taskLayerBreadCrumbController.initExternalAPIs(taskController, taskListController, taskLayerBreadCrumbView);
    addTaskContoller.initExternalAPIs(taskController, addTaskView, taskLayerBreadCrumbController);
    taskController.initExternalAPIs(taskListController, taskView, taskLayerBreadCrumbController);
    taskListController.initExternalAPIs(taskListView, taskController, appController);
    appController.initExternalAPIs(appView, taskLayerBreadCrumbController, addTaskContoller, taskListController);

    taskLayerBreadCrumbView.loadEventHandlers(taskLayerBreadCrumbController);
    addTaskView.loadEventHandlers(addTaskContoller);
    taskView.loadEventHandlers(taskController);

    appModelInitObject.initAppDataBase();
    appController.runApp();
})();