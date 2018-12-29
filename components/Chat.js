import React, { Component, Fragment } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

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
            this.setState({
                chats
            });
        });

        // binding to the connected event from Pusher client to fetch all messages
        this.pusher.connection.bind('connected', () => {
            axios.post('/messages')
                .then(response => {
                    const chats = response.data.messages;
                    // set the state with the chats we recieved in response to the axios post
                    this.setState({
                        chats
                    });
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
      
    // require an activeUser prop to identify the current user
    render() {
        return (this.props.activeUser && <Fragment>
        
            <div className="border-bottom border-gray w-100 d-flex align-items-center bg-white" style={{ height: 90 }}>
                <h2 className="text-dark mb-0 mx-4 px-2">{this.props.activeUser}</h2>
            </div>
          
            <div className="border-top border-gray w-100 px-4 d-flex align-items-center bg-light" style={{ minHeight: 90 }}>
                <textarea className="form-control px-3 py-2" onKeyUp={this.handleKeyUp} placeholder="Enter a chat message" style={{ resize: 'none' }}></textarea>
            </div>
          
        </Fragment> )
    }

}

export default Chat;