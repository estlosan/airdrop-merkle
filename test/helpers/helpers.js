const { soliditySha3 } = require('web3-utils');
const MerkleTree = require('./merkleTree');

const generateHash = (user, amount) => {
    const sender = user.toLowerCase();
    const hash = soliditySha3(
        {
        type: 'address',
        value: sender,
        },
        { type: 'uint256', value: amount }
    );
    return hash;
}

const buildMerkleTree = (users, amounts) => { 
    let leafsArray = []   ;
    if(users.length !== amounts.length) {
      return;
    }

    for (let i = 0; i < users.length; i++) {
      const hash = generateHash(users[i], amounts[i]);
      leafsArray.push(hash);
    }

    return new MerkleTree(leafsArray);
};

module.exports = {
    generateHash,
    buildMerkleTree
}