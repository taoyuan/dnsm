import {Logger} from "../logger";
import {execute} from "../executor";
import program = require('caporal');

const pkg = require('../../package');

program.version(pkg.version);

const handleError = (err, logger: Logger) => {
  logger.error(err.message || err);
  if (err.stack) {
    logger.debug();
    logger.debug(err.stack);
  }
  process.exit(1);
};

export function updyn(argv) {
  program
    .description('Dynamic update domain ip records')
    .argument('[provider]', 'Specify the dns provider')
    .argument('[domains]', 'Specify the domains to execute, could be list')
    .option('-t, --type', 'Specify the entry type', ['A', 'AAAA'], 'A')
    .option('-l, --ttl', 'Specify the record time-to-live', program.INT, 300)
    .option('-c, --conf', 'Path to the updyn configuration file')
    .option('-U, --user', 'Specify the auth username for some provider')
    .option('-P, --pass', 'Specify the auth password for some provider')
    .option('-T, --token', 'Specify the auth token for some provider')
    .option('-S, --secret', 'Specify the auth secret for some provider')
    .action(async function (args, opts, logger: Logger) {
      try {
        // @ts-ignore
        await execute('updyn', {...args, ...opts}, logger);
      } catch (e) {
        handleError(e, logger);
      }
    });

  program.parse(argv);
}
