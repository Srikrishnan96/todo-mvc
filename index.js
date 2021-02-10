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

    taskLayerBreadCrumbController.initExternalAPIs(
        taskController.getAPIforTaskLayerBreadCrumbController(),
        taskLayerBreadCrumbView.getAPIforTaskLayerBreadCrumbController(),
    );
    addTaskContoller.initExternalAPIs(
        taskController.getAPIforAddTaskController(),
        addTaskView.getAPIforAddTaskController(),
        taskLayerBreadCrumbController.getAPIforAddTaskController(),
    );
    taskController.initExternalAPIs(
        taskListController.getAPIforTaskController(),
        taskView.getAPIforTaskController(),
        taskLayerBreadCrumbController.getAPIforTaskController(),
    );
    taskListController.initExternalAPIs(
        taskListView.getAPIforTaskListController(),
        taskController.getAPIforTaskListController(),
    );
    appController.initExternalAPIs(
        appView.getAPIforAppController(),
        taskLayerBreadCrumbController.getAPIforAppController(),
        addTaskContoller.getAPIforAppController(),
        taskListController.getAPIforAppController(),
    );

    taskLayerBreadCrumbView.loadEventHandlers(
        taskLayerBreadCrumbController.getAPIforTaskLayerBreadCrumbView(),
    );
    addTaskView.loadEventHandlers(
        addTaskContoller.getAPIforAddTaskView(),
    );
    taskView.loadEventHandlers(
        taskController.getAPIforTaskView(),
    );

    appModelInitObject.initAppDataBase();
    appController.runApp();
})();