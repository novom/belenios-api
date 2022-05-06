import { execSync } from 'child_process';
import path from 'path';
import { ELECTIONS_DIR } from '../global';
import log from '../../logger/log';

/**
 *
 * @param {String} electionId
 * @param {String} privCred
 * @param {Object} ballot
 * @returns
 */

function vote(electionId, privCred, ballot) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const stringifyBallot = JSON.stringify(ballot);
    const encryptedBallot = execSync(`bash src/scripts/vote.sh ${privCred} ${stringifyBallot} ${electionDir}`).toString();
    return encryptedBallot;
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default vote;
