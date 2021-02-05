

function TaskLayerBreadCrumbController() {
    this.taskLayerBreadCrumbViewAPI = null;

    this.taskControllerAPI = null;
    this.taskListControllerAPI = null;

    this.initExternalAPIs = function(taskControllerAPI, taskListControllerAPI, taskLayerBreadCrumbViewAPI) {
        this.taskControllerAPI = taskControllerAPI;
        this.taskListControllerAPI = taskListControllerAPI;
        this.taskLayerBreadCrumbViewAPI = taskLayerBreadCrumbViewAPI;
    }

    this.addLayer = function(ID, name) {
        this.taskLayerBreadCrumbViewAPI.layerUp(ID, name);
    }
    this.getSubTaskOfLayer = function(e) {
        var layerNode = e.target.parentNode;
        var taskID = layerNode.getAttribute("layer-ID");

        this.taskControllerAPI.getSubTasks(taskID);
        this.taskLayerBreadCrumbViewAPI.layerDownTo(taskID, layerNode.parentNode);
    }
    this.getLastLayerID = function() {
        return this.taskLayerBreadCrumbViewAPI.getIDofLastLayer();
    }
    this.getInitialComponent = function() {
        return this.taskLayerBreadCrumbViewAPI.getComponent();
    }
}


function AddTaskController() {
    this.addTaskViewAPI = null;

    this.taskControllerAPI = null;
    this.taskLayerBreadCrumbControllerAPI = null;

    this.initExternalAPIs = function(taskControllerAPI, addTaskViewAPI, taskLayerBreadCrumbControllerAPI) {
        this.taskControllerAPI = taskControllerAPI;
        this.addTaskViewAPI = addTaskViewAPI;
        this.taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerAPI;
    }

    this.addTaskButtonClick = (function(e) {
        var taskName = e.target.previousSibling.value;

        if(taskName.trim() === "") return;

        e.target.previousSibling.value = "";

        var superTaskID = this.taskLayerBreadCrumbControllerAPI.getLastLayerID();

        this.taskControllerAPI.createNewTask(taskName, superTaskID);
    }).bind(this);
    this.addTaskInputChange = (function(e) {
        if(e.keyCode !== 13) return;

        var taskName = e.target.value;

        if(taskName.trim() === "") return;
        e.target.value = "";

        var superTaskID = this.taskLayerBreadCrumbControllerAPI.getLastLayerID();

        this.taskControllerAPI.createNewTask(taskName, superTaskID);
    }).bind(this);
    this.getInitialComponent = function() {
        return this.addTaskViewAPI.getComponent();
    }
}



function TaskController(taskViewActionHandlers) {
    this.taskViewAPI = null;

    this.taskListControllerAPI = null;
    this.taskLayerBreadCrumbControllerAPI = null

    this.initExternalAPIs = function(taskListControllerAPI, taskViewAPI, taskLayerBreadCrumbControllerAPI) {
        this.taskListControllerAPI = taskListControllerAPI;
        this.taskViewAPI = taskViewAPI;
        this.taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerAPI;
    }

    this.onRemoveTask = function(e) {
        var taskComponent = e.target.parentNode;
        var superTaskID = taskComponent.getAttribute("super-task-ID");
        var taskID = taskComponent.getAttribute("task-ID");
        var response = TaskModel.deleteTask(taskID);

        if(response === "SUCCESS") {
            this.taskListControllerAPI.removeTaskFromListComponent(taskComponent);
        }
    }
    this.onChangeStatus = function(e) {
        var taskComponent = e.target;
        var status = taskComponent.getAttribute("task-status");
        var ID = taskComponent.getAttribute("task-ID");

        var response = TaskModel.updateTask("status", INVERT_STATUS[status]);

        if(response !== "FAILURE") {
            this.taskViewAPI.switchStatus(taskComponent, response.status);
            this.taskListControllerAPI.switchTaskStatus(taskComponent);
        }

    }
    this.onEditTaskName = function(e) {
        var taskComponent = e.target.parentNode;
        var newName = e.target.value;
        var name = taskComponent.getAttribute("task-name");
        var ID = taskComponent.getAttribute("task-ID");

        if(newName === name) return;

        var response = TaskModel.updateTask("name", newName, ID);

        if(response !== "FAILURE") {
            this.taskViewAPI.editTaskName(taskComponent, response.name);
        }
    }
    this.onAddSubTasks = function(e) {
        this.taskListControllerAPI.setTaskList([]);
    }
    this.onGetSubTasks = (function(e) {
        var taskComponent = e.target.parentNode;
        var taskID = taskComponent.getAttribute("task-ID");

        this.getSubTasks(taskID);
    }).bind(this);

    this.createNewTask = function(name, superTaskID) {
        var task = TaskModel.createNewTask(name, superTaskID);
        var newTaskComponent = this.taskViewAPI.getComponent(
            task.ID,
            task.name,
            task.status,
            task.superTaskID,
            task.hasSubTasks
        );
        this.taskLayerBreadCrumbControllerAPI.addLayer(task.ID, task.name);
        this.taskListControllerAPI.appendNewTaskToListComponent(newTaskComponent);
    }
    this.getSubTasks = function(ID, isReturnTaskComponents) {
        var subTasksID = this.taskListControllerAPI.getSubTasksID(ID);
        var subTasksData = TaskModel.getTasks(subTasksID);

        var tasksComponentArr = subTasksData.map(function(taskData) {
            return this.taskViewAPI.getComponent(
                taskData.ID,
                taskData.name,
                taskData.status,
                taskData.superTaskID,
                taskData.hasSubTasks
            );
        });

        if(isReturnTaskComponents) {
            return tasksComponentArr;
        }

        this.taskListControllerAPI.setTaskList(tasksComponentArr);
    }
}




function TaskListController() {
    this.taskListViewAPI = null;

    this.taskControllerAPI = null;
    this.appConrollerAPI = null;

    this.initExternalAPIs = function(taskListViewAPI, taskControllerAPI, appConrollerAPI) {
        this.taskListViewAPI = taskListViewAPI;
        this.taskControllerAPI = taskControllerAPI;
        this.appConrollerAPI = appConrollerAPI;
    }

    this.getSubTasksID = function(ID) {
        return TaskListModel.getTasksList(ID);
    }
    this.removeTaskFromListComponent = function(taskNode) {
        this.taskListViewAPI.removeTaskNode(taskNode);
    }
    this.appendNewTaskToListComponent = function(taskNode) {
        this.taskListViewAPI.appendTaskNode("incomplete", taskNode);
    }
    this.switchTaskStatus = function(taskNode) {
        if(taskNode.getAttribute("task-status") === "completed") {
            this.taskListViewAPI.removeTaskNode(taskNode);
            this.taskListViewAPI.appendTaskNode("completed", taskNode);
        } else {
            this.taskListViewAPI.removeTaskNode(taskNode);
            this.taskListViewAPI.appendTaskNode("incomplete", taskNode);
        }
    }
    this.setTaskList = function(taskNodesArr, isReturnComponents) {
        var completedTaskNodes = [];
        var incompleteTaskNodes = [];

        taskNodesArr.forEach(function(taskNode) {
            if(taskNode.getAttribute("task-status") === "completed") completedTaskNodes.push(taskNode);
            else incompleteTaskNodes.push(taskNode);
        });

        var incompleteTaskListComponent = this.taskListViewAPI.getComponent("incomplete", incompleteTaskNodes);
        var completedTaskListComponent = this.taskListViewAPI.getComponent("completed", completedTaskNodes);

        if(isReturnComponents) return {
            incompleteList: incompleteTaskListComponent,
            completedList: completedTaskListComponent,
        };

        this.appConrollerAPI.updateTaskLists(incompleteTaskListComponent, completedTaskListComponent);
    }
    this.getInitialComponents = (function() {
        var homeTasks = TaskListModel.getTasksList("HOME");

        if(homeTasks !== null) {
            var taskNodesArr = this.taskControllerAPI.getSubTasks("HOME", true);

            return this.setTaskList(taskNodesArr, true);
        }
        return this.setTaskList([], true);
    }).bind(this);
}




function AppController() {
    this.appViewAPI = null;

    this.taskLayerBreadCrumbControllerAPI = null;
    this.addTaskControllerAPI = null;
    this.taskListControllerAPI = null;

    this.initExternalAPIs = function(appViewAPI, taskLayerBreadCrumbControllerAPI, addTaskControllerAPI, taskListControllerAPI) {
        this.appViewAPI = appViewAPI;
        this.taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerAPI;
        this.addTaskControllerAPI = addTaskControllerAPI;
        this.taskListControllerAPI = taskListControllerAPI;
    }

    this.updateTaskLists = function(incompletedList, completedList) {
        this.appViewAPI.updateTaskListNodes(incompletedList, completedList);
    }

    this.runApp = function() {
        var breadCrumbComponent = this.taskLayerBreadCrumbControllerAPI.getInitialComponent();
        var addTaskComponent = this.addTaskControllerAPI.getInitialComponent();
        var taskListsObj = this.taskListControllerAPI.getInitialComponents();

        console.log()

        this.appViewAPI.initApp(
            breadCrumbComponent,
            addTaskComponent,
            taskListsObj.incompleteList,
            taskListsObj.completedList
        );
    }
}