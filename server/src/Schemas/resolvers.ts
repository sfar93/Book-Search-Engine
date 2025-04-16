import { signToken, AuthenticationError } from '../services/auth.js';
import User from '../models/User.js';

interface bookData {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image: string;
  link: string;
}

const resolvers = {
  Query: {
    //             parent      args      context
    me: async (_: unknown, __: unknown, context: { user: { _id: string } }) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      console.log(context.user._id);
      const user = await User.findById(context.user._id)

      console.log(user)
      return user;
    },
  },
  Mutation: {
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
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
    addUser: async (_: unknown, { username, email, password }: { email: string; password: string, username: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (_:unknown, { bookData }: { bookData: bookData }, context: { user: { _id: string } }) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      ).populate('savedBooks');
    },
    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: { user: { _id: string } }) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');
    },
  },
};

export default resolvers;