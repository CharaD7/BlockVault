import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';

const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(10000);

console.log('Starting the DApp...');
const accBob = await stdlib.newTestAccount(startingBalance);
const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(20000));

const switches = ["I'm not here", "I'm still here"];

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const getBalance = async (who) => stdlib.formatCurrency((await stdlib.balanceOf(who)));

console.log(`Alice's balance at the start of the launch is ${await getBalance(accAlice)} ALGOs`);
console.log(`Bob's balance at the start of the launch is ${await getBalance(accBob)} ALGOs`);

const ICommon = () => ({
  displayTime : (time) => {
    console.log(`Time:`, parseInt(time));
  },
});

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    // implement Alice's interact object here
    ...stdlib.hasRandom,
    ...ICommon(),
    inherit : stdlib.parseCurrency(8000),
    getSwitch : () => {
      const isAliceAvailable = await ask(`Alice, are you here? y/n`, yesno);
      const aliceSwitch = isAliceAvailable ? 1 : 0;
      console.log(`Alice's choice ${switches[aliceSwitch]}`);

      return ( aliceSwitch == 0 ? false : true );
    },
  }),

  backend.Bob(ctcBob, {
    // implement Bob's interact object here
    ...stdlib.hasRandom,
    ...ICommon(),
    tNa : (amount) => {
      const agrees = ask(`Bob, do you accept the terms and conditions with ${stdlib.formatCurrency(amount)} ALGOs? y/n`, yesno);
      if (!agrees) {
        return false;
      }
      return true;
    }
  }),
]);

console.log(`Alice's balance at the end of the launch is ${await getBalance(accAlice)} ALGOs`);
console.log(`Bob's balance at the end of the launch is ${await getBalance(accBob)} ALGOs`);
