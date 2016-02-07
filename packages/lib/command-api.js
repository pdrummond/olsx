Command = function() {
    this._commands = {};
    this._components = {};
};

Command.prototype.defineCommand = function(commandName, fn) {
    if (this.commandExists(commandName)) {
        throw new Meteor.Error('Error.  There is already a command associated with the name ', '"' + commandName + '".');
    }
    this._commands[commandName] = fn;
};

Command.prototype.defineComponent = function(componentName, fn) {

    if (this.commandExists(componentName)) {
        throw new Meteor.Error('Error.  There is already a component associated with the name ', '"' + componentName + '".');
    }
    this._components[componentName] = fn;
};

Command.prototype.getComponent = function(componentName) {
    if (!this.componentExists(componentName)) {
        throw new Meteor.Error('Error: There is no component associated with the name ', '"' + componentName + '".');
    }
    return this._components[componentName];
};

Command.prototype.commandExists = function(commandName) {
    return commandName in this._commands;
};

Command.prototype.componentExists = function(componentName) {
    return componentName in this._components;
};
Command.prototype.executeCommand = function(commandName, args, message) {
    return this._commands[commandName]({
        args,
        conversationId: message.conversationId,
        message
    });
};

Ols.Command = new Command();