import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    caption: {
      type: String,
    },
    image: {
      type: String, // Storing the path to the image
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
