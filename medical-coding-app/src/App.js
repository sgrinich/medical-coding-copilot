import React from 'react'
import openai from './OpenAI'
import { useState, useEffect, useRef } from 'react'
import SendIcon from '@mui/icons-material/Send';
import './App.css'



const App = () => {
  const instructionObj = { // sent this instruction object to API every time a new conversation is started
    role: "system",
    content: "You are a highly knowledgeable medical history analyzer assistant for medical coding and billing that is always happy to help and honest"
    // content:"You are an assistant that gives very short answers".
    // content: "You are a highly sarcastic assistant."
  }

  const [conversationArr, setConversationArr] = useState([])
  const chatAreaRef = useRef(null)

  useEffect(() => {
    // Scroll to the bottom of the chat area whenever conversationArr updates
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [conversationArr]);

  const fetchReply = async () => {
    const userInput = document.getElementById('user-input').value;
    const userObj = {
      role: 'user',
      content: userInput,
    };

    setConversationArr((prevConversationArr) => [instructionObj, ...prevConversationArr, userObj]);

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-4-0613',
        messages: [...conversationArr, userObj],
        presence_penalty: 0,
        frequency_penalty: 0.3,
      });

      console.log(response);
      const responseText = response.data.choices[0].message.content;
      const newMessageObj = {
        role: 'assistant',
        content: responseText,
      };
      setConversationArr((prevConversationArr) => [...prevConversationArr, newMessageObj]);
    } catch (err) {
      console.log(err);
    }
  };

  const submitUserInput = (e) => {
    e.preventDefault() // prevent page refresh
    fetchReply() // call OpenAI chatcompletion API
    document.getElementById('user-input').value = ''
  }

  return (
    <div className='flex flex-row items-center justify-evenly m-6 p-4 min-h-screen'>
      <div className="grid grid-cols-3 gap-4 min-h-screen w-full">
        <div
          className='doctext-area col-span-2 bg-slate-300 flex items-center justify-center'>
          <h2>Doctor's Notes</h2>
          <p></p>
        </div>
        <div
          className='chat-area col-span-1 bg-slate-400 flex flex-col justify-between overflow-y-scroll h-screen' ref={chatAreaRef}>
          <h1>Copilot</h1>
          <form
            id="form"
          >
            <div className='chatbot-response m-3'>
              <div className='messages'>
                <div className='message'>
                  {/* show the robot repsponse */}
                  {conversationArr && conversationArr.map((messageObj, index) => {
                    // messageObj is like {role: "user", content: "hello"}

                    // not render role == "system"
                    if (messageObj.role !== "system") {
                      // add different class name for different role
                      if (messageObj.role === "user") {
                        return (
                          <div key={index} className='flex justify-end'>
                            <div className='message-content user-text rounded-tr-lg bg-violet-500 m-3 ' >
                              <span>{messageObj.role}: {messageObj.content}</span>
                            </div>
                          </div>
                        )
                      } else if (messageObj.role === "assistant") {
                        return (
                          <div key={index} className='flex justify-start'>
                            <div className='message-content chatbot-text rounded-bl-lg bg-violet-200 m-3'>
                              <span>{messageObj.role}: {messageObj.content}</span>
                            </div>
                          </div>
                        )
                      }

                    } else {
                      return ""
                    }


                  })}
                </div>
              </div>
            </div>

            <div className="chatbot-input-container flex justify-start p-3">
              <input
                className='w-full'
                placeholder='Type your message here...'
                name="user-input"
                type="text"
                id="user-input" required />
              <span
                onClick={submitUserInput}
                className='submit-btn p-3' >
                <SendIcon />
              </span>
            </div>


          </form >
        </div >
      </div >



    </div >

  )
}

export default App