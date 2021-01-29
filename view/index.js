var INVERSE = {
    completed: "incomplete",
    incomplete: "completed",
};

var appView = new (function AppView() {
    var taskListViewInstance = new TaskListView();
    var taskLayerBreadCrumbViewInstance = new TaskLayerBreadCrumbView();

    this.getTaskListViewInstance = function() {
        return taskListViewInstance;
    }
    this.getTaskLayerBreadCrumbViewInstance = function() {
        return taskLayerBreadCrumbViewInstance;
    }

    this.fetchSubTaskList = function(taskID, taskName) {
        var subTaskList = taskListController.fetchTaskList(taskID);

        taskListViewInstance.setTasks(subTaskList);
        taskLayerBreadCrumbViewInstance.addLayer(taskID, taskName);
    }
    this.updateSubTaskList = function(task) {
        var ID = task.ID;
        var name = task.name;
        var superTaskID = task.superTaskID;
        var status = task.status;
        taskListController.updateTaskList({ID: ID, name: name, status: status, superTaskID: superTaskID});
    }
    this.putNewTaskToList = function(superTaskID, taskName) {
        taskListController.putNewTask(superTaskID, taskName);
    }

    this.initAppView = function() {
        var appComponent = document.getElementById("app");

        taskLayerBreadCrumbViewInstance.addLayer("HOME", "HOME");

        appComponent.appendChild(appHeadingView());
        appComponent.appendChild(taskLayerBreadCrumbViewInstance.render());
        appComponent.appendChild(addTaskView());
        appComponent.appendChild(taskListViewInstance.render());
    }
})();


function MakeReRenderable(constructor) {
    Object.assign(constructor.prototype, MakeReRenderable.prototype);
}
MakeReRenderable.prototype.reRender = function() {
    var parentNode = this.node.parentNode;
    var currentNode = this.node;
    parentNode.replaceChild(currentNode, this.render());
}
MakeReRenderable.prototype.render = function() {}



function appHeadingView() {
    var headingComponent = document.createElement("h2");

    headingComponent.innerText = "TODOS APP";
    headingComponent.className = "app-heading";

    return headingComponent;
}
function addTaskView() {
    var addTaskComponent = document.createElement('div');
    var addTaskInput = document.createElement('input');
    var addTaskButton = document.createElement('button');

    function addTaskHandler(e) {
        var isButton = e.target.tagName.toUpperCase() === "BUTTON";
        var taskName = isButton ? e.target.previousSibling.value : e.target.value;
        var taskListViewInstance = appView.getTaskListViewInstance();

        taskListViewInstance.addTask(taskName);
    }

    addTaskButton.id = "add-task-button";
    addTaskButton.innerText = "Add task";
    addTaskButton.addEventListener("click", addTaskHandler);

    addTaskInput.id = "add-task-input";
    addTaskInput.placeholder = "New task name";
    addTaskInput.addEventListener("change", addTaskHandler);

    addTaskComponent.id = "add-task";
    addTaskComponent.appendChild(addTaskInput);
    addTaskComponent.appendChild(addTaskButton);

    return addTaskComponent;
}



function TaskLayerBreadCrumbView() {
    this.layers = [];
    this.node = null;
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskLayerBreadCrumbView);

TaskLayerBreadCrumbView.prototype.goToLayerHandler = function(e) {
    var taskID = e.target.getAttribute("task-ID");
    var taskName = e.target.innerText;
    var layerIndex = this.layers.findIndex(function(layer) {
        return layer.ID === taskID;
    });

    this.layers = this.layers.slice(0, layerIndex);
    this.reRender();
    appView.fetchSubTaskList(taskID, taskName);
}
TaskLayerBreadCrumbView.prototype.getNewLayer = function(layerID, layerName) {
    var layerNode = document.createElement('div');
    var layerNameNode = document.createElement('span');
    var layerNameDivider = document.createElement('span');

    layerNode.className = "layer-level";

    layerNameNode.innerText = layerName;
    layerNameNode.className = "layer-level-name";
    layerNameNode.setAttribute("task-ID", `${layerID}`);

    layerNameDivider.innerText = " / ";
    layerNameDivider.className = "layer-level-divider";

    layerNode.appendChild(layerNameNode);
    layerNode.appendChild(layerNameDivider);

    return layerNode;
}
TaskLayerBreadCrumbView.prototype.addLayer = function(taskID, taskName) {
    if(this.node !== null) {
        var currentLastLayerNode = this.node.lastChild;
        var layerNameNode = currentLastLayerNode.firstChild;
        layerNameNode.addEventListener("click", this.goToLayerHandler.bind(this));
        layerNameNode.className = layerNameNode.className + " " + "clickable-text";
    }

    this.layers.push({ID: taskID, name: taskName});
    this.node.appendChild(this.getNewLayer(taskID, taskName));
}
TaskLayerBreadCrumbView.prototype.render = function() {
    var breadCrumbNode = document.createElement("div");

    breadCrumbNode.id = "task-layer-level-nav";
    this.layers.forEach(function(layer) {
        breadCrumbNode.appendChild(this.getNewLayer(layer.ID, layer.name));
    });

    this.node = breadCrumbNode;
    return this.node;
}



function TaskView(ID, name, status, superTaskID, onRemoveTask, onSwitchStatus) {
    this.ID = ID
    this.name = name;
    this.status = status;
    this.superTaskID = superTaskID;
    this.onRemoveTask = onRemoveTask;
    this.onSwitchStatus = onSwitchStatus;
    this.node = null;
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskView);

TaskView.prototype.removeHandler = function(e) {
    appView.getTaskListViewInstance().onRemoveTask(this.ID, e.target.parentNode);
}
TaskView.prototype.statusSwitchHandler = function(e) {
    this.status = INVERSE[this.status];
    appView.updateSubTaskList(this);
    appView.getTaskListViewInstance().onSwitchStatus(this.ID, this.status);
    this.reRender();
}
TaskView.prototype.getSubTaskListHandler = function(e) {
    var taskLayerBreadCrumb = appView.getTaskLayerBreadCrumbViewInstance();
    appView.fetchSubTaskList(this.ID, this.name);
}
TaskView.prototype.editHandler = function(e) {
    var editInput = document.createElement("input");

    editInput.value = e.target.innerText;
    editInput.addEventListener('change', function(evt) {
        if(evt.target.value.trim() !== "") e.target.innerText = evt.target.value;
        evt.target.parentNode.replaceChild(e.target, evt.target);
    });
    e.target.parentNode.replaceChild(editInput, e.target);
}
TaskView.prototype.render = function() {
    var taskComponent = document.createElement("div");
    var taskName = document.createElement("div");
    var taskRemoveButton = document.createElement("button");
    var taskStatusSwitchButton = document.createElement("button");
    var taskNameEditButton = document.createElement("button");

    taskComponent.className = "task-container";
    taskComponent.setAttribute("reference-ID", `${this.ID}`);

    taskName.className = "task-name";
    taskName.addEventListener("click", this.getSubTaskListHandler.bind(this));
    taskName.innerText = this.name;

    taskNameEditButton.className = "task-edit";
    taskNameEditButton.addEventListener("click", this.editHandler.bind(this));
    taskNameEditButton.innerText = "Edit";

    taskRemoveButton.className = "task-remove";
    taskRemoveButton.addEventListener("click", this.removeHandler.bind(this));
    taskRemoveButton.innerText = "Remove";

    taskStatusSwitchButton.className = "task-status-switch";
    taskStatusSwitchButton.addEventListener("click", this.statusSwitchHandler.bind(this));
    taskStatusSwitchButton.innerText = "Mark Completed";

    this.node = taskComponent;

    return this.node;
};



function TaskListView() {
    this.listSuperTaskID = null;
    this.tasks = null;
    this.node = null;
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskListView);

TaskListView.prototype.onAddTask = function(taskName) {
    var task = appView.putNewTaskToList(this.listSuperTaskID, taskName);
    var taskComponent = new TaskView(
        task.ID,
        task.name,
        task.status,
        task.superTaskID,
        this.onRemoveTask.bind(this),
        this.onSwitchStatus.bind(this)
    )
}
TaskListView.prototype.onRemoveTask = function(taskID, taskComponent) {
    this.tasks.filter(function(task) {
        return task.ID !== taskID;
    });
    this.node.removeChild(taskComponent);
    taskListController.updateTaskList(this.listSuperTaskID, this.tasks);
}
TaskListView.prototype.onSwitchStatus = function(taskID, newStatus) {
    var taskIndex = this.tasks.findIndex(function(task) {
        return task.ID = taskID;
    });
    this.tasks[taskIndex].status = newStatus;
}
TaskListView.prototype.setTasks = function(newTasks) {
    this.tasks = newTasks;
    if(this.tasks.length) this.listSuperTaskID = this.tasks[0].superTaskID;
    this.reRender();
}
TaskListView.prototype.render = function() {
    var taskListComponent = document.createElement('div');
    var taskListArr = this.tasks;

    taskListComponent.id = 'task-list';
    taskListComponent.setAttribute('reference-ID', 'task-list');

    taskListArr.forEach(function(task) {
        var taskComponent = new Task(
            task.ID,
            task.name,
            task.status,
            task.superTaskID,
            this.onRemoveTask.bind(this),
            this.onSwitchStatus.bind(this)
        );
        taskListComponent.appendChild(taskComponent.render());
    });
    this.node = taskListComponent;

    return this.node;
}