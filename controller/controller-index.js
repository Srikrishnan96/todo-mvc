

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
    this.getSubTaskOfLayer = (function(e) {
        var layerNode = e.target.parentNode;
        var taskID = layerNode.getAttribute("layer-ID");

        this.taskControllerAPI.getSubTasks(taskID);
        this.taskLayerBreadCrumbViewAPI.layerDownTo(taskID, layerNode.parentNode);
    }).bind(this);

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

    this.onAddTaskButtonClick = (function(e) {
        var taskName = e.target.previousSibling.value;
        if(taskName.trim() === "") return;
        e.target.previousSibling.value = "";
        var superTaskID = this.taskLayerBreadCrumbControllerAPI.getLastLayerID();
        this.taskControllerAPI.createNewTask(taskName, superTaskID);
    }).bind(this);

    this.onAddTaskInputChange = (function(e) {
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



function TaskController() {
    this.taskViewAPI = null;

    this.taskListControllerAPI = null;
    this.taskLayerBreadCrumbControllerAPI = null

    this.initExternalAPIs = function(taskListControllerAPI, taskViewAPI, taskLayerBreadCrumbControllerAPI) {
        this.taskListControllerAPI = taskListControllerAPI;
        this.taskViewAPI = taskViewAPI;
        this.taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerAPI;
    }

    this.onRemoveTask = (function(e) {
        var taskComponent = e.target.parentNode;
        var superTaskID = taskComponent.getAttribute("super-task-ID");
        var taskID = taskComponent.getAttribute("task-ID");
        var response = TaskModel.deleteTask(taskID);

        if(response.ID) this.taskListControllerAPI.removeTaskFromListComponent(taskComponent);
    }).bind(this);

    this.onChangeStatus = (function(e) {
        var taskComponent = e.target.parentNode;
        var status = taskComponent.getAttribute("task-status");
        var ID = taskComponent.getAttribute("task-ID");
        var response = TaskModel.updateTask("status", INVERT_STATUS[status], ID);

        if(response !== "FAILURE") {
            this.taskViewAPI.switchStatus(taskComponent, response.status);
            this.taskListControllerAPI.switchTaskStatus(taskComponent);
        }
    }).bind(this);

    this.onEditorInputChange = (function(e) {
        var inputNode = e.target;
        var newName = inputNode.value;
        var ID = inputNode.parentNode.getAttribute("task-ID");

        if(newName.trim() !== "") {
            TaskModel.updateTask("name", newName, ID);
        }
        this.taskViewAPI.renderNewNameNode(inputNode);
    }).bind(this);

    this.onEditButtonClick = (function(e) {
        var nameNode = e.target.previousSibling;
        var name = nameNode.innerText;

        this.taskViewAPI.renderEditorInput(nameNode);
    }).bind(this);

    this.onAddSubTasks = (function(e) {
        var taskComponent = e.target.parentNode;
        var ID = taskComponent.getAttribute("task-ID");
        var name = taskComponent.getAttribute("task-name");
        var taskData = TaskModel.getTask(ID);

        this.taskLayerBreadCrumbControllerAPI.addLayer(ID, name);
        if(taskData.hasSubTasks) this.getSubTasks(ID);
        else this.taskListControllerAPI.setTaskList([]);
    }).bind(this);

    this.onGetSubTasks = (function(e) {
        var taskComponent = e.target.parentNode;
        var ID = taskComponent.getAttribute("task-ID");
        var name = taskComponent.getAttribute("task-name");
        var isAddLayerFlagFalse = this.getSubTasks(ID);

        if(isAddLayerFlagFalse !== false) this.taskLayerBreadCrumbControllerAPI.addLayer(ID, name);
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
        this.taskListControllerAPI.appendNewTaskToListComponent(newTaskComponent);
    }

    this.getSubTasks = function(ID, isReturnTaskComponents) {
        var subTasksID = this.taskListControllerAPI.getSubTasksID(ID);
        if(!subTasksID) return false;
        var subTasksData = TaskModel.getTasks(subTasksID);
        var tasksComponentArr = subTasksData.map((function(taskData) {
            return this.taskViewAPI.getComponent(
                taskData.ID,
                taskData.name,
                taskData.status,
                taskData.superTaskID,
                taskData.hasSubTasks
            );
        }).bind(this));

        if(isReturnTaskComponents) return tasksComponentArr;
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
        return TaskListModel.getTasksID(ID);
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
        this.taskListViewAPI.updateTaskListNodes(incompleteTaskListComponent, completedTaskListComponent);
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

    this.runApp = function() {
        var breadCrumbComponent = this.taskLayerBreadCrumbControllerAPI.getInitialComponent();
        var addTaskComponent = this.addTaskControllerAPI.getInitialComponent();
        var taskListsObj = this.taskListControllerAPI.getInitialComponents();

        this.appViewAPI.initApp(
            breadCrumbComponent,
            addTaskComponent,
            taskListsObj.incompleteList,
            taskListsObj.completedList
        );
    }
}