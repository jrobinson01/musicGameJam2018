var config = {
  apiKey: 'AIzaSyAeX2htet4wSgGACsUGIyaH8OsjRUcwTk4',
  authDomain: 'dungeon-song.firebaseapp.com',
  databaseURL: 'https://dungeon-song.firebaseio.com',
  projectId: 'dungeon-song',
  storageBucket: '',
  messagingSenderId: '295269195511'
};
firebase.initializeApp(config);
const db = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

function saveHighScore(name, score) {
  db.collection('scores').add({name, score: parseInt(score)});
}

function fetchHighScores(limit) {
  if (limit) {
    return db
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
  }
  return db
    .collection('scores')
    .orderBy('score', 'desc')
    .get();
}

export {saveHighScore, fetchHighScores};
