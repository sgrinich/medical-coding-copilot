import React from "react";
import openai from "./OpenAI";
import { useState, useEffect, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import "./App.css";

// // import the codes.json file here
// import codes from './codes.json'
// console.log(codes['cpt-codes']);
// const generated_code = ["86152", "86153",];
// const allExist = generated_code.every(element => codes['cpt-codes'].includes(element));
// console.log(allExist);

const App = () => {
  const instructionObj = {
    // sent this instruction object to API every time a new conversation is started
    role: "system",
    content:
      "You are a highly knowledgeable medical history analyzer assistant for medical coding and billing that is always happy to help and honest",
    // content:"You are an assistant that gives very short answers".
    // content: "You are a highly sarcastic assistant."
  };

  const [conversationArr, setConversationArr] = useState([]);
  const [medCode, setMedCode] = useState("");
  const chatAreaRef = useRef(null);
  const [userInput, setUserInput] = useState("");
  const [furtherQuestion, setFurtherQuestion] = useState("");
  const [predefinedQuestions, setPredefinedQuestions] = useState([
    "According to this note I provided, analyze this patient's condition.",
    "What are the CPT codes?",
    "Explain why you chose these CPT codes.",
    "What are the ICD-10 codes?",
    "Explain why you chose these ICD-10 codes.",
  ]);
  // Add this state variable at the top of your component
  const [questionVisibility, setQuestionVisibility] = useState(
    Array(predefinedQuestions.length).fill(true)
  );

  useEffect(() => {
    // Scroll to the bottom of the chat area whenever conversationArr updates
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }

    if (conversationArr.length === 0) {
      setQuestionVisibility(Array(predefinedQuestions[0]));
    }
  }, [conversationArr]);

  // const userInput = document.getElementById('user-input').value;
  console.log(userInput);

  const fetchReply = async (userInput) => {
    const userObj = {
      role: "user",
      content: userInput,
    };

    setConversationArr((prevConversationArr) => [
      instructionObj,
      ...prevConversationArr,
      userObj,
    ]);

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4-0613",
        // model: 'gpt-3.5-turbo-0301',
        messages: [...conversationArr, userObj],
        presence_penalty: 0,
        frequency_penalty: 0.3,
      });

      console.log(response);
      const responseText = response.data.choices[0].message.content;
      const newMessageObj = {
        role: "assistant",
        content: responseText,
      };
      setConversationArr((prevConversationArr) => [
        ...prevConversationArr,
        newMessageObj,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  // generate further question to display to user
  const fetchFurtherQuestion = async () => {
    // get further question according to last assistant response and set furtherQuestion state variable
    const lastAssistantResponse =
      conversationArr[conversationArr.length - 1].content;
    const userObj = {
      role: "user",
      content: `< ${lastAssistantResponse} > according to this response, think about a further question you think the user is probably going to ask and curious about. remember just include the question itself, without any extra sentence like "I think you are going to ask" or "I think you are curious about". just the question itself.`,
    };
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4-0613",
        // model: 'gpt-3.5-turbo-0301',
        messages: [...conversationArr, userObj],
        presence_penalty: 0,
        frequency_penalty: 0.3,
      });
      const responseText = response.data.choices[0].message.content;
      setFurtherQuestion(responseText);
    } catch (err) {
      console.log(err);
    }
  };

  // useeffect to display updated further question to user everytime we got a new assistant response, not user input
  useEffect(() => {
    if (
      conversationArr.length > 0 &&
      conversationArr[conversationArr.length - 1].role === "assistant"
    ) {
      fetchFurtherQuestion();
    }
  }, [conversationArr]);

  // on key press enter down, submit user input
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline from being inserted
      submitUserInput(e);

      const textArea = document.querySelector("user-input");
      const textRowCount = textArea ? textArea.value.split("\n").length : 0;
      const rows = textRowCount + 1;
    }
  };

  const submitUserInput = (e) => {
    e.preventDefault(); // prevent page refresh
    // set userInput state variable to be the value of the input field, id=  user-input
    const userInput = document.getElementById("user-input").value; // access input field value correctly
    setUserInput(userInput);
    fetchReply(userInput); // call OpenAI chatcompletion API
    document.getElementById("user-input").value = ""; // clear input field
  };

  const fetchMedCode = async () => {
    const docTextInput = document.getElementById("doc-text-input").value;
    const promptObj = {
      role: "system",
      content: `You are a highly knowledgeable medical chat history analyzer assistant for medical coding and billing that is always happy to help and honest and good at extract CPT codes, which identify services rendered, as well as ICD-10 codes, which represent patient diagnoses from long doctor visit chat notes. You will never hallucinate and make up non-existent icd-code or cpt-code. I will give you examples of chat notes and formatted output code below and you will generate the completion. 
        ###
        <Note Start ->:
        INITIAL SUBJECTIVE
        9/22/22: The patient initially reports being a hair stylist. She states she’s had R carpal tunnel for “years”. She states the first time she noticed the carpal tunnel was 12 years ago when she was packing/moving. Her arm was going numb so she saw her MD and was dx with carpal tunnel. She has done a lot to manage the carpal tunnel. She has done exercises and changed her posture. The carpal tunnel hasn’t been very problematic over the past 2 years. She wants to be able to build upper body strength, but everything she tries to do causes shoulder pain and UE N/T. She has been trying to do push-ups and cycling and that causes soreness and numbness. However, she states over the past 2 months she has been biking more and “new, disruptive things” are happening in the L arm now. She c/o pain with raising her arm over her head as well as putting pressure on her wrist. She went on a 200 mi cycling trip in September and the first day was fine, but the second day she felt she put a lot of weight on her arms and she felt N/T in the last 2 fingers of the L arm when she finished. She states the fingers stayed numb for “ages.” She bought padded bike gloves. She states she can tell hands/fingers are in a “fragile state.” She can feel it when she has her arms up to dry hair at work. She is riding a hybrid bike. She splits her time between SF and Virginia and has a similar bike in both areas. She feels the L shoulder pain when she raises her shoulder. The longer she has her arm over her hand, then her hand will be “angry the rest of the day” (ie changing a lightbulb). She denies waking up with N/T in her hands. Patient is R hand dominant
        
        PMH: Patient notes “lifelong back pain”, she started a hip stretching program recently and hasn’t had pain since then
        
        Pain Ratings
        3/10 Current
        
        Red Flags: N/T in hands
        
        OBJECTIVE
        Observation: The patient presents in therapy with L shoulder elevation, forward head and shoulders, R pec tighter than L pec, lumbar lordosis, anterior pelvic tilt
        
        Palpation: NT
        
        Cervical AROM
        - Flex/Ext: WNL / 25% limited (a little bit of N/T in L fingers)
        - RSB/LSB: WNL
        - Rrot/Lrot: WNL
        
        Shoulder AROM
        * flex: WNL, “tweak in L shdr” 
        * abd: WNL, L shdr catches on way down
        * MR: WNL
        * LR: WNL
        
        MMT/Strength:
        * grip: “feels pretty even”
        
        Special Tests:
        * Neers: (-)
        * Hawkins: (-)
        * Speeds: (-)
        * Empty Can: (-)
        * Crossover: (-)
        * Painful Arc: (+)L
        
        Neuro: ULNT (+) L ulnar
        
        Rx: Patient gave consent to treat
        - HEP including: LAX pecs, shdr blades, UTs; foam roller UE; ulnar nerve glide
        
        ASSESSMENT
        The patient presents in therapy with signs and symptoms consistent with ULNT in the ulnar distribution as well as possible L shoulder/RC irritation from performing repetitive movements being a hair stylist. Patient would benefit from further therapy to address limitations in cervical ROM, postural strength, soft tissue release in pecs/UE, and postural re-education (mid-back, core/hips, hip flexor stretching, pelvic tilting). Patient had no adverse reactions to treatment. HEP was issued.
        
        GOALS
        “To learn how to clam the inflammation of the nerves as well as build upper body strength without making things worse.”
        
        PLAN
        Plan to see patient in 2 weeks to progress treatment. 
        <Note end ->
        
        <Code result -> :
        ‘’’
        ICD-10 codes: G56, M25.512, and S53.02XA.
        CPT codes: 97110, 97112, and 97162.
        ‘’’
        ###
        <Note Start ->:
        INITIAL SUBJECTIVE
        10/3/22: The patient initially reports seeing 2 PTs in the past year for a wrist issue. Both PTs felt it was shoulder related as she is a hair stylist. She has cubital tunnel syndrome, which only bothers her at night. She wears braces at night, which seems to eliminate her N/T. She states the N/T does wake her at night. She also has an elbow brace that keeps her elbow straight at night, but sometimes she takes that off. She notices R hand N/T in the last 2 fingers. She knows she sleeps with her arms/hands curled up. She was given lat exercises, but she still has pain in the heel of her R hand. She is unable to bear weight through the R hand. She feels her ROM is limited and it causes pain. Pushing and pulling motion hurt it. If she tries to do a chest press, it can cause pain for a few days. 
        
        She hasn’t had a nerve conduction study, but she has had a wrist/elbow X-ray which was unremarkable. She denies any imaging on the neck. 
        
        PMH: She was in a car accident 2 years ago. She states she was driving and colliding with another car that was turning out of an alley. Her car was hit on the passenger side. 10 years ago, also had a MVA and was rear-ended at a stoplight. She can’t remember if her airbag deployed. She states she didn’t lose consciousness. She has seen 2 “hand/wrist” doctors and they felt it was muscular vs neurologic. 
        
        Pain Ratings
        2-3/10 with repetitive motions
        
        Red Flags: N/T, had some weakness with first in-person PT sessions, but improved with lat exercises
        
        OBJECTIVE
        Observation: The patient presents in therapy with a forward head and shoulders posture, R pec tighter than L pec
        
        Palpation: Self-palpation reveals R UT TTP, R elbow extensor mass, triceps
        
        Cervical ROM
        - Flex/Ext: WNL / WNL
        - RSB/LSB: 25% limited (“tight”)
        - Rrot/Lrot: 10% limited (“tight”)
        
        Shdr ROM
        flex: WNL
        abd: WNL, R side feels “clunky” and “pops a lot”
        LR: WNL
        MR: ~T7 (R tighter than L)
        
        MMT/Strength: Patient notes grip is grossly equal
        
        Neuro:
        ULNT: R ulnar is “really tight” compared to L, but not N/T; median N is present with B hands, R > L
        
        Rx: Patient gave consent to treat
        - HEP including: lacrosse ball to UT, pecs, scaps, forearms; ulnar and median nerve glides
        
        ASSESSMENT
        The patient presents in therapy with signs and symptoms consistent with ulnar nerve pathology due to positive neural tension testing in addition to poor posture and a job that requires repetitive movements. Patient would benefit from further therapy to address limitations in cervical and wrist ROM, UE/postural strengthening, soft tissue release in neck, shoulders and upper back, and postural re-education. Patient had no adverse reactions to treatment. HEP was issued via our platform.
        
        GOALS
        To be symptom-free with her job, at night and to be able to weight-bear through the UEs.
        
        PLAN
        Plan to see patient in 2 weeks to progress treatment.
        <Note end ->
        
        <Code result -> :
        ICD-10 codes: S54.0 and X50.1. 
        CPT codes: 97110, 97112, and 971621.
        ###
        <Note Start ->:
        INITIAL SUBJECTIVE
        11/9/22: The patient initially reports an insidious onset of L anterior hip pain since March, 2022. She states she was bouldering and she doesn’t remember anything crazy during, but afterwards she had alot of pain afterwards and even had trouble walking. She was resting after that and started to do some banded strengthening exercises for her hips and gluts. Running, climbing and certain moves that require a higher foot placement (like hiking/backpacking) also bother it. Rest makes it feel better. The pain starts in the front of the L hip and can sometimes “wrap around” to the side of the hip. H/o R PFP and a tailbone injury most recently. She has been doing her old PT exercises.
        
        SLEEP: in general 8 hr sleeper, good sleep hygiene
        NUTRITION: “pretty good”, gets good macros, veggies, protein, but has a sweet tooth
        EXERCISE: See above
        STRESS: Has a new job and partner, so having some transitional stress, but she feels she is doing ok, goes to therapy and meditates
        
        Pain Ratings
        1/10 Current
        6/10 Worst
        
        Red Flags: Denies N/T, B&B changes, recent fever, etc
        
        OBJECTIVE
        Observation: The patient presents in therapy R shoulder elevation (R hand Dom), tight pecs L > R, appears to be rotating to the R, anterior pelvic tilt/lumbar lordosis, fwd head and shoulder. Increased genu valgum on L knee. L foot is slightly MR compared to R foot. R foot hallux valgus. R kneecap is higher than L. L anterior inn.
        
        Palpation: Self-palpation reveals no TTP at the PSIS, lateral hips, or hip flexors
        
        Trunk ROM
        - Flex/Ext: 25% limited / 50% limited
        - RSB/LSB: 25% limited
        - Rrot/Lrot: 25% limited 
        
        Functional
        - Overhead Squat: shifting away from L hip (feels R knee)
        
        Special Tests: FABER L side tighter (feels tighter too)
        
        Neuro: NT
        
        Rx: Patient gave consent to treat
        - HEP including: B LE foam rolling, lacrosse ball to gluts, TFL, glut med
        
        
        ASSESSMENT
        The patient presents in therapy with signs and symptoms consistent with possible L hip flexor irritation. Patient would benefit from further therapy to address limitations in L hip joint mobility/ROM, LE/core strength, soft tissue mobility to thighs, calves, and postural reeducation. Patient had no adverse reactions to treatment. HEP was issued.
        
        GOAL
        Exercise routine to use to strengthen/stabilize and prevent flare ups
        
        PLAN
        Plan to see patient in 2 weeks to progress treatment.
        <Note end ->
        <Code result -> :
        ICD-10 codes: M25.552.
        CPT codes: 97110, 97112, and 7161.

        <Note start ->:
        ${docTextInput}
        <Note end ->
        <Code result ->:
        `,
    };
    const userInputObj = {
      role: "user",
      content: `According to this note I provided, analyze this patient's condition. `,
    };

    setConversationArr((prevConversationArr) => [
      promptObj,
      ...prevConversationArr,
      userInputObj,
    ]);
    // const updatedConversationArr = [promptObj, ...conversationArr, userInputObj];
    // setConversationArr(updatedConversationArr);
    // setConversationArr((prevConversationArr) => {
    //   const updatedConversationArr = [promptObj, ...prevConversationArr, userInputObj];
    //   return updatedConversationArr;
    // });
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4-0613",
        // model: 'gpt-3.5-turbo-0301',
        messages: [...conversationArr, userInputObj],
        presence_penalty: 0,
        frequency_penalty: 0.3,
      });

      console.log(response);
      const medCodeTextResponse = response.data.choices[0].message.content;
      setMedCode(medCodeTextResponse);

      const extraUserInputObj = {
        role: "assistant",
        content: "Analysis complete.",
      };
      setConversationArr((prevConversationArr) => [
        ...prevConversationArr,
        extraUserInputObj,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-row items-center justify-evenly min-h-screen px-4 mx-4 ">
      <div className="grid grid-cols-3 gap-4">
        <div className="doctext-area col-span-2 flex items-center justify-center">
          <div
            className="flex flex-col justify-center h-full w-full border-radius "
            style={{ paddingTop: "20px" }}
          >
            <textarea
              autoFocus
              id="doc-text-input"
              className="doc-notes-text h-full w-full flex-grow resize-none p-4"
              placeholder="Add medical note here..."
            />
          </div>
        </div>
        <div
          className="col-span-1 flex flex-col h-screen"
          style={{ paddingTop: "20px" }}
        >
          <div
            className="chat-area bg-slate-100 overflow-y-scroll h-screen "
            ref={chatAreaRef}
          >
            {/* this area shows a list of further questions for users, when click, it will send the question for api to get answer, after click it would disappear and if further question state variable is null it would not appear*/}

            <div className="chatbot-response">
              <div className="messages p-3">
                <div className="message">
                  <div className="flex justify-start">
                    <div className="message-content chatbot-text rounded-lg bg-blue-200 p-3 whitespace-pre-wrap">
                      <span>
                        Hello, I am your medical coding AI assistant. To begin,
                        please add your clinical note on the left and ask me to
                        analyze it.
                      </span>
                    </div>
                  </div>

                  {/* show the robot repsponse */}
                  {conversationArr &&
                    conversationArr.map((messageObj, index) => {
                      if (messageObj.role !== "system") {
                        // add different class name for different role
                        if (messageObj.role === "user") {
                          return (
                            <div key={index} className="flex justify-end">
                              <div className="message-content user-text rounded-lg bg-blue-400 ml-5 mt-3 p-3 whitespace-pre-wrap">
                                <span>{messageObj.content}</span>
                              </div>
                            </div>
                          );
                        } else if (messageObj.role === "assistant") {
                          return (
                            <div key={index} className="flex justify-start">
                              <div className="message-content chatbot-text rounded-lg bg-blue-200 mr-5 mt-3 p-3 whitespace-pre-wrap">
                                <span>{messageObj.content}</span>
                              </div>
                            </div>
                          );
                        }
                      } else {
                        return "";
                      }
                    })}
                </div>
              </div>
            </div>
          </div>

          <div className="predefined-questions bg-slate-100 overflow-visible flex justify-end">
            {predefinedQuestions &&
              predefinedQuestions.map((question, index) => {
                return (
                  <button
                    key={index}
                    className="predefined-question-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded text-left	"
                    // when click, change the current question's visibility to false

                    onClick={() => {
                      setQuestionVisibility([]);
                      console.log("here test: ", predefinedQuestions[0]);
                      if (
                        predefinedQuestions[0] ==
                        "According to this note I provided, analyze this patient's condition."
                      ) {
                        console.log(
                          "here test2: ",
                          Array(predefinedQuestions)[0]
                        );
                        fetchMedCode().then(() => {
                          console.log("test3");
                          setQuestionVisibility(Array(predefinedQuestions[0]));
                          setPredefinedQuestions(predefinedQuestions.slice(1));
                        });
                      } else {
                        fetchReply(question).then(() => {
                          setQuestionVisibility(Array(predefinedQuestions[0]));
                          setPredefinedQuestions(predefinedQuestions.slice(1));
                        });
                      }
                    }}
                    style={{
                      display: questionVisibility[index] ? "block" : "none",
                    }}
                  >
                    {question}
                  </button>
                );
              })}
          </div>

          <form id="form">
            <div className="chatbot-input-container flex justify-start">
              <textarea
                style={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  paddingTop: "10px ",
                  // minHeight: "100px",
                  overflow: "auto",
                }}
                onKeyDown={handleKeyDown}
                className="w-full resize-none"
                placeholder="Type your message here..."
                name="user-input"
                type="text"
                id="user-input"
                rows={1}
                required
              />
              <span
                onClick={submitUserInput}
                className="submit-btn p-3 bg-green-400"
                style={{
                  margin: "10px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <SendIcon
                  style={{
                    color: "white",
                  }}
                />
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
