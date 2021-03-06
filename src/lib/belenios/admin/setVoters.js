import fs from 'fs';
import path from 'path';
import log from '../../logger/log';
import { VOTERS_FILE_NAME, ELECTIONS_DIR } from '../global';

/**
 * Set the voters list of an election.
 * Return true on success.
 *
 * @param {string} electionId
 * @param {string} voters
 * @returns {boolean}
 */

function setVoters(electionId, voters) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const votersFilePath = path.join(electionDir, VOTERS_FILE_NAME);
    const votersList = voters.reduce((acc, curr) => acc.concat(curr.id, ',', curr.weight, '\n'), '');
    fs.writeFileSync(votersFilePath, votersList);
    return true;
  } catch (error) {
    log('error', error);
  }
  return false;
}

export default setVoters;
