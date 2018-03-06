exports.curryClient = (func, client) => func.bind(null, [client])
