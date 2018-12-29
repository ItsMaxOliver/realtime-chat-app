import React, { Component, Fragment } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import ChatMessage from './ChatMessage';

// set each sentiment emoji to an array of the required code points
const SAD_EMOJI = [55357, 56864];
const HAPPY_EMOJI = [55357, 56832];
const NEUTRAL_EMOJI = [55357, 56848];

class Chat extends Component {
    
    // initialize state with an empty chats array to hold all the messages as the keep coming
    state = {
        chats: []
    }

    componentDidMount() {
        // set up a Pusher connection and channelsubscription when the component mounts
        this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
            cluster: process.env.PUSHER_APP_CLUSTER,
            encrypted: true
        });

        // subscribing to a channel called chat-room
        this.channel = this.pusher.subscribe('chat-room');

        // binding the new-message event onto our chat-room which is triggered when a new chat comes in
        this.channel.bind('new-message', ({
            chat = null
        }) => {
            const { chats } = this.state;
            // appending the new chat and setting the new state
            chat && chats.push(chat);
            this.setState({ chats });
        });

        // binding to the connected event from Pusher client to fetch all messages
        this.pusher.connection.bind('connected', () => {
            axios.post('/messages')
                .then(response => {
                    const chats = response.data.messages;
                    // set the state with the chats we recieved in response to the axios post
                    this.setState({ chats });
                });
        });

    }

    // making sure we disconnect when component unmounts
    componentWillUnmount() {
        this.pusher.disconnect();
    }

    // event handler to send the chat message when the enter/return key is pressed without the shift key
    handleKeyUp = evt => {
        const value = evt.target.value;
        
        if (evt.keyCode === 13 && !evt.shiftKey) {
          
            // set the activeUser prop so that we can render
            const { activeUser: user } = this.props;
            
            // construct a chat object containing the user's info that is sending the message, the message content, and the timestamp for when the message was sent
            const chat = { 
                user, 
                message: value, 
                timestamp: +new Date 
            };
          
            // clean the textarea
            evt.target.value = '';
          
            // make a post request with the chat object
            axios.post('/message', chat);
        }
    }
      
    // when rendering the Chat component, we require an activeUser prop to identify the current user

    // then starting on line 98 go through each chat object from the state.chats and check to see if the sender is the same as the current user to determine the displayed position

    // then on line 108 used the sentiment score in the chat object to set the mood of the user to happy, sad, or neutral. A score greater than 0 gets happy, a score of 0 gets neutral, and any other score gets sad

    // then starting on line 113 render the name of the user based on one of the conditions that it is either the first message, or it directly follows another message from another user, or it has a delay of 1 minute from the previous message from the same user

    // on line 116 used the [String.fromCodePoint()] method to get the emoji's from the values defined in their respective arrays

    render() {
        return (this.props.activeUser && <Fragment>
        
            <div className="border-bottom border-gray w-100 d-flex align-items-center bg-white" style={{ height: 90 }}>
                <h2 className="text-dark mb-0 mx-4 px-2">{this.props.activeUser}</h2>
            </div>

            <div className="px-4 pb-4 w-100 d-flex flex-row flex-wrap align-items-start align-content-start position-relative" style={{ height: 'calc(100% - 180px)', overflowY: 'scroll' }}>
                
                {this.state.chats.map((chat, index) => {
        
                    const previous = Math.max(0, index - 1);
                    const previousChat = this.state.chats[previous];
                    const position = chat.user === this.props.activeUser ? "right" : "left";
                    
                    const isFirst = previous === index;
                    const inSequence = chat.user === previousChat.user;
                    const hasDelay = Math.ceil((chat.timestamp - previousChat.timestamp) / (1000 * 60)) > 1;
                    
                    const mood = chat.sentiment > 0 ? HAPPY_EMOJI : (chat.sentiment === 0 ? NEUTRAL_EMOJI : SAD_EMOJI);
                    
                    return (
                        <Fragment key={index}>
                        
                            { (isFirst || !inSequence || hasDelay) && (
                            <div className={`d-block w-100 font-weight-bold text-dark mt-4 pb-1 px-1 text-${position}`} style={{ fontSize: '0.9rem' }}>
                                <span className="d-block" style={{ fontSize: '1.6rem' }}>
                                {String.fromCodePoint(...mood)}
                                </span>
                                <span>{chat.user || 'Anonymous'}</span>
                            </div>
                            ) }
                            
                            <ChatMessage message={chat.message} position={position} />
                            
                        </Fragment>
                    );
                    
                })}

            </div>
          
            <div className="border-top border-gray w-100 px-4 d-flex align-items-center bg-light" style={{ minHeight: 90 }}>
                <textarea className="form-control px-3 py-2" onKeyUp={this.handleKeyUp} placeholder="Enter a chat message" style={{ resize: 'none' }}></textarea>
            </div>
          
        </Fragment> )
    }

}

export default Chat;