const { addDays, set } = require('date-fns');
const cron = require('node-cron');
import { PersonalContactAiWthatsAppChatBot } from "./WhatsAppChatbot.js";
class TalkWithMomAiWhatsappChatbot extends PersonalContactAiWthatsAppChatBot
{
    constructor(client, targetChatId, prompt, model = "gpt-3.5-turbo")
    {
        this.maximum_messages_sent = 10;
        // every Monday (1) at 12:00 we schedule next time in the following week wwe say hi
        cron.schedule('0 12 * * 1', () => {
            console.log('Sunday 12:00 - Scheduling sayHi task');
            this.scheduleSayHi();
        });
    }

    async shouldAnswer()
    {
        return this.answers.length % this.maximum_messages_sent == 0
    }

    scheduleSayHi()
    {
        const now = new Date();
        const randomWeekDay = addDays(now, Math.floor(Math.random() * 7));
        // picks a random hour between 16 and 23
        const random_hour = Math.floor(Math.random() * 7) + 16
        const random_minute = Math.floor(Math.random() * 60);
        const random_second = Math.floor(Math.random() * 60);
        const scheduledDate = set(randomWeekDay, { 
            hours: random_hour, 
            minutes: random_minute, seconds: random_second 
        });

        const secondsUntilScheduled = Math.floor((scheduledDate - now) / 1000);
        console.log(`Scheduled date: ${scheduledDate}, seconds until scheduled: ${secondsUntilScheduled}`);

        if (secondsUntilScheduled > 0)
        {
            setTimeout(() => {
                this.sayHi()
            }, secondsUntilScheduled * 1000);
        }
        else
        {
            console.warn(`Scheduled date is in the past, not scheduling sayHi task`);
        }
    }

    sayHi()
    {
        console.log('Sending hi to mom right now: ', new Date());
        this.client.sendText(this.targetChatId, this.#getRandomHi()).then((result) => {
            console.log('Message sent successfully:', result);
        }).catch((error) => {
            console.error('Error when sending message:', error);
        });
    }

    //method that have 10 modern/cool ways to say hi to mom and get a random one
    #getRandomHi()
    {
        const hiList = [
            "Oi mãe, tudo certo?",
            "Oi mãe, como você está?",
            "Oi mãe, tudo tranquilo?",
            "Oi mãe, como foi seu dia?",
            "Oi mãe, tudo beleza?",
            "Oi mãe, como estão as coisas?",
            "Oi mãe, tudo em cima?",
            "Oi mãe, como vai a vida?",
            "Oi mãe, como anda a rotina?"
        ];

        return hiList[Math.floor(Math.random() * hiList.length)];
    }
}