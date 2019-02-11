pragma solidity ^0.5.2;
 
import "./Authorization.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Payments is Authorization {

    // library to provide arithmetic with integer overflow / underflow checking
    using SafeMath for uint256;

    event FundsTransferred(
        address indexed sender,
        address indexed recipient,
        uint amount
    );

    event FundsAdded(
        address indexed recipient,
        address indexed minter,
        uint amount
    );

    event FundsBurned(
        address indexed holder,
        address indexed burner,
        uint amount
    );

    // track users' balances
    mapping (address => uint) public balances;

    uint public num = 3;

    /**
    * @dev Allows user to transfer funds to another address
    * @param recipient The recipient of the transfer
    * @param amount Amount to transfer
    * @return boolean indicating success of the transfer
    */
    function transferFunds(address recipient, uint amount) external returns (bool) {
        // deduct balance from sender. Note that this also asserts that
        // the sender has sufficient funds by checking for integer underflow
        balances[msg.sender] = balances[msg.sender].sub(amount);

        // add to recipient's balance
        balances[recipient] = balances[recipient].add(amount);

        emit FundsTransferred(msg.sender, recipient, amount);
        return true;
    }

    /**
    * @dev Allows authorized addresses to mint funds to a user's account,
    * simulating an equivalent deposit with Disberse
    * @param recipient The address to mint funds to
    * @param amount Amount of funds to mint
    * @return boolean indicating success
    */
    function addFunds(address recipient, uint amount) external auth returns (bool) {
        balances[recipient] = balances[recipient].add(amount);
        emit FundsAdded(recipient, msg.sender, amount);
        return true;
    }

    /**
    * @dev Allows authorized addresses to burn funds from a user's account,
    * simulating an equivalent withdrawal with Disberse
    * @param holder Address to burn the funds from
    * @param amount Amount of funds to burn
    * @return boolean indicating success
    */
    function burnFunds(address holder, uint amount) external auth returns (bool) {
        balances[holder] = balances[holder].sub(amount);
        emit FundsBurned(holder, msg.sender, amount);
        return true;
    }
}