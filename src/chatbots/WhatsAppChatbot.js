import { OpenAiChatBot } from "./OpenAiChatbot.js";
export class WhatsAppChatbot
{
    constructor(client, targetChatId)
    {
        this.client = client;
        // throws error if targetChatId is not defined or empty
        if (!targetChatId || targetChatId === "")
        {
            throw new Error("targetChatId is not defined or empty");
        }
        this.targetChatId = targetChatId;
        this.loggedUserId = null;
    }

    async getLoggedUserId()
    {
        if (!this.loggedUserId) 
        {
            this.loggedUserId = await this.client.getMe().id;
        }
        return this.loggedUserId;
    }
}

export class PersonalContactAiWthatsAppChatBot extends WhatsAppChatbot
{
    constructor(client, targetChatId, prompt, model = "gpt-3.5-turbo", 
            aichatbot = new OpenAiChatBot(prompt, null, model)) 
    {
        super(client, targetChatId + "@c.us");
        this.aichatbot = aichatbot;
        this.receivedMessages = [];
        this.messagesBuffer = []
        this.bufferLocked = false;
        this.answers = [];
        this.ignoreMessageFilters = [];
        this.answerPrefix = null;
        this.timeToThinkinMs = 10000;

        setInterval(() => this.#answerMessagens(), this.timeToThinkinMs);
        client.onAnyMessage(this.onMessageReceived.bind(this));
    }

    #addMessageToBuffer(message)
    {   
        this.#lockBufferAndExecute(() => {
            this.messagesBuffer.push(message);
        });
    }

    #answerMessagens()
    {
        // if buffer is empty, return
        if (this.messagesBuffer.length === 0) return;
        
        if (this.shouldAnswer())
        {
            const messages = this.#lockBufferAndExecute(() => {
                const copy = [...this.messagesBuffer];
                this.messagesBuffer = [];
                return copy;
            });
            
            this.answerMessages(messages);
        }
    }

    #lockBufferAndExecute(func)
    {
        while(this.bufferLocked)
        {
            console.log("Buffer is locked, waiting...");
            // wait for buffer to be unlocked
            setTimeout(() => {}, 100);
        }

        this.bufferLocked = true;
        try 
        {
            return func();
        } 
        finally
        {
            this.bufferLocked = false;
        }

    }

    async onMessageReceived(message)
    {
        const baseFilters = [
            (message) => this.answerPrefix && message.body.startsWith(this.answerPrefix),
            (message) => message.isGroupMsg || message.sender.id !== this.targetChatId, //|| message.from === message.to,
            (message) => message.body.startsWith("/") || message.body.startsWith("!") || message.body.startsWith("#"),
            (message) => ["ptt", "audio", "image"].includes(message.type)
        ];

        for (const filter of baseFilters)
        {
            if (filter(message)) 
            {
                console.log(`[Chatbot:${this.targetChatId}] Message ${message} rejected by base filter: ${filter.toString()}`);
                return;
            }
        }

        for (const filter of this.ignoreMessageFilters)
        {
            if (filter(message)) 
            {
                console.log(`Message ${message} rejected by user defined filter: ${filter.toString()}`);
                return;
            }
        }

        try 
        {
            this.#addMessageToBuffer(message);
            this.receivedMessages.push(message);
        } 
        catch (error) 
        {
            console.error("Error in PersonalContactAiChatBot answering message:", error);
        }
    }

    async answerMessages(messages)
    {
        let messagesToAnswer = messages.map(message => message.body).join(". ");
        const rawAnswer = await this.aichatbot.replyMessage(messagesToAnswer);
        console.log('Response from OpenAI:', rawAnswer);
        let answer = {};
        if (rawAnswer.output_text)
        {
            try
            {
                answer = JSON.parse(this.#handleAiOutputTextReturn(rawAnswer.output_text));
            }
            catch (error)
            {
                console.error("Error parsing JSON:", error);
            }
        }

        // prompt somehow needs to ensure that propert json response is returned
        if (answer.value && answer.value !== "")
        {
            this.#sendAnswer(messages, answer.value);
        }
        else if (answer.message && answer.message !== "")
        {
            this.#sendAnswer(messages, answer.message);
        }
        
        if (answer.todo && answer.todo !== "") 
        {
            const messageToSelf = `Pedido de Acao recebido: ${answer.todo} - De: ${messages[0].sender.pushname}`;
            console.log(messageToSelf);
            await this.client.sendText(messages[0].to, messageToSelf);
        }
    }

    #sendAnswer(messages, answer)
    {
        this.answers.push(answer);
        console.log("Answering with message:", answer);
        this.client.sendText(messages[0].chatId, answer)
            .then((result) => {
                console.log('Message sent successfully:', result);
            })
            .catch((error) => {
                console.error('Error when sending message:', error);
            });
    }

    #handleAiOutputTextReturn(output_text)
    {
        return output_text.trim();
    }


    async shouldAnswer()
    {
        // always true for base class, but can be overridden in subclasses
        // to implement custom logic
        return true;
    }
}