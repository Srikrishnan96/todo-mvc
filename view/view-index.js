
var COMPLETED = "completed";
var INCOMPLETE = "incomplete";

var STATUS_SWITCH_NAME = {
    completed: "Mark incomplete",
    incomplete: "Mark completed"
}

var INVERT_STATUS = {
    completed: INCOMPLETE,
    incomplete: COMPLETED,
};

var _TASKS_LIST = "-tasks-list";
var BREAD_CRUMB_NODE_REF = "task-level-bread-crumb";


function AppView() {
    function initApp(breadCrumb, taskAdder, incompleteList, completedList) {
        var appComponent = document.getElementById("app");

        appComponent.appendChild(AppHeading());
        appComponent.appendChild(breadCrumb);
        appComponent.appendChild(taskAdder);
        appComponent.appendChild(incompleteList);
        appComponent.appendChild(completedList);
    }

    this.getAPIforAppController = function() {
        return {
            initApp: initApp,
        }
    }
}



function AppHeading() {
    var headingComponent = document.createElement("h2");

    headingComponent.id = "app-heading";
    headingComponent.innerText = "TODOS APP";

    return headingComponent;
}



function TaskLayerBreadCrumbView() {
    var getSubTaskOfLayerHandler = null;

    this.loadEventHandlers = function(handlers) {
        getSubTaskOfLayerHandler = handlers.getSubTaskOfLayer;
    }
    this.getAPIforTaskLayerBreadCrumbController = function() {
        return {
            layerDownTo: layerDownTo,
            layerUp: layerUp,
            getIDofLastLayer: getIDofLastLayer,
            getComponent: getComponent,
        }
    }

    function layerDownTo(taskID, breadCrumbComponent) {
        var lastChild = breadCrumbComponent.lastChild;
        while(lastChild.getAttribute("layer-ID") !== taskID) {
            breadCrumbComponent.removeChild(lastChild);
            lastChild = breadCrumbComponent.lastChild;
        }
        lastChild.lastChild.onclick = null;
    }
    function layerUp(ID, name) {
        var breadCrumbComponent = document.querySelector(`[node-ref=${BREAD_CRUMB_NODE_REF}]`);
        var layerNode = document.createElement("span");
        var layerNameNode = document.createElement("span");
        var layerDividerNode = document.createElement("span");

        layerNode.setAttribute("layer-ID", ID);

        layerDividerNode.innerText = " / ";
        layerDividerNode.className = "task-level-layer-divider";

        layerNameNode.innerText = name;
        layerNameNode.className = "task-level-layer-name";

        breadCrumbComponent.lastChild.lastChild.onclick = getSubTaskOfLayerHandler;
        if(name !== "HOME") {
            layerNode.appendChild(layerDividerNode);
        }
        layerNode.appendChild(layerNameNode);

        breadCrumbComponent.appendChild(layerNode);
    }

    function getIDofLastLayer() {
        var breadCrumbComponent = document.querySelector(`[node-ref=${BREAD_CRUMB_NODE_REF}]`);

        return breadCrumbComponent.lastChild.getAttribute("layer-ID");
    }
    function getComponent() {
        var breadCrumbComponent = document.createElement("div");
        var homeLayerNode = document.createElement("span");
        var homeLayerNameNode = document.createElement("span");

        homeLayerNode.setAttribute("layer-ID", "HOME");

        homeLayerNameNode.innerText = "HOME";
        homeLayerNameNode.className = "task-level-layer-name";

        homeLayerNode.appendChild(homeLayerNameNode);

        breadCrumbComponent.setAttribute("node-ref", BREAD_CRUMB_NODE_REF);
        breadCrumbComponent.id = "task-level-bread-crumb";

        breadCrumbComponent.appendChild(homeLayerNode);

        return breadCrumbComponent;
    }
}



function AddTaskView() {
    var addTaskButtonClickHandler = null;
    var addTaskInputChangeHandler = null;

    this.loadEventHandlers = function(handlers) {
        addTaskButtonClickHandler = handlers.onAddTaskButtonClick;
        addTaskInputChangeHandler = handlers.onAddTaskInputChange;
    }

    this.getAPIforAddTaskController = function() {
        return {
            getComponent: getComponent,
        }
    }

    function getComponent() {
        var addTaskComponent = document.createElement('div');
        var addTaskInput = document.createElement('input');
        var addTaskButton = document.createElement('button');

        addTaskButton.id = "add-task-button";
        addTaskButton.innerText = "Add task";
        addTaskButton.addEventListener("click", addTaskButtonClickHandler);

        addTaskInput.id = "add-task-input";
        addTaskInput.setAttribute("reference-ID", "add-task-input");
        addTaskInput.placeholder = "New task";
        addTaskInput.addEventListener("keyup", addTaskInputChangeHandler);
        addTaskInput.autofocus = true;

        addTaskComponent.id = "add-task";
        addTaskComponent.appendChild(addTaskInput);
        addTaskComponent.appendChild(addTaskButton);

        return addTaskComponent;
    }
}



function TaskView() {
    var removeTaskHandler = null;
    var switchStatusHandler = null;
    var addSubTasksHandler = null;
    var editTaskNameHandler = null;
    var getSubTasksHandler = null;
    var editorInputChangeHandler = null;

    this.loadEventHandlers = function(handlers) {
        removeTaskHandler = handlers.onRemoveTask;
        switchStatusHandler = handlers.onChangeStatus;
        addSubTasksHandler = handlers.onAddSubTasks;
        editTaskNameHandler = handlers.onEditButtonClick;
        getSubTasksHandler = handlers.onGetSubTasks;
        editorInputChangeHandler = handlers.onEditorInputChange;
    }

    this.getAPIforTaskController = function() {
        return {
            switchStatus: switchStatus,
            editTaskName: editTaskName,
            renderNewNameNode: renderNewNameNode,
            renderEditorInput: renderEditorInput,
            getComponent: getComponent,
        }
    }

    function switchStatus(taskComponent, newStatus) {
        var statusSwitchButton = taskComponent.querySelector(".task-status-switch");

        taskComponent.setAttribute("task-status", newStatus);
        statusSwitchButton.innerHTML = STATUS_SWITCH_NAME[newStatus];
    }
    function editTaskName(taskComponent, newName) {
        var taskNameNode = taskComponent.querySelector(".task-name");

        taskComponent.setAttribute("task-name", newName);
        taskNameNode.innerText = newName;
    }
    function renderNewNameNode(inputNode) {
        var taskComponent = inputNode.parentNode;
        var newName = inputNode.value.trim() === "" ? taskComponent.getAttribute("task-name") : inputNode.value;
        var newNameNode = document.createElement("span");

        newNameNode.innerText = newName;
        newNameNode.addEventListener("click", getSubTasksHandler);
        newNameNode.className = "task-name";
        taskComponent.setAttribute("task-name", newName);
        inputNode.replaceWith(newNameNode);
    }
    function renderEditorInput(nameNode) {
        var editInput = document.createElement("input");

        editInput.value = nameNode.innerText;
        editInput.addEventListener('change', editorInputChangeHandler);
        nameNode.replaceWith(editInput);
    }

    function getComponent(ID, name, status, superTaskID, hasSubTasks) {
        var taskComponent = document.createElement("div");
        var addSubTasksNode = document.createElement("span");
        var taskName = document.createElement("span");
        var taskRemoveButton = document.createElement("button");
        var taskStatusSwitchButton = document.createElement("button");
        var taskNameEditButton = document.createElement("button");

        taskComponent.className = "task-container";
        taskComponent.setAttribute("task-ID", ID);
        taskComponent.setAttribute("super-task-ID", superTaskID);
        taskComponent.setAttribute("task-name", name);
        taskComponent.setAttribute("task-status", status);

        addSubTasksNode.innerText = 'add';
        addSubTasksNode.className = 'material-icons';
        addSubTasksNode.addEventListener('click', addSubTasksHandler);

        taskName.className = "task-name";
        if(hasSubTasks) taskName.addEventListener("click", getSubTasksHandler);
        taskName.innerText = name;

        taskNameEditButton.className = "task-edit";
        taskNameEditButton.addEventListener("click", editTaskNameHandler);
        taskNameEditButton.innerText = "Edit";

        taskRemoveButton.className = "task-remove";
        taskRemoveButton.addEventListener("click", removeTaskHandler);
        taskRemoveButton.innerText = "Remove";

        taskStatusSwitchButton.className = "task-status-switch";
        taskStatusSwitchButton.addEventListener("click", switchStatusHandler);
        taskStatusSwitchButton.innerText = STATUS_SWITCH_NAME[status];
        if(hasSubTasks) taskStatusSwitchButton.disabled = true;

        taskComponent.appendChild(addSubTasksNode);
        taskComponent.appendChild(taskName);
        taskComponent.appendChild(taskNameEditButton);
        taskComponent.appendChild(taskRemoveButton);
        taskComponent.appendChild(taskStatusSwitchButton);

        return taskComponent;
    }
}



function TaskListView() {

    this.getAPIforTaskListController = function() {
        return {
            appendTaskNode: appendTaskNode,
            removeTaskNode: removeTaskNode,
            updateTaskListNodes: updateTaskListNodes,
            getComponent: getComponent,
        }
    }

    function appendTaskNode(listType, taskNode) {
        var taskList = document.querySelector(`[node-ref=${listType}${_TASKS_LIST}]`);

        taskList.appendChild(taskNode);
    }

    function removeTaskNode(taskNode) {
        taskNode.parentNode.removeChild(taskNode);
    }

    function updateTaskListNodes(updatedIncompleteList, updatedCompletedList) {
        var appComponent = document.getElementById("app");
        var incompleteList = appComponent.querySelector(`[node-ref=incomplete${_TASKS_LIST}]`);
        var completedList = appComponent.querySelector(`[node-ref=completed${_TASKS_LIST}]`);

        incompleteList.replaceWith(updatedIncompleteList);
        completedList.replaceWith(updatedCompletedList);
    }

    function getComponent(listType, taskNodes) {
        var taskListComponent = document.createElement("div");
        var headingNode = document.createElement("h4");

        headingNode.innerText = listType.toUpperCase();

        taskListComponent.setAttribute("node-ref", listType+"-tasks-list");
        taskListComponent.appendChild(headingNode);

        taskNodes.forEach(function(taskNode) {
            taskListComponent.appendChild(taskNode);
        });

        return taskListComponent;
    }
}