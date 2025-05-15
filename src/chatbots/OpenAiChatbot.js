import 'dotenv/config.js';
import { OpenAI } from "openai";
export class OpenAiChatBot
{
    constructor(prompt, previousContext, model = "gpt-3.5-turbo") 
    {
        this.prompt = prompt;
        this.previousContext = previousContext;
        this.model = model;
        this.responses = []
        this.receivedMessages = []
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async replyMessage(receivedMessage, additionalPrompt = "") 
    {
        let payload = {
            model: this.model,
            store: true,
        };

        // check if responses is not empty and if so add previous_response_id to payload with value of last response id
        if (this.responses.length > 0) 
        {
            payload.input = [{"role" : "user", "content": `${additionalPrompt} - Mensagem recebida: ${receivedMessage}`}]
            payload.previous_response_id = this.responses[this.responses.length - 1].id;
        }
        else
        {
            payload.input = `${this.prompt} - ${additionalPrompt} - Mensagem recebida: ${receivedMessage}` 
        }
        
        try
        {
            this.receivedMessages.push(receivedMessage)
            console.log('Answering message using OpenAi:', receivedMessage);
            console.log("Payload:", payload)
            const response = await this.openai.responses.create(payload)
            this.responses.push(response)
            return response

        } 
        catch (error) 
        {
            console.error("Error in OpenAiChatBot:", error);
            return {}
        }
    }
}

export class GroupAiChatBot extends OpenAiChatBot{
    constructor(client, group_id, prompt, previousContext, model = "gpt-3.5-turbo") 
    {
        super(prompt, previousContext, model);
        this.client = client;
        this.group_id = group_id + "@g.us";
    }
}
   