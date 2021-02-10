

function TaskLayerBreadCrumbController() {
    var taskLayerBreadCrumbViewAPI = null;
    var taskControllerAPI = null;

    var addLayer = function(ID, name) {
        taskLayerBreadCrumbViewAPI.layerUp(ID, name);
    };
    var getSubTaskOfLayer = function(e) {
        var layerNode = e.target.parentNode;
        var taskID = layerNode.getAttribute("layer-ID");

        taskControllerAPI.getSubTasks(taskID);
        taskLayerBreadCrumbViewAPI.layerDownTo(taskID, layerNode.parentNode);
    };
    var getInitialComponent = function() {
        return taskLayerBreadCrumbViewAPI.getComponent();
    };
    var getLastLayerID = function() {
        return taskLayerBreadCrumbViewAPI.getIDofLastLayer();
    }

    this.initExternalAPIs = function(taskControllerApi, taskLayerBreadCrumbViewApi) {
        taskControllerAPI = taskControllerApi;
        taskLayerBreadCrumbViewAPI = taskLayerBreadCrumbViewApi;
    }
    this.getAPIforAppController = function() {
        return {
            getInitialComponent: getInitialComponent,
        }
    }
    this.getAPIforTaskController = function() {
        return {
            addLayer: addLayer,
        }
    }
    this.getAPIforAddTaskController = function() {
        return {
            getLastLayerID: getLastLayerID,
        }
    }
    this.getAPIforTaskLayerBreadCrumbView = function() {
        return {
            getSubTaskOfLayer: getSubTaskOfLayer,
        }
    }
}


function AddTaskController() {
    var addTaskViewAPI = null;
    var taskControllerAPI = null;
    var taskLayerBreadCrumbControllerAPI = null;

    this.initExternalAPIs = function(taskControllerApi, addTaskViewApi, taskLayerBreadCrumbControllerApi) {
        taskControllerAPI = taskControllerApi;
        addTaskViewAPI = addTaskViewApi;
        taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerApi;
    }
    this.getAPIforAppController = function() {
        return {
            getInitialComponent: getInitialComponent,
        }
    }
    this.getAPIforAddTaskView = function() {
        return {
            onAddTaskButtonClick: onAddTaskButtonClick,
            onAddTaskInputChange: onAddTaskInputChange,
        }
    }

    function onAddTaskButtonClick(e) {
        console.log("ON ADD TASK BUTTON CLICK");
        var taskName = e.target.previousSibling.value;
        if(taskName.trim() === "") return;
        e.target.previousSibling.value = "";
        var superTaskID = taskLayerBreadCrumbControllerAPI.getLastLayerID();
        taskControllerAPI.createNewTask(taskName, superTaskID);
    };

    function onAddTaskInputChange(e) {
        console.log("ON ADD TASK INPUT CHANGE");
        if(e.keyCode !== 13) return;
        var taskName = e.target.value;
        if(taskName.trim() === "") return;
        e.target.value = "";
        var superTaskID = taskLayerBreadCrumbControllerAPI.getLastLayerID();
        taskControllerAPI.createNewTask(taskName, superTaskID);
    };

    function getInitialComponent() {
        return addTaskViewAPI.getComponent();
    };
}



function TaskController() {
    var taskViewAPI = null;
    var taskListControllerAPI = null;
    var taskLayerBreadCrumbControllerAPI = null;

    this.initExternalAPIs = function(taskListControllerApi, taskViewApi, taskLayerBreadCrumbControllerApi) {
        taskListControllerAPI = taskListControllerApi;
        taskViewAPI = taskViewApi;
        taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerApi;
    }
    this.getAPIforTaskLayerBreadCrumbController = function() {
        return {
            getSubTasks: getSubTasks,
        }
    };
    this.getAPIforAddTaskController = function() {
        return {
            createNewTask: createNewTask,
        }
    };
    this.getAPIforTaskListController = function() {
        return {
            getSubTasks: getSubTasks,
        }
    };
    this.getAPIforTaskView = function() {
        return {
            onRemoveTask: onRemoveTask,
            onChangeStatus: onChangeStatus,
            onEditorInputChange: onEditorInputChange,
            onEditButtonClick: onEditButtonClick,
            onAddSubTasks: onAddSubTasks,
            onGetSubTasks: onGetSubTasks,
        }
    }

    function onRemoveTask(e) {
        var taskComponent = e.target.parentNode;
        var superTaskID = taskComponent.getAttribute("super-task-ID");
        var taskID = taskComponent.getAttribute("task-ID");
        var response = TaskModel.deleteTask(taskID);

        if(response.ID) taskListControllerAPI.removeTaskFromListComponent(taskComponent);
    }

    function onChangeStatus(e) {
        var taskComponent = e.target.parentNode;
        var status = taskComponent.getAttribute("task-status");
        var ID = taskComponent.getAttribute("task-ID");
        var response = TaskModel.updateTask("status", INVERT_STATUS[status], ID);

        if(response !== "FAILURE") {
            taskViewAPI.switchStatus(taskComponent, response.status);
            taskListControllerAPI.switchTaskStatus(taskComponent);
        }
    }

    function onEditorInputChange(e) {
        var inputNode = e.target;
        var newName = inputNode.value;
        var ID = inputNode.parentNode.getAttribute("task-ID");

        if(newName.trim() !== "") {
            TaskModel.updateTask("name", newName, ID);
        }
        taskViewAPI.renderNewNameNode(inputNode);
    };

    function onEditButtonClick(e) {
        var nameNode = e.target.previousSibling;

        taskViewAPI.renderEditorInput(nameNode);
    };

    function onAddSubTasks(e) {
        var taskComponent = e.target.parentNode;
        var ID = taskComponent.getAttribute("task-ID");
        var name = taskComponent.getAttribute("task-name");
        var taskData = TaskModel.getTask(ID);

        taskLayerBreadCrumbControllerAPI.addLayer(ID, name);
        if(taskData.hasSubTasks) getSubTasks(ID);
        else taskListControllerAPI.setTaskList([]);
    };

    function onGetSubTasks(e) {
        var taskComponent = e.target.parentNode;
        var ID = taskComponent.getAttribute("task-ID");
        var name = taskComponent.getAttribute("task-name");
        var isAddLayerFlagFalse = getSubTasks(ID);

        if(isAddLayerFlagFalse !== false) taskLayerBreadCrumbControllerAPI.addLayer(ID, name);
    }

    function createNewTask(name, superTaskID) {
        var task = TaskModel.createNewTask(name, superTaskID);
        var newTaskComponent = taskViewAPI.getComponent(
            task.ID,
            task.name,
            task.status,
            task.superTaskID,
            task.hasSubTasks
        );
        taskListControllerAPI.appendNewTaskToListComponent(newTaskComponent);
    }

    function getSubTasks(ID, isReturnTaskComponents) {
        var subTasksID = taskListControllerAPI.getSubTasksID(ID);
        if(!subTasksID) return false;
        var subTasksData = TaskModel.getTasks(subTasksID);
        var tasksComponentArr = subTasksData.map(function(taskData) {
            return taskViewAPI.getComponent(
                taskData.ID,
                taskData.name,
                taskData.status,
                taskData.superTaskID,
                taskData.hasSubTasks
            );
        });

        if(isReturnTaskComponents) return tasksComponentArr;
        taskListControllerAPI.setTaskList(tasksComponentArr);
    }
}




function TaskListController() {
    var taskListViewAPI = null;
    var taskControllerAPI = null;

    this.initExternalAPIs = function(taskListViewApi, taskControllerApi) {
        taskListViewAPI = taskListViewApi;
        taskControllerAPI = taskControllerApi;
    }
    this.getAPIforAppController = function() {
        return {
            getInitialComponent: getInitialComponent,
        }
    };
    this.getAPIforTaskController = function() {
        return {
            removeTaskFromListComponent: removeTaskFromListComponent,
            switchTaskStatus: switchTaskStatus,
            appendNewTaskToListComponent: appendNewTaskToListComponent,
            setTaskList: setTaskList,
            getSubTasksID: getSubTasksID,
        }
    };

    function getSubTasksID(ID) {
        return TaskListModel.getTasksID(ID);
    }
    function removeTaskFromListComponent(taskNode) {
        taskListViewAPI.removeTaskNode(taskNode);
    }
    function appendNewTaskToListComponent(taskNode) {
        taskListViewAPI.appendTaskNode("incomplete", taskNode);
    }
    function switchTaskStatus(taskNode) {
        if(taskNode.getAttribute("task-status") === "completed") {
            taskListViewAPI.removeTaskNode(taskNode);
            taskListViewAPI.appendTaskNode("completed", taskNode);
        } else {
            taskListViewAPI.removeTaskNode(taskNode);
            taskListViewAPI.appendTaskNode("incomplete", taskNode);
        }
    }
    function setTaskList(taskNodesArr, isReturnComponents) {
        var completedTaskNodes = [];
        var incompleteTaskNodes = [];

        taskNodesArr.forEach(function(taskNode) {
            if(taskNode.getAttribute("task-status") === "completed") completedTaskNodes.push(taskNode);
            else incompleteTaskNodes.push(taskNode);
        });

        var incompleteTaskListComponent = taskListViewAPI.getComponent("incomplete", incompleteTaskNodes);
        var completedTaskListComponent = taskListViewAPI.getComponent("completed", completedTaskNodes);

        if(isReturnComponents) return {
            incompleteList: incompleteTaskListComponent,
            completedList: completedTaskListComponent,
        };
        taskListViewAPI.updateTaskListNodes(incompleteTaskListComponent, completedTaskListComponent);
    }
    function getInitialComponent() {
        var homeTasks = TaskListModel.getTasksList("HOME");

        if(homeTasks !== null) {
            var taskNodesArr = taskControllerAPI.getSubTasks("HOME", true);

            return setTaskList(taskNodesArr, true);
        }
        return setTaskList([], true);
    };
}



function AppController() {
    var appViewAPI = null;
    var taskLayerBreadCrumbControllerAPI = null;
    var addTaskControllerAPI = null;
    var taskListControllerAPI = null;

    this.initExternalAPIs = function(appViewApi, taskLayerBreadCrumbControllerApi, addTaskControllerApi, taskListControllerApi) {
        appViewAPI = appViewApi;
        taskLayerBreadCrumbControllerAPI = taskLayerBreadCrumbControllerApi;
        addTaskControllerAPI = addTaskControllerApi;
        taskListControllerAPI = taskListControllerApi;
    }

    this.runApp = function() {
        var breadCrumbComponent = taskLayerBreadCrumbControllerAPI.getInitialComponent();
        var addTaskComponent = addTaskControllerAPI.getInitialComponent();
        var taskListsObj = taskListControllerAPI.getInitialComponent();

        appViewAPI.initApp(
            breadCrumbComponent,
            addTaskComponent,
            taskListsObj.incompleteList,
            taskListsObj.completedList
        );
    }
}