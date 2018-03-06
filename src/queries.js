const {selectAll, whereId} = require('./sqls')

exports.rootQueryById = (id) => ({
  query: `${selectAll} ${whereId}`,
  parameters: [{name: '@id', value: id}]
})

exports.rootQueryAll = (id) => ({
  query: `${selectAll}`
})
