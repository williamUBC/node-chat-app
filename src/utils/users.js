const users = [];

// addUser, removeUser, getUser, getUsersInRoom
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })
    
    // Checking for existing user
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    }) // if index is -1, it did not find; if index is 0 or larger number, it did find
    if (index !== -1) {
        return users.splice(index, 1)[0];// the return value of splice is an array of the data have been removed
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    return user;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user) => user.room === room);
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
// addUser({
//     id:22,
//     username: 'Bill',
//     room: 'Boston'
// });

// addUser({
//     id:23,
//     username: 'Bob',
//     room: 'Boston'
// });

// addUser({
//     id:21,
//     username: 'Bill',
//     room: 'Vancouver'
// });

// //console.log(users)
// console.log(getUsersInRoom('Vancouver'));

// const removedUser = removeUser(22);
// console.log(removedUser);
// console.log(users);