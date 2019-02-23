const PaymentsContract = artifacts.require('../contracts/Payments');

const chai = require('chai');
const bnChai = require('bn-chai');
const { expect } = chai;
const { expectThrow } = require('./helpers/expectThrow')
chai.use(bnChai(web3.utils.BN));

const EVMRevert = "revert";

contract("Payments", function(accounts) {
  // accounts
  const owner = accounts[0];
  const newOwner = accounts[1];
  const user1 = accounts[2];
  const user2 = accounts[3];
  const anyone = accounts[4];

  // balances / transfer amounts
  const amount = web3.utils.toWei('1', 'ether');  // amt to add to user account
  const greaterAmount = amount + 1;               // amt > than the user's added balance

  // Event strings
  const authAddedEvent = "AuthAdded";
  const authRemovedEvent = "AuthRemoved";
  const fundsAddedEvent = "FundsAdded";
  const fundsBurnedEvent = "FundsBurned";
  const FundsTransferredEvent = "FundsTransferred";

  // Contract
  let Payments;

  // Transaction receipts
  let addAuthTx;
  let removeAuthTx;
  let addFundsTx;
  let transferFundsTx;
  let burnFundsTx;


  beforeEach("Instantiate Contracts", async() => {
    Payments = await PaymentsContract.new({from: owner});
  });


  it("Check contract constructor", async() => {
    // check that contract is created as expected
    // owner should be set on deploy
    expect(await Payments.authorized(owner), "owner not set correctly").to.be.true;
    expect(await Payments.authorized(anyone), "authorization not initialized correctly").to.be.false;
  });


  it("Check owner functionality", async() => {
    // check that authorized users can mint funds, burn funds, and add other authorized users
    // check that un-authorized users can not do these things

    // check that non-owners can not use authorized functions
    await expectThrow(Payments.addFunds(user1, amount, {from: newOwner}), EVMRevert);
    await expectThrow(Payments.addAuthorized(anyone, {from: newOwner}), EVMRevert);
    await expectThrow(Payments.removeAuthorized(owner, {from: newOwner}), EVMRevert);

    // check that owner can successfully add new owners
    addAuthTx = await Payments.addAuthorized(newOwner, {from: owner});
    expect(await Payments.authorized(newOwner), "addAuthorized failed").to.be.true;

    // check that newly added owner can use authorized functions
    removeAuthTx = await Payments.removeAuthorized(owner, {from: newOwner});
    expect(await Payments.authorized(owner), "removeAuthorized failed").to.be.false;

  });


  it("Check minting and burning functionality", async() => {
    // check that owners can mint and burn user balances    

    // assert inital balance is 0
    expect(await Payments.balances(user1)).to.eq.BN(0, "inital balance not zero");

    // check that authorized user can add to user's account
    addFundsTx = await Payments.addFunds(user1, amount, {from: owner});
    expect(await Payments.balances(user1)).to.eq.BN(amount, "addFunds failed");

    // check that authorized user can burn user's funds
    burnFundsTx = await Payments.burnFunds(user1, amount, {from: owner});
    expect(await Payments.balances(user1)).to.eq.BN(0, "burn funds failed");

  });


  it("Check transfer functionality", async() => {
    // check that users can transfer their funds successfully

    // add funds to user's account
    await Payments.addFunds(user1, amount, {from: owner});

    // check that user can't transfer more than added balance
    await expectThrow(Payments.transferFunds(user2, greaterAmount, {from: user1}), EVMRevert);

    // transfer funds to another user
    transferFundsTx = await Payments.transferFunds(user2, amount, {from: user1});

    // check that sender's balance is deducted
    expect(await Payments.balances(user1)).to.eq.BN(0, "transferred balance not deducted");

    // check that recipient's balance is added
    expect(await Payments.balances(user2)).to.eq.BN(amount, "funds not transferred");

  });


  it("Check events emission", () => {
    // check events from adding authorized user
    expect(addAuthTx.logs[0].event).to.equal(authAddedEvent, "authAdded event not emitted");
    expect(addAuthTx.logs[0].args.adder).to.equal(owner, "authAdded event incorrect adder");
    expect(addAuthTx.logs[0].args.added).to.equal(newOwner, "authAdded event incorrect added");

    // check events from removing authorized user
    expect(removeAuthTx.logs[0].event).to.equal(authRemovedEvent, "authRemoved event not emitted");
    expect(removeAuthTx.logs[0].args.remover).to.equal(newOwner, "authRemoved event incorrect remover");
    expect(removeAuthTx.logs[0].args.removed).to.equal(owner, "authRemoved event incorrect removed");

    // check events from adding funds to user's account
    expect(addFundsTx.logs[0].event).to.equal(fundsAddedEvent, "fundsAdded event not emitted");
    expect(addFundsTx.logs[0].args.recipient).to.equal(user1, "fundsAdded event incorrect recipient");
    expect(addFundsTx.logs[0].args.minter).to.equal(owner, "fundsAdded event incorrect minter");
    expect(addFundsTx.logs[0].args.amount).to.eq.BN(amount, "fundsAdded event incorrect amount");

    // check events from transferring funds
    expect(transferFundsTx.logs[0].event).to.equal(FundsTransferredEvent, "fundsTransferred event not emitted");
    expect(transferFundsTx.logs[0].args.sender).to.equal(user1, "fundsTransferred event incorrect sender");
    expect(transferFundsTx.logs[0].args.recipient).to.equal(user2, "fundsTransferred event incorrect recipient");
    expect(transferFundsTx.logs[0].args.amount).to.eq.BN(amount, "fundsTransferred event incorrect amount");

    // check events from burning funds from user's account
    expect(burnFundsTx.logs[0].event).to.equal(fundsBurnedEvent, "fundsBurned event not emitted");
    expect(burnFundsTx.logs[0].args.holder).to.equal(user1, "fundsBurned event incorrect holder");
    expect(burnFundsTx.logs[0].args.burner).to.equal(owner, "fundsBurned event incorrect burner");
    expect(burnFundsTx.logs[0].args.amount).to.eq.BN(amount, "fundsBurned event incorrect amount");

  });
});