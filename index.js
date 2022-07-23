const { ApolloServer, gql } = require('apollo-server');

const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
let words = [];

let current_word = { text: null };
let last_word_selection = new Date();

const fetchWords = async () => {
  for (const letter of alphabet) {
    const res = await fetch("https://api.datamuse.com/words?sp=" + letter.toLowerCase() + "????&max=1000");
    for(const res_json of await res.json()) {
      words = words.concat(res_json.word.toUpperCase().toString());
    }
  }
};

const getCurrentWord = () => {
  let current_time = new Date();
  let diff = current_time.getTime() - last_word_selection.getTime();
  let hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  let minutes = Math.floor(diff / 1000 / 60);

  if(current_word.text === null || minutes >= 1) {
    current_word.text = words[Math.floor(Math.random() * words.length)];
    console.log(hours, minutes);
    last_word_selection = current_time;
  }

  return current_word;
};

const typeDefs = gql`
  type Word {
      text: String!
  }
  
  type Query {
      getWord: Word!
      getWords: [String!]!
  }
`;

const resolvers = {
  Query: {
    getWord: () => getCurrentWord(),
    getWords: () => words
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

fetchWords().then(r => {
  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}).catch(reason => {
  console.log("Unable to fetch words:", reason);
});