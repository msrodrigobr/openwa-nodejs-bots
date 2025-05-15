import 'dotenv/config.js';
import wa from '@open-wa/wa-automate';

import { PersonalContactAiWthatsAppChatBot } from './chatbots/WhatsAppChatbot.js';
import { TellAJokeGroupChatbot } from './chatbots/TellAJokeGroupChatbot.js';

const sessionDataPath = process.env.PATH_SESSION ? process.env.PATH_SESSION : './' ;

wa.create({
    useChrome: true,
    sessionId: "HomeAutomationBot",
    multiDevice: true,
    authTimeout: 60,
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: true,
    popup: true,
    qrTimeout: 0,
    sessionDataPath,
}).then(client => start(client));

async function start(client) {
    const prompt = process.env.A_PROMPT 

    const notStartsWithAi = (message) => !message.body.startsWith('[AI]');
    const cami_bot = new PersonalContactAiWthatsAppChatBot(client, process.env.FRIEND_NUMBER, prompt, 'gpt-4o-mini');
    cami_bot.ignoreMessageFilters.push(notStartsWithAi);

    const eu_bot = new PersonalContactAiWthatsAppChatBot(client, process.env.MOM_NUMBER, prompt, 'gpt-4.1');
    eu_bot.ignoreMessageFilters.push(notStartsWithAi);


    const tell_a_joke_bot = new TellAJokeGroupChatbot(client, '!piadinha');
    client.onAnyMessage(tell_a_joke_bot.onMessageReceived.bind(tell_a_joke_bot));
}