
import * as main from "./index";

function die(message: string) {
    console.error(message);
    process.exit(1);
}

function help() {
    console.log(`
ci-npm-update --token GITHUB_ACCESS_TOKEN --user-name NAME --user-email EMAIL --execute
    `.trim());
    process.exit();
}

function version() {
    console.log(`v${require("../package").version}`);
    process.exit();
}

async function parseOptions() {
    const options: main.Options = {
        githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,
        gitUserName: process.env.GIT_USER_NAME,
        gitUserEmail: process.env.GIT_USER_EMAIL,
        execute: false,
    };

    const args = process.argv.splice(2);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--token") {
            if (++i === args.length) {
                die(`No value for ${arg}`);
            }
            options.githubAccessToken = args[i];
        } else if (arg === "--user-name") {
            if (++i === args.length) {
                die(`No value for ${arg}`);
            }
            options.gitUserName = args[i];
        } else if (arg === "--user-email") {
            if (++i === args.length) {
                die(`No value for ${arg}`);
            }
            options.gitUserEmail = args[i];
        } else if (arg === "--execute") {
            options.execute = true;
        } else if (arg === "--list") {
            await main.listDependencies();
            process.exit();
        } else if (arg === "--help") {
            help();
        } else if (arg === "--version") {
            version();
        } else {
            die(`Unknown option: ${arg}`);
        }
    }
    return options;
}

parseOptions().then((options) => {
  return main.start(options);
}).then((pullRequestUrl) => {
    console.log("Successfully creqted a pull-request: %s", pullRequestUrl);
}).catch((reason) => {
    // handle expected reasons
    if (reason instanceof main.AllDependenciesAreUpToDate) {
        console.log("All the dependencies are up to date.");
        return;
    } else if (reason instanceof main.SkipToCreatePullRequest) {
        console.log("Skiped to create a pull-request because --execute is not specified.");
        return;
    }
    console.error(`Unexpected errors caught: ${reason.stack}`);
    process.exit(1);
});
