import React from 'react'
import openai from './OpenAI'
import { useState, useEffect } from 'react'



const App = () => {
  const instructionObj = { // sent this instruction object to API every time a new conversation is started
    role: "system",
    content: "You are a highly knowledgeable medical history analyzer assistant for medical coding and billing that is always happy to help and honest"
    // content:"You are an assistant that gives very short answers".
    // content: "You are a highly sarcastic assistant."
  }

  const [conversationArr, setConversationArr] = useState([instructionObj])

  const fetchReply = async () => {
    const userInput = document.getElementById('user-input').value;
    const userObj = {
      role: 'user',
      content: userInput,
    };

    setConversationArr((prevConversationArr) => [...prevConversationArr, userObj]);

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



  return (
    <>
      <h1>Warrior Health</h1>
      <h2>Test GPT-4 API Call</h2>
      <form
        id="form"
        className="chatbot-input-container">
        <label htmlFor="user-input">User Info:</label>
        <input name="user-input" type="text" id="user-input" required />
        <button
          onClick={(e) => {
            e.preventDefault()
            // const userInput = document.getElementById('user-input').value
            // const userObj = {
            //   role: "user",
            //   content: userInput
            // }
            // console.log(userObj)
            // setConversationArr(prevConversationArr => [...prevConversationArr, userObj])
            fetchReply()
            console.log(conversationArr)
            // clear the input field
            document.getElementById('user-input').value = ''

          }}

          id="submit-btn"
          className="submit-btn">Submit
        </button>
      </form>
      <div className='chatbot-response'>
        <h2>Chat History</h2>
        <div className='messages'>
          <div className='message'>
            {/* show the robot repsponse */}
            {conversationArr && conversationArr.map((messageObj, index) => {
              // messageObj is like {role: "user", content: "hello"}
              return (
                <div key={index}>
                  <div className='message-content'>
                    <span>{messageObj.role}: {messageObj.content}</span>
                  </div>
                </div>
              )

            })}
          </div>
        </div>
      </div>
    </>

  )
}

export default App