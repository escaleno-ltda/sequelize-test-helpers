const sinon = require('sinon')
const hooks = require('./constants/hooks')

const createModel = (attributes, options = {}) => {
  const model = function() {}
  model.modelName = options.modelName

  const attachHook = name => hook => {
    if (!model.prototype.hooks)
      model.prototype.hooks = options.hooks || /* istanbul ignore next  */ {}
    model.prototype.hooks[name] = hook
  }

  const attachProp = key => {
    model.prototype[key] = attributes[key]
  }

  hooks.forEach(hook => {
    model[hook] = attachHook(hook)
  })

  model.addHook = (hookType, name, hook) =>
    typeof name === 'function'
      ? attachHook(hookType)(name)
      : attachHook(hookType)(hook)

  model.hook = model.addHook

  model.belongsToMany = sinon.spy()
  model.belongsTo = sinon.spy()
  model.hasMany = sinon.spy()
  model.hasOne = sinon.spy()

  model.isHierarchy = sinon.spy()

  model.prototype.update = sinon.stub()
  model.prototype.reload = sinon.stub()
  model.prototype.set = sinon.spy()
  Object.keys(attributes).forEach(attachProp)

  model.prototype.indexes = options.indexes
  return model
}
class Model {
  static init(attributes, options = {}) {
    if (!options.modelName) options.modelName = this.name
    return createModel(attributes, options)
  }
}

const sequelize = {
  define: (modelName, modelDefn, metaData = {}) => {
    metaData.modelName = modelName
    return createModel(modelDefn, metaData)
  },
  Sequelize: { Model }
}

module.exports = sequelize
