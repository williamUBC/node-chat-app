const generateMessage = (username, text, color = 'black') => {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
        color
    }
};

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
};

module.exports = { 
    generateMessage,
    generateLocationMessage 
};