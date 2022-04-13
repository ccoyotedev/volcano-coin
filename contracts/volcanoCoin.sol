// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VolcanoCoin is ERC20, Ownable {
    struct Payment {
        uint256 amount;
        address recipient;
    }

    uint256 private constant INITIAL_SUPPLY = 10000;

    event SupplyUpdated(uint256);

    mapping(address => Payment[]) public payments;

    constructor() ERC20("Volcano Coin", "VOC") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function increaseSupply(uint256 _quantity) public onlyOwner {
        _mint(msg.sender, _quantity);
        emit SupplyUpdated(_quantity);
    }

    function _afterTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override {
        _recordPayment(_from, _to, _amount);
    }

    function _recordPayment(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        payments[_from].push(Payment({amount: _amount, recipient: _to}));
    }
}
