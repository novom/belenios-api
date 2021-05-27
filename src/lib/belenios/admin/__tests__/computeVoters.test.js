import fs from 'fs';
import rimfaf from 'rimraf';
import path from 'path';
import { ELECTIONS_DIR } from '../../global';
import setVoters from '../setVoters';
import makeElection from '../makeElection';
import lockVoters from '../lockVoters';
import joinElection from '../../voter/joinElection';
import vote from '../../voter/vote';
import computeVoters from '../computeVoters';

describe('Tests computeVoters', () => {
  const DEFAULT_ELECTION_ID = 'AAAAAAAAAAAAAA'; // Length need to be equal to 14 char.
  const DEFAULT_USER_ID_1 = 'bob';
  const DEFAULT_VOTERS = [
    { id: DEFAULT_USER_ID_1, weight: 1 },
    { id: 'bobby', weight: 3 },
  ];
  const DEFAULT_TEMPLATE = {
    description: 'Description of the election.',
    name: 'Name of the election',
    questions: [{
      answers: ['Answer 1', 'Answer 2'], min: 0, max: 1, question: 'Question 1?',
    }, {
      answers: ['Answer 1', 'Answer 2'], blank: true, min: 1, max: 1, question: 'Question 2?',
    }],
  };
  const DEFAULT_BALLOT = [[1, 0], [1, 0, 0]];
  const DEFAULT_SOCKET = {
    join: jest.fn(),
    privCred: undefined,
  };

  beforeEach((done) => {
    const electionPath = path.join(ELECTIONS_DIR, DEFAULT_ELECTION_ID);
    if (!fs.existsSync(electionPath)) {
      fs.mkdirSync(electionPath);
    }

    const ballot = JSON.stringify(DEFAULT_BALLOT);

    setVoters(DEFAULT_ELECTION_ID, DEFAULT_VOTERS, () => {
      lockVoters(DEFAULT_ELECTION_ID, () => {
        makeElection(DEFAULT_ELECTION_ID, JSON.stringify(DEFAULT_TEMPLATE), () => {
          joinElection(DEFAULT_ELECTION_ID, DEFAULT_USER_ID_1, DEFAULT_SOCKET, () => {
            vote(DEFAULT_ELECTION_ID, DEFAULT_SOCKET.privCred, ballot, () => {
              done();
            });
          });
        });
      });
    });
  });

  afterEach(() => {
    const electionPath = path.join(ELECTIONS_DIR, DEFAULT_ELECTION_ID);
    rimfaf.sync(electionPath);
  });

  it('Should return FAILED. Missing params', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('FAILED');
        done();
      } catch (error) {
        done(error);
      }
    }
    computeVoters(undefined, callback);
  });

  it('Should return OK and number of voters equal to 1', (done) => {
    function callback(data) {
      try {
        expect(data).toBeDefined();
        expect(data.status).toEqual('OK');
        expect(data.payload).toEqual({ nbVoters: 1, nbVotes: 1 });
        done();
      } catch (error) {
        done(error);
      }
    }
    computeVoters(DEFAULT_ELECTION_ID, callback);
  });
});
