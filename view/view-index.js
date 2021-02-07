
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
    this.initApp = function(breadCrumb, taskAdder, incompleteList, completedList) {
        var appComponent = document.getElementById("app");

        appComponent.appendChild(AppHeading());
        appComponent.appendChild(breadCrumb);
        appComponent.appendChild(taskAdder);
        appComponent.appendChild(incompleteList);
        appComponent.appendChild(completedList);
    }
}



function AppHeading() {
    var headingComponent = document.createElement("h2");

    headingComponent.id = "app-heading";
    headingComponent.innerText = "TODOS APP";

    return headingComponent;
}



function TaskLayerBreadCrumbView() {
    this.getSubTaskOfLayerHandler = null;

    this.loadEventHandlers = function(handlers) {
        this.getSubTaskOfLayerHandler = handlers.getSubTaskOfLayer;
    }

    this.layerDownTo = function(taskID, breadCrumbComponent) {
        var lastChild = breadCrumbComponent.lastChild;
        while(lastChild.getAttribute("layer-ID") !== taskID) {
            breadCrumbComponent.removeChild(lastChild);
            lastChild = breadCrumbComponent.lastChild;
        }
        lastChild.lastChild.onclick = null;
    }
    this.layerUp = function(ID, name) {
        var breadCrumbComponent = document.querySelector(`[node-ref=${BREAD_CRUMB_NODE_REF}]`);
        var layerNode = document.createElement("span");
        var layerNameNode = document.createElement("span");
        var layerDividerNode = document.createElement("span");

        layerNode.setAttribute("layer-ID", ID);

        layerDividerNode.innerText = " / ";
        layerDividerNode.className = "task-level-layer-divider";

        layerNameNode.innerText = name;
        layerNameNode.className = "task-level-layer-name";

        breadCrumbComponent.lastChild.lastChild.onclick = this.getSubTaskOfLayerHandler;
        if(name !== "HOME") {
            layerNode.appendChild(layerDividerNode);
        }
        layerNode.appendChild(layerNameNode);

        breadCrumbComponent.appendChild(layerNode);
    }

    this.getIDofLastLayer = function() {
        var breadCrumbComponent = document.querySelector(`[node-ref=${BREAD_CRUMB_NODE_REF}]`);

        return breadCrumbComponent.lastChild.getAttribute("layer-ID");
    }
    this.getComponent = function() {
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
    this.addTaskButtonClickHandler = null;
    this.addTaskInputChangeHandler = null;

    this.loadEventHandlers = function(handlers) {
        this.addTaskButtonClickHandler = handlers.onAddTaskButtonClick;
        this.addTaskInputChangeHandler = handlers.onAddTaskInputChange;
    }

    this.getComponent = function() {
        var addTaskComponent = document.createElement('div');
        var addTaskInput = document.createElement('input');
        var addTaskButton = document.createElement('button');

        addTaskButton.id = "add-task-button";
        addTaskButton.innerText = "Add task";
        addTaskButton.addEventListener("click", this.addTaskButtonClickHandler);

        addTaskInput.id = "add-task-input";
        addTaskInput.setAttribute("reference-ID", "add-task-input");
        addTaskInput.placeholder = "New task";
        addTaskInput.addEventListener("keyup", this.addTaskInputChangeHandler);
        addTaskInput.autofocus = true;

        addTaskComponent.id = "add-task";
        addTaskComponent.appendChild(addTaskInput);
        addTaskComponent.appendChild(addTaskButton);

        return addTaskComponent;
    }
}



function TaskView() {
    this.removeTaskHandler = null;
    this.switchStatusHandler = null;
    this.addSubTasksHandler = null;
    this.editTaskNameHandler = null;
    this.getSubTasksHandler = null;

    this.loadEventHandlers = function(handlers) {
        this.removeTaskHandler = handlers.onRemoveTask;
        this.switchStatusHandler = handlers.onChangeStatus;
        this.addSubTasksHandler = handlers.onAddSubTasks;
        this.editTaskNameHandler = handlers.onEditButtonClick;
        this.getSubTasksHandler = handlers.onGetSubTasks;
        this.editorInputChangeHandler = handlers.onEditorInputChange;
    }

    this.switchStatus = function(taskComponent, newStatus) {
        var statusSwitchButton = taskComponent.querySelector(".task-status-switch");

        taskComponent.setAttribute("task-status", newStatus);
        statusSwitchButton.innerHTML = STATUS_SWITCH_NAME[newStatus];
    }
    this.editTaskName = function(taskComponent, newName) {
        var taskNameNode = taskComponent.querySelector(".task-name");

        taskComponent.setAttribute("task-name", newName);
        taskNameNode.innerText = newName;
    }
    this.renderNewNameNode = function(inputNode) {
        var taskComponent = inputNode.parentNode;
        var newName = inputNode.value.trim() === "" ? taskComponent.getAttribute("task-name") : inputNode.value;
        var newNameNode = document.createElement("span");

        newNameNode.innerText = newName;
        newNameNode.addEventListener("click", this.getSubTasksHandler);
        newNameNode.className = "task-name";
        taskComponent.setAttribute("task-name", newName);
        inputNode.replaceWith(newNameNode);
    }
    this.renderEditorInput = function(nameNode) {
        var editInput = document.createElement("input");

        editInput.value = nameNode.innerText;
        editInput.addEventListener('change', this.editorInputChangeHandler);
        nameNode.replaceWith(editInput);
    }

    this.getComponent = function(ID, name, status, superTaskID, hasSubTasks) {
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
        addSubTasksNode.addEventListener('click', this.addSubTasksHandler);

        taskName.className = "task-name";
        if(hasSubTasks) taskName.addEventListener("click", this.getSubTasksHandler);
        taskName.innerText = name;

        taskNameEditButton.className = "task-edit";
        taskNameEditButton.addEventListener("click", this.editTaskNameHandler);
        taskNameEditButton.innerText = "Edit";

        taskRemoveButton.className = "task-remove";
        taskRemoveButton.addEventListener("click", this.removeTaskHandler);
        taskRemoveButton.innerText = "Remove";

        taskStatusSwitchButton.className = "task-status-switch";
        taskStatusSwitchButton.addEventListener("click", this.switchStatusHandler);
        taskStatusSwitchButton.innerText = STATUS_SWITCH_NAME[status];
        if(this.hasSubTasks) taskStatusSwitchButton.disabled = true;

        taskComponent.appendChild(addSubTasksNode);
        taskComponent.appendChild(taskName);
        taskComponent.appendChild(taskNameEditButton);
        taskComponent.appendChild(taskRemoveButton);
        taskComponent.appendChild(taskStatusSwitchButton);

        return taskComponent;
    }
}



function TaskListView() {
    this.appendTaskNode = function(listType, taskNode) {
        var taskList = document.querySelector(`[node-ref=${listType}${_TASKS_LIST}]`);

        taskList.appendChild(taskNode);
    }

    this.removeTaskNode = function(taskNode) {
        taskNode.parentNode.removeChild(taskNode);
    }

    this.updateTaskListNodes = function(updatedIncompleteList, updatedCompletedList) {
        var appComponent = document.getElementById("app");
        var incompleteList = appComponent.querySelector(`[node-ref=incomplete${_TASKS_LIST}]`);
        var completedList = appComponent.querySelector(`[node-ref=completed${_TASKS_LIST}]`);

        incompleteList.replaceWith(updatedIncompleteList);
        completedList.replaceWith(updatedCompletedList);
    }

    this.getComponent = function(listType, taskNodes) {
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