import { signToken, AuthenticationError } from '../services/auth.js';
import User from '../models/User.js';
const resolvers = {
    Query: {
        //             parent      args      context
        me: async (_, __, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            console.log(context.user._id);
            const user = await User.findById(context.user._id);
            console.log(user);
            return user;
        },
    },
    Mutation: {
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        addUser: async (_, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_, { bookData }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            return await User.findByIdAndUpdate(context.user._id, { $addToSet: { savedBooks: bookData } }, { new: true, runValidators: true }).populate('savedBooks');
        },
        removeBook: async (_, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            return await User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true }).populate('savedBooks');
        },
    },
};
export default resolvers;
