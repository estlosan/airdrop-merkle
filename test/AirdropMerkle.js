const should = require('chai').should();
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { buildMerkleTree, generateHash } = require('./helpers/helpers');
const msgErrors = require('./helpers/msgErrors');

const AirdropMerkle = artifacts.require('AirdropMerkle');
const ERC20Token = artifacts.require('ERC20Token');

const ONE_ETHER = new BN('1000000000000000000');

contract('AirdropMerkle', ([owner, user, ...accounts]) => {
    const users = [accounts[0], accounts[1], accounts[2], accounts[3]];
    const amounts = [ONE_ETHER, ONE_ETHER.mul(new BN('2')), ONE_ETHER.mul(new BN('3')), ONE_ETHER.mul(new BN('4'))];
    let airdropMerkle, erc20Token;
    beforeEach('Deploy contracts', async () => {
        const merkleRoot = `0x${'0'.repeat(64)}`;
        const transferAmount = ONE_ETHER.mul(new BN(`50`));
        erc20Token = await ERC20Token.new({ from: owner });
        airdropMerkle = await AirdropMerkle.new(merkleRoot, erc20Token.address, { from: owner });
        await erc20Token.transfer(airdropMerkle.address, transferAmount, { from: owner });
    })
    describe('Deploy test', () => {
        it("Should deploy contract", async () => {
            const erc20Name = 'ERC20Token';
            (await erc20Token.name()).should.be.equal(erc20Name);
        })
    })
    describe('Set functions', () => {
        it(("Should allow change token address with owner"), async () => {
            await airdropMerkle.setTokenContract(accounts[0], { from: owner });
            (await airdropMerkle.tokenContract()).should.be.equal(accounts[0]);
        })
        it(("Should deny change token address with user"), async () => {
            await expectRevert(
                airdropMerkle.setTokenContract(accounts[0], { from: user }),
                msgErrors.owner
            );
        })
        it(("Should allow change merkle root with owner"), async () => {
            const merkleRoot = `0x${'1'.repeat(64)}`;
            await airdropMerkle.setMerkleRoot(merkleRoot, { from: owner });
            (await airdropMerkle.merkleRoot()).should.be.equal(merkleRoot);
        })
        it(("Should deny change merke root with user"), async () => {
            const merkleRoot = `0x${'1'.repeat(64)}`;
            await expectRevert(
                airdropMerkle.setMerkleRoot(merkleRoot, { from: user }),
                msgErrors.owner
            );
        })
    })
    describe('Claim merkle amounts', () => {
        let merkleTree;
        beforeEach(('Merkle Tree init'), async () => {
            merkleTree = buildMerkleTree(users, amounts);
            const merkleRoot = merkleTree.getHexRoot();
            await airdropMerkle.setMerkleRoot(merkleRoot, { from: owner });
        })
        it(("Should allow claim with account[0]"), async () => {
            const claimer = accounts[0];
            const userIndex = 0;
            const userLeaf = generateHash(users[userIndex], amounts[userIndex]);
            const proof = merkleTree.getHexProof(userLeaf);
            const amount = amounts[userIndex];
            const claimerAmount = await erc20Token.balanceOf(claimer)
    
            await airdropMerkle.claimTokensByMerkleProof(
                proof,
                amount,
                { from: claimer }
            );
            (await erc20Token.balanceOf(claimer)).should.be.bignumber.equal(claimerAmount.add(amount));
        })
        it(("Should deny claim multiple times with account[0]"), async () => {
            const userIndex = 0;
            const claimer = accounts[0];
            const userLeaf = generateHash(users[userIndex], amounts[userIndex]);
            const proof = merkleTree.getHexProof(userLeaf);
            const amount = amounts[userIndex];
    
            await airdropMerkle.claimTokensByMerkleProof(
                proof,
                amount,
                { from: claimer }
            );

            await expectRevert(
                airdropMerkle.claimTokensByMerkleProof(
                    proof,
                    amount,
                    { from: claimer }
                ),
                msgErrors.alreadyClaimed
            );
        })
        it(("Should deny claim more then available with account[0]"), async () => {
            const userIndex = 0;
            const claimer = accounts[0];
            const userLeaf = generateHash(users[userIndex], amounts[userIndex]);
            const proof = merkleTree.getHexProof(userLeaf);
            const amount = amounts[userIndex].mul(ONE_ETHER);

            await expectRevert(
                airdropMerkle.claimTokensByMerkleProof(
                    proof,
                    amount,
                    { from: claimer }
                ),
                msgErrors.badProof
            );
        })
        it(("Should deny claim with unexistant user inside merkle tree"), async () => {
            const userIndex = 0;
            const userLeaf = generateHash(users[userIndex], amounts[userIndex]);
            const proof = merkleTree.getHexProof(userLeaf);
            const amount = amounts[userIndex];

            await expectRevert(
                airdropMerkle.claimTokensByMerkleProof(
                    proof,
                    amount,
                    { from: user }
                ),
                msgErrors.badProof
            );
        })
    })
})