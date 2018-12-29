import React, { Component } from 'react';
import moment from 'moment';
    
class ChatMessage extends Component {

    render() {

        // included position in props so that other people's messages will appear on the opposite side like a normal chat app
        const { position = 'left', message, timestamp } = this.props;
        const isRight = position.toLowerCase() === 'right';
        
        // checks to see if text position is right or left and sets the align and justify values to use in classNames
        const align = isRight ? 'text-right' : 'text-left';
        const justify = isRight ? 'justify-content-end' : 'justify-content-start';
        
        const messageBoxStyles = {
            maxWidth: '70%',
            flexGrow: 0
        };
        
        const messageStyles = {
            fontWeight: 500,
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap'
        };

        const timeStyles = {
            fontWeight: 300,
            padding: 8
        }
        
        return ( 
            <div className={`w-100 my-1 d-flex ${justify}`}>
                <div className="bg-light rounded border border-gray p-2" style={messageBoxStyles}>
                    <span className={`d-block text-secondary ${align}`} style={messageStyles}>
                        {message}
                    </span>
                </div>
                <div style={timeStyles}>{moment(timestamp).format('h:mm a')}</div>
            </div>
        )
    
    }
    
}

export default ChatMessage;