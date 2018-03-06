const {rootQueryById, rootQueryAll} = require('./queries')

module.exports = () => {
  const dbLinks = {}
  const collectionLinks = {}
// Utils
  const curryClient = (func, client) => func.bind(null, client)
  const getCollectionName = (dbName, collectionName) => `${dbName}/${collectionName}`

/**
 * Get Database Link (Memoized)
 * @param {documentdbClient} client
 * @param {String} dbName
 * @returns {Promise}
 */
  const getDatabaseLink = (client, dbName) => {
    const link = dbLinks[dbName]
    if (link) {
      return Promise.resolve(link)
    }
    return new Promise((resolve, reject) => {
      client.queryDatabases(rootQueryById(dbName))
    .toArray((err, results) => {
      if (err) {
        reject(err)
        return
      }
      const result = results[0]
      if (result) {
        dbLinks[dbName] = result._self
      }
      resolve(dbLinks[dbName])
    })
    })
  }

/**
 * Get Collection Link (Memoized)
 * @param {documentdbClient} client
 * @param {String} dbLink
 * @param {String} collectionName
 * @returns {Promise}
 */
  const getCollectionLink = (client, dbName, collectionName) => {
    const collectionLookupName = getCollectionName(dbName, collectionName)
    const link = collectionLinks[collectionLookupName]
    if (link) {
      return Promise.resolve(link)
    }
    return getDatabaseLink(client, dbName)
    .then((dbLink) => {
      if (typeof dbLink === 'undefined') {
        console.log('DB Link is undefined')
        return Promise.reject(new Error('Db Link is undefined.  Make sure your db name is correct'))
      }
      return new Promise((resolve, reject) => {
        client.queryCollections(dbLink, rootQueryById(collectionName))
        .toArray((err, results) => {
          if (err) {
            reject(err)
          }
          const result = results[0]
          if (result) {
            collectionLinks[collectionLookupName] = result._self
          }
          resolve(collectionLinks[collectionLookupName])
        })
      })
    })
  }

  /**
   * Get All Documents from a collection
   * @param {documentdbClient} client
   * @param {String} dbName
   * @param {String} collectionName
   * @returns {Promise}
   */
  const getAllDocsInCollection = (client, dbName, collectionName) => {
    return getCollectionLink(client, dbName, collectionName)
    .then((collectionLink) => new Promise((resolve, reject) => {
      client.queryDocuments(collectionLink, rootQueryAll())
        .toArray((err, result) => {
          if (err) {
            reject(err)
          }
          resolve(result)
        })
    })
    )
  }

  return {
    getDatabaseLink,
    getCollectionLink,
    getAllDocsInCollection,
    curryClient
  }
}
