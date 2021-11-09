import { execSync } from 'child_process';
import path from 'path';
import log from '../../logger/log';
import { ELECTIONS_DIR, PRIVATE_CREDS_FILE_NAME } from '../global';

/**
 *
 * @param {String} electionId
 * @returns
 */

function computeVoters(electionId) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const privCredFilePath = path.join(electionDir, PRIVATE_CREDS_FILE_NAME);
    const voters = execSync(`bash src/scripts/computeVoters.sh ${privCredFilePath} ${electionDir}`).toString();
    const votersArray = voters.split('\n').filter((voter) => voter);
    const votes = votersArray.map((voter) => voter.split(',')[1]).filter((vote) => vote);
    const votersCount = votersArray.length;
    const votesCount = votes.reduce((total, voter) => Number(voter) + Number(total), 0);
    return {
      votersCount,
      votesCount,
    };
  } catch (error) {
    log('error', error);
  }
  return undefined;
}

export default computeVoters;