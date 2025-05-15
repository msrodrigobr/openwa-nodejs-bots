import { CommandActivatedChatbot } from './CommandActivatedChatbot.js';

export class TellAJokeGroupChatbot extends CommandActivatedChatbot {
    constructor(client, command) {
        super(client, command, null, [(message) => !message.chatId.endsWith('@g.us')]);
    }

    async handleCommandAction(message) {
        console.log('Fetching joke...');
        const response = await fetch('https://v2.jokeapi.dev/joke/Programming,Pun');
        const data = await response.json();
        if (data) {
            let joke = '';
            if (data.setup && data.delivery) {
                joke = `Essa é uma merda: ${data.setup} - ${data.delivery}`;
            }
            else if (data.joke) {
                joke = `Nao quero nem ver: ${data.joke}`;
            }

            this.client.reply(message.chatId, joke, message.id);
        }

        else {
            console.log('No joke found or invalid response format');
        }
    }
}
