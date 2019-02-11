pragma solidity ^0.5.2;

/**
* @title Authorization
* @dev provides auth-protected functionality
*/
contract Authorization {

    event AuthAdded(
        address indexed added,
        address indexed adder
    );

    event AuthRemoved(
        address indexed removed,
        address indexed remover
    );

    // user address => auth. 1 = authorized, 0 = unauthorized
    mapping (address => uint) public authorized;

    // authorize deployer of the contract
    constructor() public { 
        authorized[msg.sender] = 1;
        emit AuthAdded(address(0), msg.sender);
    }

    // require authorization to call function
    modifier auth() {
        require(authorized[msg.sender] == 1);
        _;
    }

    /**
    * @dev Add user to authorized users. Can only be called by another
    * authorized user.
    * @param user the user to authorize
    */
    function addAuthorized(address user) external auth {
        authorized[user] = 1;
        emit AuthAdded(user, msg.sender);
    }

    /**
    * @dev Remove user's authorization. Can only be called by the same user
    * or another authorized user
    * @param user The user to de-authorize
    */
    function removeAuthorized(address user) external auth {
        authorized[user] = 0;
        emit AuthRemoved(user, msg.sender);
    }

}