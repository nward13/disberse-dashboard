const PaymentsContract = artifacts.require("./Payments.sol");

module.exports = function(deployer) {
  deployer.deploy(PaymentsContract);
};
