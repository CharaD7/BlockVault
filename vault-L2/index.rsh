'reach 0.1';

const TIMED = 10;
const ICommon = {
  /**
  * @param displayTime : UInt
  *
  * Show the timeout for decision making to participants
  */
  displayTime : Fun([UInt], Null),
}

export const main = Reach.App(() => {
  const A = Participant('Alice', {
    // Specify Alice's interact interface here
    ...ICommon,
    /**
    * @returns value: UInt
    * @returns switch: Bool
    * -> inherit: UInt
    * -> getSwitch: Bool
    *
    * The conditions of The Vault are satisfied
    */
    inherit : UInt,
    getSwitch : Fun([Bool], Bool),
  });

  const B = Participant('Bob', {
    // Specify Bob's interact interface here
    ...ICommon,
    /**
    * @returns termsAcceptance: Bool
    * -> tNa: Bool
    */
    tNa : Fun([UInt], Bool),
  });
  init();


  // The first one to publish deploys the contract
  A.only(() => {
    const amount = declassify(interact.inherit);
  })
  A.publish(amount)
    .pay(amount)
  commit();

  // The second one to publish always attaches
  B.only(() => {
    const agreed = declassify(interact.tNa(amount));
  })
  B.publish(agreed);
  commit();


  // Show the time to both participants
  each([A, B], () => {
    interact.displayTime(TIMED);
  })

  // transfer amount based on Alice's switch
  A.only(() => {
    const available = declassify(interact.getSwitch());
    if (!available) {
      exit();
    }
  })

  while (available) {

  }

  A.publish(available)

  if(available) {
    transfer(amount).to(A);
  } else {
    transfer(amount).to(B);
  }
  commit();

  // write your program here
  exit();
});
