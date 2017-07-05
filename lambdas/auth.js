/* @flow */

type AuthOptions = {
    provider: string
};

export function auth(options: AuthOptions, context: any): void {
    if (!options.provider) return context.fail(new Error('No provider specified in event object'));
    context.succeed(`{"provider": "${options.provider}"}`);
}