const TWEETS_TABLE = 'tweets'
const TWEETS_TABLE_COLUMNS_CREATE = '(user VARCHAR(100), tweet VARCHAR(140))'

const TWEETS_TABLE_COLUMNS = '(user, tweet)'

let Cmd = {}
module.exports = Cmd

Cmd.createTweetsTable = `CREATE TABLE ${TWEETS_TABLE} ${TWEETS_TABLE_COLUMNS_CREATE}`

Cmd.getTweetsTable = `SELECT rowid as id, ${TWEETS_TABLE}.* FROM ${TWEETS_TABLE}`

Cmd.insertTweet = (user, tweet) => `INSERT INTO ${TWEETS_TABLE} ${TWEETS_TABLE_COLUMNS} VALUES ( "${user}", "${tweet}")`

Cmd.updateTweet = (id, newTweet) => `UPDATE ${TWEETS_TABLE} SET tweet = "${newTweet}" WHERE rowid = "${id}"`

Cmd.deleteTweet = (id) => `DELETE FROM ${TWEETS_TABLE} WHERE rowid = "${id}"`

Cmd.getTweet = (id) => `SELECT rowid as id, ${TWEETS_TABLE}.* FROM ${TWEETS_TABLE} WHERE rowid = "${id}"`
