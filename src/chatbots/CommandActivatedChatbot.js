export class CommandActivatedChatbot
{
    constructor(client, command, commandParameters = null, extraRejectFilters = [])
    {
        this.client = client;
        this.command = command;
        this.commandParameters = commandParameters;
        this.extraRejectFilters = extraRejectFilters;
        client.onAnyMessage(this.onMessageReceived.bind(this));
    }

    async onMessageReceived(message)
    {
        console.log(`Message received ${message.body} - fromMe? ${message.fromMe} - isGroupMsg: ${message.isGroupMsg} - chatId: ${message.chatId} - sender: ${message.sender.id} - to: ${message.to}`);
        if (message.body === this.command || (this.commandParameters && message.body.startsWith(this.command))) 
        {
            console.log(`Command "${this.command}" received from ${message.sender.pushname}`);

            for (const filter of this.extraRejectFilters)
            {
                if (filter(message)) 
                {
                    console.log(`Message rejected by filter: ${filter.toString()}`);
                    return;
                }
            }
            console.log(`Handling command "${this.command}" action...`);
            this.handleCommandAction(message)
        }
    }

    async handleCommandAction(message)
    {
        throw new Error('Method "handleCommandAction(message)" must be implemented by subclass');
    }
}