import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const accBob = await stdlib.newTestAccount(startingBalance);
const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(6000));

const choiceArray = ["I'm not here", "I'm still here"];

console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const getBalance = async (who) => stdlib.formatCurrency((await stdlib.balanceOf(who)));

console.log(`Alice's balance before is: ${await getBalance(accAlice)}`);
console.log(`Bob's balance before is: ${await getBalance(accBob)}`);

const Shared = () => ({
  showTime : (t) => {
    console.log(parseInt(t));
  },
});

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...Shared(),
    // implement Alice's interact object here
    inherit : stdlib.parseCurrency(1000),
    getChoice : () => {
      const choice = Math.floor(Math.random() * 2);
      console.log(`Alice's choice is ${choiceArray[choice]}`);

      return ( choice == 0 ? false : true);
    },
  }),

  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...Shared(),
    acceptTerms : (num) => {
      console.log(`Bob accepts the terms of The Vault for ${stdlib.formatCurrency(num)}`);
      return true;
    }
    // implement Bob's interact object here
  }),
]);


console.log(`Alice's balance after is: ${await getBalance(accAlice)}`);
console.log(`Bob's balance after is: ${await getBalance(accBob)}`);

console.log('Goodbye, Alice and Bob!');
