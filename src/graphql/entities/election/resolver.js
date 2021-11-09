import closeElection from '../../../lib/belenios/admin/closeElection';
import openElection from '../../../lib/belenios/admin/openElection';
import clearElectionDir from '../../../lib/helpers/clearElectionsDir';
import electionFilesToObject from '../../../lib/helpers/electionFilesToObject';
import electionObjectToFiles from '../../../lib/helpers/electionObjectToFiles';
import joinElection from '../../../lib/belenios/voter/joinElection';
import { Election, Vote } from '../../../models';
import { BALLOTS_FILE_NAME } from '../../../lib/belenios/global';
import computeVoters from '../../../lib/belenios/admin/computeVoters';

const resolver = {
  Query: {
    getElections: async (_, { ids }) => Election.batchGet(ids),
    getElection: async (_, { id }) => Election.get(id),
  },
  Mutation: {
    openElection: async (_, { votersList, template }) => {
      clearElectionDir();
      const electionId = openElection(votersList, template);
      const electionFiles = electionFilesToObject(electionId);
      const election = {
        id: electionId,
        files: electionFiles,
        status: 'OPEN',
        votesSentCount: 0,
      };
      await Election.put(election);
      return electionId;
    },
    closeElection: async (_, { id }) => {
      async function tryCloseElection(election, retries) {
        if (retries <= 0) return undefined;

        const {
          id: electionId,
          votesSentCount,
          files,
        } = election;
        const ballots = await Vote.UNSAFE_getAllElectionVotes(id);
        const totalVotesVersions = ballots.reduce((acc, { version }) => (acc + version), 0);

        if (totalVotesVersions === votesSentCount) {
          const ballotFile = {
            content: ballots.map(({ ballot }) => ballot).join(''),
            name: BALLOTS_FILE_NAME,
          };

          clearElectionDir();
          electionObjectToFiles(electionId, [...files, ballotFile]);
          const result = closeElection(electionId);

          await Election.update(electionId, { result: result[0] });

          return result[0];
        }

        return tryCloseElection(retries - 1);
      }

      await Election.update(id, { status: 'CLOSED' });

      const election = await Election.get(id, { ConsistentRead: true });

      return election.electionResult || tryCloseElection(election, 3);
    },
    computeVoters: async (_, { id }) => {
      const election = await Election.get(id);
      const ballots = await Vote.UNSAFE_getAllElectionVotes(id);

      const ballotFile = {
        content: ballots.map(({ ballot }) => ballot).join(''),
        name: BALLOTS_FILE_NAME,
      };

      clearElectionDir();
      electionObjectToFiles(election.id, [...election.files, ballotFile]);

      return computeVoters(id);
    },
    joinElection: async (_, { id, userId }) => {
      const election = await Election.get(id);

      clearElectionDir();
      electionObjectToFiles(election.id, election.files);

      return joinElection(id, userId);
    },
  },
};

export default resolver;