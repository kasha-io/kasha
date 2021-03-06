const { Reader } = require('nsqjs')
const logger = require('./logger')

const singleton = {
  reader: null,

  connect(topic, channel, options) {
    singleton.reader = new Reader(topic, channel, options)

    singleton.reader.on('error', err =>
      logger.error({ err }, 'NSQ reader error.')
    )

    singleton.reader.connect()
    return singleton.reader
  },

  close() {
    return new Promise((resolve, reject) => {
      logger.warn('Closing NSQ reader connection...')

      if (!singleton.reader || singleton.reader.connectionIds.length === 0) {
        return _resolve()
      }

      singleton.reader.on('nsqd_closed', () => {
        if (singleton.reader.connectionIds.length === 0) {
          return _resolve()
        }
      })

      singleton.reader.on('error', reject)
      singleton.reader.close()

      function _resolve() {
        logger.warn('NSQ reader connection closed.')
        resolve()
      }
    })
  }
}

module.exports = singleton
