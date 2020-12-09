/**
 * This file is part of Stevelabs.
 *
 * @copyright (c) 2020, Steve Guidetti, https://github.com/stevotvr
 * @license MIT
 *
 * For full license information, see the LICENSE.txt file included with the source.
 */

'use strict'

/**
 * Provides the leaderboard commands.
 */
export default class LeaderboardCommand {

  /**
   * Constructor.
   *
   * @param {Commands} commands The main command module
   */
  constructor(commands) {
    this.app = commands.app;
    this.db = commands.app.db.db;

    commands.leaderboard = this.leaderboard;
    commands.rank = this.rank;
  }

  async leaderboard(user, args = []) {
    const count = (args.length > 0 && args[0].match(/\d+/)) ? args[0] : 5;
    this.db.all('SELECT user FROM userstats ORDER BY chats + trivia * 10 DESC LIMIT ?', count, (err, rows) => {
      if (err) {
        console.warn('error getting leaderboard data');
        console.log(err);

        return;
      }

      const names = rows.map((e) => e.user);
      this.app.chatbot.say(`/me Top ${count} users: ${names.join(', ')}.`);
    });
  }

  async rank(user, args = []) {
    const target = args[0] ? args[0] : user;
    this.db.get('SELECT COUNT(user) AS rank FROM userstats WHERE chats + trivia * 10 >= (SELECT chats + trivia * 10 FROM userstats WHERE user = ?)', target.toLowerCase(), (err, row) => {
      if (err) {
        console.warn('error getting leaderboard rank data');
        console.log(err);

        return;
      }

      if (!row || row.rank < 1) {
        return;
      }

      if (args[0]) {
        this.app.chatbot.say(`/me User ${target} is ranked #${row.rank}.`);
      } else {
        this.app.chatbot.say(`@${target} You are ranked #${row.rank}.`);
      }
    });
  }
}