// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.1.0


pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}


// File src/PriceOracle.sol

pragma solidity ^0.8.0;

/**
 * @title PriceOracle contract
 * @author The Btfs Authors
 * @dev The price oracle contract keeps track of the current prices for settlement.
 */
contract PriceOracle is Ownable {
    /**
     * @dev Emitted when the price is updated.
     */
    event PriceUpdate(uint256 price);
    /**
     * @dev Emitted when the rate is updated.
     */
    event ExchangeRateUpdate(uint256 rate);

    // current price in wei per GB/month
    uint256 public price;
    // current rate
    uint256 public exchangeRate;

    constructor(uint256 _price, uint256 _exchangeRate) {
        price = _price;
        exchangeRate = _exchangeRate;
    }

    /**
     * @notice Returns the current price in wei per GB/month
     */
    function getPrice() external view returns (uint256) {
        return price;
    }

    /**
     * @notice Returns the rate of price
     */
    function getExchangeRate() external view returns (uint256) {
        return exchangeRate;
    }

    /**
     * @notice Update the price. Can only be called by the owner.
     * @param newPrice the new price
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
        emit PriceUpdate(price);
    }

    /**
     * @notice Update the rate. Can only be called by the owner.
     * @param newRate the new rate
     */
    function updateExchangeRate(uint256 newRate) external onlyOwner {
        exchangeRate = newRate;
        emit ExchangeRateUpdate(newRate);
    }
}