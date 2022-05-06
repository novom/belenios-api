import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { TEMPLATE_FILE_NAME, ELECTIONS_DIR, GROUP_FILE_PATH } from '../global';
import log from '../../logger/log';

function stringifyTemplate(template) {
  const {
    description,
    name,
    questions,
  } = template;

  const stringifyDescription = JSON.stringify(description);
  const stringifyName = JSON.stringify(name);
  const stringifyQuestions = questions.map(({
    answers,
    max,
    min,
    question,
  }) => ({
    answers: answers.map((answer) => JSON.stringify(answer)),
    max,
    min,
    question: JSON.stringify(question),
  }));

  return JSON.stringify({
    description: stringifyDescription,
    name: stringifyName,
    questions: stringifyQuestions,
  });
}

/**
 *
 * @param {String} electionId
 * @param {Object} template
 * @returns
 */

function makeElection(electionId, template) {
  try {
    const electionDir = path.join(ELECTIONS_DIR, electionId);
    const templateFilePath = path.join(electionDir, TEMPLATE_FILE_NAME);
    fs.writeFileSync(templateFilePath, stringifyTemplate(template));
    execSync(`bash src/scripts/makeElection.sh ${electionId} ${templateFilePath} ${GROUP_FILE_PATH} ${electionDir}`);
    return true;
  } catch (error) {
    log('error', error);
  }
  return false;
}

export default makeElection;
