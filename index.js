// Load environment variables from .env file
require('dotenv').config();

// Import mongoose
const mongoose = require('mongoose');

// ------------------------------
// 1. Connect to MongoDB Atlas
// ------------------------------
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Get the default connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB Atlas');
});

// ------------------------------
// 2. Define Person Schema & Model
// ------------------------------
// Define the schema with required fields, types, and validators
const personSchema = new mongoose.Schema({
  name: { type: String, required: true },      // required field
  age: Number,                                  // optional number
  favoriteFoods: [String]                       // array of strings
});

// Create the Person model from the schema
const Person = mongoose.model('Person', personSchema);

// ------------------------------
// 3. Create and Save a Single Record
// ------------------------------
function createAndSavePerson(done) {
  // Create an instance of Person
  const person = new Person({
    name: 'Alice',
    age: 25,
    favoriteFoods: ['pizza', 'pasta']
  });

  // Save the document to the database
  person.save((err, data) => {
    if (err) return done(err);
    done(null, data);
  });
}

// ------------------------------
// 4. Create Many Records with Model.create()
// ------------------------------
function createManyPeople(arrayOfPeople, done) {
  // Model.create() accepts an array of objects and saves them all
  Person.create(arrayOfPeople, (err, people) => {
    if (err) return done(err);
    done(null, people);
  });
}

// ------------------------------
// 5. Find all people with a given name
// ------------------------------
function findPeopleByName(personName, done) {
  Person.find({ name: personName }, (err, people) => {
    if (err) return done(err);
    done(null, people);
  });
}

// ------------------------------
// 6. Find one person who likes a certain food
// ------------------------------
function findOneByFood(food, done) {
  // Search for a person whose favoriteFoods array contains 'food'
  Person.findOne({ favoriteFoods: food }, (err, person) => {
    if (err) return done(err);
    done(null, person);
  });
}

// ------------------------------
// 7. Find a person by _id
// ------------------------------
function findPersonById(personId, done) {
  Person.findById(personId, (err, person) => {
    if (err) return done(err);
    done(null, person);
  });
}

// ------------------------------
// 8. Classic Update: Find -> Edit -> Save
// Adds "hamburger" to favoriteFoods
// ------------------------------
function findEditThenSave(personId, done) {
  Person.findById(personId, (err, person) => {
    if (err) return done(err);

    // Add "hamburger" to the favoriteFoods array
    person.favoriteFoods.push('hamburger');
    // Since favoriteFoods is defined as [String] (not Mixed), markModified is NOT needed.
    // Save the updated document
    person.save((err, updatedPerson) => {
      if (err) return done(err);
      done(null, updatedPerson);
    });
  });
}

// ------------------------------
// 9. New Update using findOneAndUpdate()
// Find a person by name and set age to 20, return the updated document
// ------------------------------
function findAndUpdate(personName, done) {
  // Options: { new: true } returns the modified document instead of the original
  Person.findOneAndUpdate(
    { name: personName },
    { age: 20 },
    { new: true },
    (err, updatedPerson) => {
      if (err) return done(err);
      done(null, updatedPerson);
    }
  );
}

// ------------------------------
// 10. Delete one document by _id using findByIdAndRemove()
// ------------------------------
function removeById(personId, done) {
  Person.findByIdAndRemove(personId, (err, removedPerson) => {
    if (err) return done(err);
    done(null, removedPerson);
  });
}

// ------------------------------
// 11. Delete many documents where name is "Mary"
// Note: Model.remove() is deprecated, but used here as per instructions.
// Modern Mongoose uses deleteMany().
// ------------------------------
function removeManyPeople(done) {
  Person.remove({ name: 'Mary' }, (err, result) => {
    if (err) return done(err);
    // result contains { n: number of deleted, ok: 1 }
    done(null, result);
  });
}

// ------------------------------
// 12. Chain query helpers: find people who like "burritos"
// Sort by name, limit to 2, exclude age field
// ------------------------------
function queryChain(done) {
  Person.find({ favoriteFoods: 'burritos' })
    .sort({ name: 1 })          // ascending order by name
    .limit(2)                   // only two documents
    .select({ age: 0 })         // exclude the age field
    .exec((err, data) => {
      if (err) return done(err);
      done(null, data);
    });
}

// ------------------------------
// Export all functions for testing (if needed)
// ------------------------------
module.exports = {
  createAndSavePerson,
  createManyPeople,
  findPeopleByName,
  findOneByFood,
  findPersonById,
  findEditThenSave,
  findAndUpdate,
  removeById,
  removeManyPeople,
  queryChain
};