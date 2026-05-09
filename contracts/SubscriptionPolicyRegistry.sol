// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SubscriptionPolicyRegistry {
    enum Decision {
        None,
        Renew,
        Pause,
        Reject,
        AskUser
    }

    struct Subscription {
        address owner;
        string serviceName;
        string category;
        uint256 amount;
        string currency;
        string billingCycle;
        uint256 nextRenewalDate;
        bool active;
        string storageRootHash;
        bytes32 analysisHash;
        Decision latestDecision;
        uint256 createdAt;
        uint256 updatedAt;
    }

    uint256 private _nextSubscriptionId;
    mapping(uint256 => Subscription) private _subscriptions;
    mapping(address => uint256[]) private _userSubscriptions;

    event SubscriptionAdded(address indexed user, uint256 indexed subId, string serviceName);
    event AnalysisRecorded(address indexed user, uint256 indexed subId, bytes32 analysisHash, string storageRootHash);
    event RenewalDecisionRecorded(address indexed user, uint256 indexed subId, Decision decision);
    event SubscriptionStorageUpdated(address indexed user, uint256 indexed subId, string storageRootHash);

    modifier onlyOwnerOf(uint256 subId) {
        require(_subscriptions[subId].owner != address(0), "Subscription does not exist");
        require(_subscriptions[subId].owner == msg.sender, "Not subscription owner");
        _;
    }

    function addSubscription(
        string memory serviceName,
        string memory category,
        uint256 amount,
        string memory currency,
        string memory billingCycle,
        uint256 nextRenewalDate,
        string memory storageRootHash
    ) public returns (uint256) {
        require(bytes(serviceName).length > 0, "Missing service name");
        require(bytes(category).length > 0, "Missing category");
        require(amount > 0, "Amount must be positive");
        require(nextRenewalDate > 0, "Missing renewal date");

        uint256 subId = _nextSubscriptionId;
        _nextSubscriptionId += 1;

        _subscriptions[subId] = Subscription({
            owner: msg.sender,
            serviceName: serviceName,
            category: category,
            amount: amount,
            currency: currency,
            billingCycle: billingCycle,
            nextRenewalDate: nextRenewalDate,
            active: true,
            storageRootHash: storageRootHash,
            analysisHash: bytes32(0),
            latestDecision: Decision.None,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _userSubscriptions[msg.sender].push(subId);

        emit SubscriptionAdded(msg.sender, subId, serviceName);
        return subId;
    }

    function recordAnalysis(
        uint256 subId,
        bytes32 analysisHash,
        string memory storageRootHash
    ) public onlyOwnerOf(subId) {
        require(analysisHash != bytes32(0), "Missing analysis hash");

        Subscription storage subscription = _subscriptions[subId];
        subscription.analysisHash = analysisHash;
        subscription.storageRootHash = storageRootHash;
        subscription.updatedAt = block.timestamp;

        emit AnalysisRecorded(msg.sender, subId, analysisHash, storageRootHash);
    }

    function recordDecision(uint256 subId, Decision decision) public onlyOwnerOf(subId) {
        require(decision != Decision.None, "Invalid decision");

        Subscription storage subscription = _subscriptions[subId];
        subscription.latestDecision = decision;
        subscription.updatedAt = block.timestamp;

        emit RenewalDecisionRecorded(msg.sender, subId, decision);
    }

    function updatePolicyStorage(uint256 subId, string memory storageRootHash) public onlyOwnerOf(subId) {
        require(bytes(storageRootHash).length > 0, "Missing storage root hash");

        Subscription storage subscription = _subscriptions[subId];
        subscription.storageRootHash = storageRootHash;
        subscription.updatedAt = block.timestamp;

        emit SubscriptionStorageUpdated(msg.sender, subId, storageRootHash);
    }

    function getSubscription(uint256 subId) public view returns (Subscription memory) {
        require(_subscriptions[subId].owner != address(0), "Subscription does not exist");
        return _subscriptions[subId];
    }

    function getUserSubscriptions(address user) public view returns (uint256[] memory) {
        return _userSubscriptions[user];
    }

    function nextSubscriptionId() public view returns (uint256) {
        return _nextSubscriptionId;
    }
}
