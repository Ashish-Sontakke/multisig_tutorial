// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract MultisigWallet {
    event NewProposal(uint256 proposalId, address creator, string info);

    // address[] public owners;

    mapping(address => bool) public isOwner;
    uint256 public noOfOwners;

    uint256 public counter;

    // {
    //     "a": false,
    //     "b": false,
    // }

    address public authority;

    struct Proposal {
        address proposalOwner;
        address to;
        uint256 amount;
        string info;
        uint256 confirmations;
        bool executed;
    }

    // proposalID => ownerAddress => votedOrNot
    mapping(uint256 => mapping(address => bool)) public voted;

    Proposal[] public proposals;
    mapping(uint256 => Proposal) proposalsMapping;

    constructor() {
        authority = msg.sender;
    }

    receive() external payable {}

    fallback() external payable {}

    modifier onlyAuthority() {
        require(msg.sender == authority, "ACCESS_DENIED");
        _;
    }

    modifier onlyOwners() {
        require(isOwner[msg.sender], "NOT_OWNER");
        _;
    }

    // checks effects interactions

    function addNewOwner(address newOwner) public onlyAuthority {
        require(newOwner != address(0), "INVALID_ADDRESS");
        require(!isOwner[newOwner], "ALREADY_OWNER");
        noOfOwners += 1;
        isOwner[newOwner] = true;
    }

    function removeOwner(address who) public onlyAuthority {
        require(isOwner[who], "NOT_OWNER");
        noOfOwners -= 1;
        isOwner[who] = false;
    }

    function submitProposal(
        address _to,
        uint256 _amount,
        string memory _info
    ) public payable onlyOwners returns (uint256) {
        require(_amount > 0, "INVALID_AMOUNT");
        require(_to != address(0), "INVALID_ADDRESS");

        proposals.push(
            Proposal({
                proposalOwner: msg.sender,
                to: _to,
                amount: _amount,
                info: _info,
                confirmations: 0,
                executed: false
            })
        );

        // to add this proposal in hashmap
        proposalsMapping[counter] = Proposal({
            proposalOwner: msg.sender,
            to: _to,
            amount: _amount,
            info: _info,
            confirmations: 0,
            executed: false
        });
        counter++;
        // return counter - 1;

        emit NewProposal(proposals.length - 1, msg.sender, _info);
        return proposals.length - 1;
    }

    function accept(uint256 proposalId) public onlyOwners {
        require(proposalId < proposals.length, "DOES_NOT_EXIST");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "ALREADY_ECECUTED");
        require(!voted[proposalId][msg.sender], "ALREADY_VOTED");
        proposal.confirmations += 1;
        voted[proposalId][msg.sender] = true;
    }

    // check effect intreactions
    function execute(uint256 proposalId) public onlyOwners {
        require(proposalId < proposals.length, "DOES_NOT_EXIST");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "ALREADY_ECECUTED");
        require(proposal.proposalOwner == msg.sender, "NOT_PROPOSAL_OWNER");
        require(
            proposal.amount < address(this).balance,
            "INSUFFICIENT_BALANCE"
        );
        // did this proposal get mejority
        require(proposal.confirmations > noOfOwners / 2, "CAN_NOT_EXECUTE");
        proposal.executed = true;

        payable(proposal.to).transfer(proposal.amount);
    }
}
