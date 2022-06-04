const {User} = require('../models');
const {AuthenticationError} = require('apollo-server-express');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user){
                return User.findOne({ _id: context.user._id});
            }
            throw new AuthenticationError('please log in.');
        }
    },
    Mutation: {
        login: async(parent, {email,password}) => {
            const user = await User.findOne({email});
            if(!user){
                throw new AuthenticationError('unable to find user');
            }
            const correct = await user.isCorrectPassword(password);
            
            if(!correct){
                throw new AuthenticationError('wrong password');
            }
            const token = signToken(user);
            return{ token, user};
        },
        addUser: async (parent,{username,email,password}) =>{
            const user = await User.create({username,email,password});
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async (parent, {book}, context) => {
            if(context.user){
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: book}},
                    {new: true},
                )
            }
            throw new AuthenticationError('please login');
        },
        removeBook: async (parent, {bookId}, context) =>{
            if(context.user){
                return User.findOneAndUpdate(
                    {_id: contex.user._id},
                    {$pull:{ savedBooks: {bookId}}},
                    {new: true},
                )
            }
            throw new AuthenticationError('please login');
        }
    }
};

module.exports = resolvers;